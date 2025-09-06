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

interface StoryOutline {
  title: string
  summary: string
  pages: Array<{
    pageNumber: number
    sceneDescription: string
    keyElements: string[]
  }>
  theme: string
  estimatedReadTime: number
}

export async function generateStoryOutline(request: StoryRequest): Promise<StoryOutline> {
  try {
    console.log('🔍 [OUTLINE] Starting story outline generation...')
    console.log('🔍 [OUTLINE] Request:', JSON.stringify(request, null, 2))
    
    const children = await getChildren()
    const child = children.find(c => c.id === request.childId)
    
    if (!child) {
      throw new Error('Child not found')
    }
    
    console.log('🔍 [OUTLINE] Found child:', child.name, 'age:', child.age)
    
    const systemPrompt = buildOutlineSystemPrompt(child, request)
    console.log('🔍 [OUTLINE] System prompt length:', systemPrompt.length)
    
    const userPrompt = `Create a ${request.preferredLength || 'medium'} ${request.theme} story outline for ${child.name}.${request.customPrompt ? ` User-specified requirements: ${request.customPrompt}` : ''}`
    console.log('🔍 [OUTLINE] User prompt:', userPrompt)
    
    console.log('🔍 [OUTLINE] Calling OpenAI API...')
    const startTime = Date.now()
    
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 1000
    })
    
    const endTime = Date.now()
    console.log(`🔍 [OUTLINE] OpenAI API completed in ${endTime - startTime}ms`)
    console.log('🔍 [OUTLINE] Usage:', JSON.stringify(completion.usage, null, 2))
    
    const response = completion.choices[0].message.content
    console.log('🔍 [OUTLINE] Raw response:', response)
    
    if (!response) {
      throw new Error('No story outline generated')
    }
    
    const parsedOutline = parseOutlineResponse(response, request)
    console.log('🔍 [OUTLINE] Parsed outline:', JSON.stringify(parsedOutline, null, 2))
    
    return parsedOutline
    
  } catch (error) {
    console.error('🔍 [OUTLINE] Story outline generation error:', error)
    
    // Check for specific API errors
    if ((error as any)?.status === 429) {
      console.error('🔍 [OUTLINE] Rate limit exceeded - too many requests')
    } else if ((error as any)?.status === 401) {
      console.error('🔍 [OUTLINE] Authentication failed - check API key')
    } else if ((error as any)?.status === 402) {
      console.error('🔍 [OUTLINE] Payment required - insufficient credits')
    } else if ((error as any)?.code === 'insufficient_quota') {
      console.error('🔍 [OUTLINE] Insufficient quota - check OpenAI billing')
    }
    
    console.log('🔍 [OUTLINE] Using fallback outline generation')
    // Fallback to template outline
    return generateFallbackOutline(request)
  }
}

export async function generateStoryContent(request: StoryRequest): Promise<StoryContent> {
  try {
    console.log('📖 [STORY] Starting story content generation...')
    console.log('📖 [STORY] Request:', JSON.stringify(request, null, 2))
    
    const children = await getChildren()
    const child = children.find(c => c.id === request.childId)
    
    if (!child) {
      throw new Error('Child not found')
    }
    
    console.log('📖 [STORY] Found child:', child.name, 'age:', child.age)
    
    const systemPrompt = buildStorySystemPrompt(child, request)
    console.log('📖 [STORY] System prompt length:', systemPrompt.length)
    
    const userPrompt = `Create a ${request.preferredLength || 'medium'} ${request.theme} story for ${child.name}.${request.customPrompt ? ` User-specified requirements: ${request.customPrompt}` : ''}`
    console.log('📖 [STORY] User prompt:', userPrompt)
    
    console.log('📖 [STORY] Calling OpenAI API...')
    const startTime = Date.now()
    
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.8,
      max_tokens: 2000
    })
    
    const endTime = Date.now()
    console.log(`📖 [STORY] OpenAI API completed in ${endTime - startTime}ms`)
    console.log('📖 [STORY] Usage:', JSON.stringify(completion.usage, null, 2))
    
    const response = completion.choices[0].message.content
    console.log('📖 [STORY] Raw response:', response)
    
    if (!response) {
      throw new Error('No story content generated')
    }
    
    const parsedStory = parseStoryResponse(response, request.preferredLength || 'medium')
    console.log('📖 [STORY] Parsed story:', JSON.stringify(parsedStory, null, 2))
    
    return parsedStory
    
  } catch (error) {
    console.error('📖 [STORY] Story generation error:', error)
    
    // Check for specific API errors
    if ((error as any)?.status === 429) {
      console.error('📖 [STORY] Rate limit exceeded - too many requests')
    } else if ((error as any)?.status === 401) {
      console.error('📖 [STORY] Authentication failed - check API key')
    } else if ((error as any)?.status === 402) {
      console.error('📖 [STORY] Payment required - insufficient credits')
    } else if ((error as any)?.code === 'insufficient_quota') {
      console.error('📖 [STORY] Insufficient quota - check OpenAI billing')
    }
    
    console.log('📖 [STORY] Using fallback story generation')
    // Fallback to template story
    return generateFallbackStory(request)
  }
}

function buildStorySystemPrompt(child: Child, request: StoryRequest): string {
  const personalityTraits = child.personality.map(p => p.name).join(', ')
  const interests = child.interests.map(i => i.name).join(', ')
  
  // Parse custom prompt for specific requirements
  const customRequirements = request.customPrompt ? `\n\nSpecific User Requirements:
${request.customPrompt}

IMPORTANT: Make sure to incorporate ALL of these specific requirements into the story. If characters are mentioned, include them as active participants in the adventure. If relationships are specified, make sure those relationships are central to the story. If specific elements or settings are mentioned, weave them naturally into the narrative.` : ''
  
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
- IMPORTANT: All scene descriptions must use only positive, child-friendly language suitable for AI image generation
- Avoid any words that could be misinterpreted as violent, scary, or inappropriate
- Focus on friendship, discovery, joy, and wonder${customRequirements}

Format your response as JSON:
{
  "title": "Story title featuring the child's name and specific elements mentioned",
  "pages": [
    {
      "text": "Page text (2-3 sentences for young children, 3-4 for older) that incorporates the user's specific requirements",
      "sceneDescription": "Detailed description of the scene for illustration generation including any specific characters, settings, or elements mentioned by the user"
    }
  ],
  "estimatedReadTime": 5,
  "educationalObjectives": ["objective1", "objective2"],
  "moralLessons": ["lesson1", "lesson2"]
}

Create ${getPageCount(request.preferredLength || 'medium')} pages. Make it magical and engaging while ensuring ALL user-specified requirements are woven naturally throughout the story!`
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

function buildOutlineSystemPrompt(child: Child, request: StoryRequest): string {
  const personalityTraits = child.personality.map(p => p.name).join(', ')
  const interests = child.interests.map(i => i.name).join(', ')
  
  // Parse custom prompt for specific requirements
  const customRequirements = request.customPrompt ? `\n\nSpecific User Requirements:
${request.customPrompt}

IMPORTANT: Make sure to incorporate ALL of these specific requirements into the story outline. If characters are mentioned, include them as active participants. If relationships are specified, make sure those relationships are central to the story structure. If specific elements or settings are mentioned, weave them naturally into the outline.` : ''
  
  return `You are a professional children's story writer creating story outlines. 

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
- IMPORTANT: All scene descriptions must use only positive, child-friendly language suitable for AI image generation
- Avoid any words that could be misinterpreted as violent, scary, or inappropriate
- Focus on friendship, discovery, joy, and wonder${customRequirements}

Create a story outline with ${getPageCount(request.preferredLength || 'medium')} pages.

Format your response as JSON:
{
  "title": "Story title featuring the child's name and incorporating user-specified elements",
  "summary": "Brief story summary (2-3 sentences) that includes the specific characters, relationships, and elements mentioned by the user",
  "pages": [
    {
      "pageNumber": 1,
      "sceneDescription": "Detailed scene description for illustrations that incorporates any specific characters, settings, or elements mentioned by the user",
      "keyElements": ["element1", "element2", "user-specified elements"]
    }
  ],
  "theme": "${request.theme}",
  "estimatedReadTime": ${getEstimatedReadTime(request.preferredLength || 'medium')}
}`
}

function parseOutlineResponse(response: string, request: StoryRequest): StoryOutline {
  try {
    const parsed = JSON.parse(response)
    
    return {
      title: parsed.title || 'A Magical Adventure',
      summary: parsed.summary || 'An exciting adventure story',
      pages: parsed.pages || [],
      theme: request.theme,
      estimatedReadTime: getEstimatedReadTime(request.preferredLength || 'medium')
    }
  } catch {
    // Fallback parsing for non-JSON responses
    return generateFallbackOutline(request)
  }
}

function generateFallbackOutline(request: StoryRequest): StoryOutline {
  const pageCount = getPageCount(request.preferredLength || 'medium')
  const pages = []
  
  for (let i = 1; i <= pageCount; i++) {
    pages.push({
      pageNumber: i,
      sceneDescription: `Scene ${i}: A magical ${request.theme} moment`,
      keyElements: ['adventure', 'discovery', 'friendship']
    })
  }
  
  return {
    title: `A ${request.theme} Adventure`,
    summary: `An exciting ${request.theme} story about discovery and friendship`,
    pages,
    theme: request.theme,
    estimatedReadTime: getEstimatedReadTime(request.preferredLength || 'medium')
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