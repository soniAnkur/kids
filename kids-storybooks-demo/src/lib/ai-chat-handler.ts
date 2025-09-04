import { ChatMessage, StoryRequest, Child } from '@/types'
import { openai } from './ai-config'
import { getChildren, getPersonalityTraits, getInterests } from '@/actions/child-actions'
import { getStoryThemes } from '@/actions/story-actions'

interface AIResponse {
  content: string
  metadata?: {
    component?: string
    action?: string
    data?: any
  }
}

export async function processUserMessage(
  message: string,
  conversationHistory: ChatMessage[] = []
): Promise<AIResponse> {
  try {
    // Get context data
    const [children, themes] = await Promise.all([
      getChildren(),
      getStoryThemes()
    ])
    
    // Build system prompt
    const systemPrompt = buildSystemPrompt(children, themes)
    
    // Convert conversation history to OpenAI format
    const messages = [
      { role: 'system' as const, content: systemPrompt },
      ...conversationHistory.map(msg => ({
        role: msg.type === 'user' ? 'user' as const : 'assistant' as const,
        content: msg.content
      })),
      { role: 'user' as const, content: message }
    ]
    
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages,
      temperature: 0.7,
      max_tokens: 500,
      functions: [
        {
          name: 'create_story_request',
          description: 'Create a personalized story for a child',
          parameters: {
            type: 'object',
            properties: {
              childId: {
                type: 'string',
                description: 'ID of the child for whom to create the story'
              },
              theme: {
                type: 'string',
                description: 'Theme of the story (e.g., adventure, fantasy, space)'
              },
              customPrompt: {
                type: 'string',
                description: 'Any specific elements the user wants in the story'
              },
              preferredLength: {
                type: 'string',
                enum: ['short', 'medium', 'long'],
                description: 'Preferred length of the story'
              },
              educationalFocus: {
                type: 'array',
                items: { type: 'string' },
                description: 'Educational objectives to focus on'
              }
            },
            required: ['childId', 'theme']
          }
        }
      ],
      function_call: 'auto'
    })
    
    const choice = completion.choices[0]
    
    // Handle function call (story creation request)
    if (choice.message.function_call) {
      const functionCall = choice.message.function_call
      
      if (functionCall.name === 'create_story_request') {
        const args = JSON.parse(functionCall.arguments || '{}') as StoryRequest
        
        return {
          content: `Perfect! I'll create a ${args.theme} story for ${getChildName(args.childId, children)}. Let me start working on this magical adventure!`,
          metadata: {
            component: 'story-request',
            action: 'create',
            data: { ...args, preferredLength: args.preferredLength || 'medium' }
          }
        }
      }
    }
    
    // Regular chat response
    return {
      content: choice.message.content || "I'd love to help you create a story! Can you tell me more about what kind of adventure you have in mind?"
    }
    
  } catch (error) {
    console.error('AI chat processing error:', error)
    
    // Fallback to template responses
    return getFallbackResponse(message)
  }
}

function buildSystemPrompt(children: Child[], themes: any[]): string {
  const childrenInfo = children.map(child => 
    `- ${child.name} (age ${child.age}): Personality: ${child.personality.map(p => p.name).join(', ')}. Interests: ${child.interests.map(i => i.name).join(', ')}`
  ).join('\n')
  
  const themeOptions = themes.map(theme => 
    `- ${theme.name}: ${theme.description}`
  ).join('\n')
  
  return `You are a friendly AI storyteller assistant for KidsVerse, specializing in creating personalized children's stories. Your role is to:

1. Help parents create magical, educational stories for their children
2. Understand what kind of story they want to create
3. Gather the necessary information to personalize the story
4. Be enthusiastic and encouraging about storytelling

Available children:
${childrenInfo}

Available story themes:
${themeOptions}

When a user wants to create a story:
1. Help them choose a child and theme
2. Ask about any specific elements they want included
3. Once you have the child and theme, use the create_story_request function

Be conversational, friendly, and focused on creating magical experiences for children. Keep responses concise but enthusiastic.`
}

function getChildName(childId: string, children: Child[]): string {
  const child = children.find(c => c.id === childId)
  return child?.name || 'your child'
}

function getFallbackResponse(message: string): AIResponse {
  const lowerMessage = message.toLowerCase()
  
  if (lowerMessage.includes('story') || lowerMessage.includes('create') || lowerMessage.includes('generate')) {
    return {
      content: "I'd love to help you create a personalized story! Which child would you like me to create a story for, and what theme sounds exciting? We have adventures, fantasy tales, space missions, and many more magical themes to choose from!"
    }
  }
  
  if (lowerMessage.includes('help') || lowerMessage.includes('how')) {
    return {
      content: "I'm here to help you create amazing personalized stories for your children! Just tell me what kind of adventure you have in mind, and I'll create a magical tale featuring your child as the hero. What sounds fun to you?"
    }
  }
  
  return {
    content: "That sounds interesting! I'm here to help create personalized stories for your children. What kind of magical adventure would you like me to create today?"
  }
}