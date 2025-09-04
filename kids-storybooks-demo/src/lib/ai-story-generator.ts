import { StoryRequest, Child } from '@/types'
import { openai } from './ai-config'
import { getChildren } from '@/actions/child-actions'

interface StoryContent {
  title: string
  pages: Array<{
    text: string
    sceneDescription: string
  }>
  estimatedReadTime: number
  educationalObjectives: string[]
  moralLessons: string[]
}

export async function generateStoryContent(request: StoryRequest): Promise<StoryContent> {
  try {
    const children = await getChildren()
    const child = children.find(c => c.id === request.childId)
    
    if (!child) {
      throw new Error('Child not found')
    }
    
    const systemPrompt = buildStorySystemPrompt(child, request)
    
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Create a ${request.preferredLength || 'medium'} ${request.theme} story for ${child.name}. ${request.customPrompt ? `Additional requirements: ${request.customPrompt}` : ''}` }
      ],
      temperature: 0.8,
      max_tokens: 2000
    })
    
    const response = completion.choices[0].message.content
    
    if (!response) {
      throw new Error('No story content generated')
    }
    
    return parseStoryResponse(response, request.preferredLength || 'medium')
    
  } catch (error) {
    console.error('Story generation error:', error)
    
    // Fallback to template story
    return generateFallbackStory(request)
  }
}

function buildStorySystemPrompt(child: Child, request: StoryRequest): string {
  const personalityTraits = child.personality.map(p => p.name).join(', ')
  const interests = child.interests.map(i => i.name).join(', ')
  
  return `You are a professional children's story writer creating personalized stories. 

Child Information:
- Name: ${child.name}
- Age: ${child.age}
- Personality: ${personalityTraits}
- Interests: ${interests}

Story Requirements:
- Theme: ${request.theme}
- Age-appropriate for ${child.age} year old
- Feature ${child.name} as the main character
- Incorporate their personality traits naturally
- Include elements from their interests where relevant
- Educational and entertaining
- Positive moral lessons
- Safe, encouraging content

Format your response as JSON:
{
  "title": "Story title featuring the child's name",
  "pages": [
    {
      "text": "Page text (2-3 sentences for young children, 3-4 for older)",
      "sceneDescription": "Detailed description of the scene for illustration generation"
    }
  ],
  "estimatedReadTime": 5,
  "educationalObjectives": ["objective1", "objective2"],
  "moralLessons": ["lesson1", "lesson2"]
}

Create ${getPageCount(request.preferredLength || 'medium')} pages. Make it magical and engaging!`
}

function getPageCount(length: string): number {
  switch (length) {
    case 'short': return 3
    case 'long': return 8
    default: return 5 // medium
  }
}

function parseStoryResponse(response: string, length: string): StoryContent {
  try {
    const parsed = JSON.parse(response)
    
    return {
      title: parsed.title || 'A Magical Adventure',
      pages: parsed.pages || [],
      estimatedReadTime: getEstimatedReadTime(length),
      educationalObjectives: parsed.educationalObjectives || ['Creativity', 'Imagination'],
      moralLessons: parsed.moralLessons || ['Kindness', 'Courage']
    }
  } catch {
    // Fallback parsing for non-JSON responses
    return parseNonJsonStoryResponse(response, length)
  }
}

function parseNonJsonStoryResponse(response: string, length: string): StoryContent {
  // Simple text parsing fallback
  const lines = response.split('\n').filter(line => line.trim())
  const title = lines[0]?.replace(/^(Title:|Story:)/i, '').trim() || 'A Magical Adventure'
  
  const pages = lines.slice(1).map((line, index) => ({
    text: line.trim(),
    sceneDescription: `Scene ${index + 1}: ${line.substring(0, 100)}`
  }))
  
  return {
    title,
    pages: pages.slice(0, getPageCount(length)),
    estimatedReadTime: getEstimatedReadTime(length),
    educationalObjectives: ['Creativity', 'Imagination'],
    moralLessons: ['Kindness', 'Courage']
  }
}

function getEstimatedReadTime(length: string): number {
  switch (length) {
    case 'short': return 3
    case 'long': return 8
    default: return 5
  }
}

function generateFallbackStory(request: StoryRequest): StoryContent {
  const pages = [
    {
      text: `Once upon a time, there was a brave child who loved adventures.`,
      sceneDescription: 'A child standing at the beginning of a magical path'
    },
    {
      text: `They discovered something amazing in their neighborhood.`,
      sceneDescription: 'The child finding something magical and wonderful'
    },
    {
      text: `With courage and kindness, they helped someone in need.`,
      sceneDescription: 'The child helping others with a smile'
    }
  ]
  
  return {
    title: 'A Magical Adventure',
    pages: pages.slice(0, getPageCount(request.preferredLength || 'medium')),
    estimatedReadTime: getEstimatedReadTime(request.preferredLength || 'medium'),
    educationalObjectives: ['Problem Solving', 'Empathy'],
    moralLessons: ['Helping Others', 'Being Brave']
  }
}