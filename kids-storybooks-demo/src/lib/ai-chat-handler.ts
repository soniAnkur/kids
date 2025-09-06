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

interface ExtractedStoryContent {
  characters: string[]
  relationships: string[]
  specificElements: string[]
  setting: string
  additionalDetails: string
}

async function extractStoryContentFromMessage(message: string): Promise<ExtractedStoryContent> {
  try {
    const extractionPrompt = `Analyze the following user message and extract meaningful story elements. The user wants to create a personalized story and may have mentioned specific characters, relationships, settings, or story elements.

User message: "${message}"

Extract and return ONLY a JSON object with these fields:
{
  "characters": ["character names mentioned like mom, dad, friends names, siblings, pets, etc."],
  "relationships": ["relationships mentioned like 'with mom', 'with best friend Sarah', 'with little sister', etc."],
  "specificElements": ["specific story elements like 'treasure hunt', 'magical forest', 'space adventure', etc."],
  "setting": "specific setting if mentioned like 'in the backyard', 'at the beach', 'in a castle', etc.",
  "additionalDetails": "any other meaningful details that should be included in the story"
}

Focus on extracting concrete, specific details that would make the story more personalized. If no specific elements are found for a category, use an empty array or empty string.`

    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [{ role: 'user', content: extractionPrompt }],
      temperature: 0.1,
      max_tokens: 300
    })

    const response = completion.choices[0].message.content
    if (response) {
      // Try to parse the JSON response
      try {
        return JSON.parse(response)
      } catch {
        // If JSON parsing fails, extract manually with regex patterns
        return extractStoryContentManually(message)
      }
    }
    
    return extractStoryContentManually(message)
  } catch (error) {
    console.error('Story content extraction error:', error)
    return extractStoryContentManually(message)
  }
}

function extractStoryContentManually(message: string): ExtractedStoryContent {
  const lowerMessage = message.toLowerCase()
  
  // Extract common relationship patterns
  const relationships = []
  if (lowerMessage.includes('with mom') || lowerMessage.includes('with mother')) relationships.push('with mom')
  if (lowerMessage.includes('with dad') || lowerMessage.includes('with father')) relationships.push('with dad')
  if (lowerMessage.includes('with friends')) relationships.push('with friends')
  if (lowerMessage.includes('with friend')) relationships.push('with friend')
  if (lowerMessage.includes('with sister')) relationships.push('with sister')
  if (lowerMessage.includes('with brother')) relationships.push('with brother')
  if (lowerMessage.includes('with grandma') || lowerMessage.includes('with grandmother')) relationships.push('with grandma')
  if (lowerMessage.includes('with grandpa') || lowerMessage.includes('with grandfather')) relationships.push('with grandpa')

  // Extract character names (simple patterns)
  const characters = []
  const namePatterns = /(?:friend[s]?\s+(?:named|called)\s+(\w+)|with\s+(\w+)(?:\s+and\s+(\w+))?)/gi
  let nameMatch
  while ((nameMatch = namePatterns.exec(message)) !== null) {
    if (nameMatch[1]) characters.push(nameMatch[1])
    if (nameMatch[2]) characters.push(nameMatch[2])
    if (nameMatch[3]) characters.push(nameMatch[3])
  }

  // Extract specific story elements
  const specificElements = []
  if (lowerMessage.includes('treasure')) specificElements.push('treasure hunt')
  if (lowerMessage.includes('magic') || lowerMessage.includes('magical')) specificElements.push('magical elements')
  if (lowerMessage.includes('dragon')) specificElements.push('dragon')
  if (lowerMessage.includes('princess')) specificElements.push('princess')
  if (lowerMessage.includes('castle')) specificElements.push('castle')
  if (lowerMessage.includes('forest')) specificElements.push('forest adventure')
  if (lowerMessage.includes('ocean') || lowerMessage.includes('sea')) specificElements.push('ocean adventure')
  if (lowerMessage.includes('space')) specificElements.push('space adventure')
  if (lowerMessage.includes('pirate')) specificElements.push('pirates')

  // Extract settings
  let setting = ''
  if (lowerMessage.includes('at the beach')) setting = 'at the beach'
  else if (lowerMessage.includes('in the forest')) setting = 'in the forest'
  else if (lowerMessage.includes('in space')) setting = 'in space'
  else if (lowerMessage.includes('at home')) setting = 'at home'
  else if (lowerMessage.includes('in the backyard')) setting = 'in the backyard'
  else if (lowerMessage.includes('at school')) setting = 'at school'

  return {
    characters,
    relationships,
    specificElements,
    setting,
    additionalDetails: message.length > 50 ? message.substring(0, 200) + '...' : message
  }
}

export async function processUserMessage(
  message: string,
  conversationHistory: ChatMessage[] = []
): Promise<AIResponse> {
  try {
    // Extract meaningful content from user message
    const extractedContent = await extractStoryContentFromMessage(message)
    console.log('Extracted story content:', extractedContent)
    
    // Get context data
    const [children, themes] = await Promise.all([
      getChildren(),
      getStoryThemes()
    ])
    
    // Build enhanced system prompt with extraction
    const systemPrompt = buildEnhancedSystemPrompt(children, themes, extractedContent)
    
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
                description: 'Comprehensive personalized story requirements based on user input including characters, relationships, settings, and specific elements'
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
        
        // Build comprehensive custom prompt from extracted content
        const enhancedCustomPrompt = buildCustomPromptFromExtraction(extractedContent, args.customPrompt)
        
        const enhancedStoryRequest = {
          ...args,
          customPrompt: enhancedCustomPrompt,
          preferredLength: args.preferredLength || 'medium'
        }
        
        return {
          content: `Perfect! I'll create a ${args.theme} story for ${getChildName(args.childId, children)}${extractedContent.characters.length > 0 ? ` featuring ${extractedContent.characters.join(', ')}` : ''}${extractedContent.relationships.length > 0 ? ` ${extractedContent.relationships.join(' and ')}` : ''}. Let me start working on this magical adventure!`,
          metadata: {
            component: 'story-request',
            action: 'create',
            data: enhancedStoryRequest
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

function buildCustomPromptFromExtraction(extractedContent: ExtractedStoryContent, existingCustomPrompt?: string): string {
  const promptParts = []
  
  if (existingCustomPrompt) {
    promptParts.push(existingCustomPrompt)
  }
  
  if (extractedContent.characters.length > 0) {
    promptParts.push(`Include these characters in the story: ${extractedContent.characters.join(', ')}`)
  }
  
  if (extractedContent.relationships.length > 0) {
    promptParts.push(`The story should feature adventures ${extractedContent.relationships.join(' and ')}`)
  }
  
  if (extractedContent.specificElements.length > 0) {
    promptParts.push(`Include these story elements: ${extractedContent.specificElements.join(', ')}`)
  }
  
  if (extractedContent.setting) {
    promptParts.push(`The story should take place ${extractedContent.setting}`)
  }
  
  if (extractedContent.additionalDetails && extractedContent.additionalDetails.trim() !== '') {
    promptParts.push(`Additional context from user: ${extractedContent.additionalDetails}`)
  }
  
  return promptParts.join('. ')
}

function buildEnhancedSystemPrompt(children: Child[], themes: any[], extractedContent: ExtractedStoryContent): string {
  const childrenInfo = children.map(child => 
    `- ${child.name} (age ${child.age}): Personality: ${child.personality.map(p => p.name).join(', ')}. Interests: ${child.interests.map(i => i.name).join(', ')}`
  ).join('\n')
  
  const themeOptions = themes.map(theme => 
    `- ${theme.name}: ${theme.description}`
  ).join('\n')
  
  let extractedInfo = ''
  if (extractedContent.characters.length > 0 || extractedContent.relationships.length > 0 || extractedContent.specificElements.length > 0 || extractedContent.setting) {
    extractedInfo = `\n\nExtracted user preferences from their message:
${extractedContent.characters.length > 0 ? `- Characters to include: ${extractedContent.characters.join(', ')}` : ''}
${extractedContent.relationships.length > 0 ? `- Relationships: ${extractedContent.relationships.join(', ')}` : ''}
${extractedContent.specificElements.length > 0 ? `- Story elements: ${extractedContent.specificElements.join(', ')}` : ''}
${extractedContent.setting ? `- Setting: ${extractedContent.setting}` : ''}
Use these preferences to create a highly personalized story that incorporates these specific elements.`
  }
  
  return `You are a friendly AI storyteller assistant for KidsVerse, specializing in creating personalized children's stories. Your role is to:

1. Help parents create magical, educational stories for their children
2. Understand what kind of story they want to create
3. Gather the necessary information to personalize the story
4. Be enthusiastic and encouraging about storytelling
5. Extract and use specific details from user messages to create highly personalized stories

Available children:
${childrenInfo}

Available story themes:
${themeOptions}${extractedInfo}

When a user wants to create a story:
1. Help them choose a child and theme
2. Extract specific characters, relationships, and story elements from their message
3. Use the create_story_request function with a comprehensive customPrompt that includes all extracted details
4. Make sure to acknowledge the specific elements they mentioned in your response

Be conversational, friendly, and focused on creating magical experiences for children. Keep responses concise but enthusiastic. Pay special attention to personalization details mentioned by the user.`
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