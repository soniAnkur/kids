import { openai } from './ai-config'

interface StoryContent {
  title: string
  pages: Array<{
    text: string
    sceneDescription: string
  }>
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

interface StoryRequest {
  childId: string
  theme: string
  customPrompt?: string
  preferredLength: 'short' | 'medium' | 'long'
}

interface ImageGenerationContext {
  childName: string
  childAge: number
  theme: string
  customPrompt?: string
  extractedCharacters?: string[]
  extractedRelationships?: string[]
  extractedSettings?: string
}

export async function generateStoryIllustrations(
  content: StoryContent | StoryOutline,
  request: StoryRequest,
  childName?: string,
  childAge?: number
): Promise<string[]> {
  try {
    console.log('🎨 [IMAGES] Starting story illustration generation...')
    console.log('🎨 [IMAGES] Content title:', content.title)
    console.log('🎨 [IMAGES] Page count:', content.pages.length)
    console.log('🎨 [IMAGES] Theme:', request.theme)
    console.log('🎨 [IMAGES] Custom prompt:', request.customPrompt)
    
    // Build image generation context from the custom prompt and request
    const imageContext = buildImageGenerationContext(request, childName, childAge)
    console.log('🎨 [IMAGES] Image context:', imageContext)
    
    const illustrations: string[] = []
    const startTime = Date.now()
    
    // Generate cover image first
    console.log('🎨 [IMAGES] Generating cover image...')
    const coverPrompt = buildCoverImagePrompt(content.title, imageContext)
    console.log('🎨 [IMAGES] Cover prompt:', coverPrompt)
    
    const coverStartTime = Date.now()
    const coverUrl = await generateSingleImage(coverPrompt)
    const coverEndTime = Date.now()
    console.log(`🎨 [IMAGES] Cover image generated in ${coverEndTime - coverStartTime}ms:`, coverUrl)
    illustrations.push(coverUrl)
    
    // Generate illustrations for each page - handle both StoryContent and StoryOutline
    console.log('🎨 [IMAGES] Generating page illustrations...')
    for (let i = 0; i < content.pages.length; i++) {
      const page = content.pages[i]
      const sceneDescription = 'text' in page ? page.sceneDescription : page.sceneDescription
      const pagePrompt = buildPageImagePrompt(sceneDescription, imageContext)
      console.log(`🎨 [IMAGES] Page ${i + 1} prompt:`, pagePrompt)
      
      const pageStartTime = Date.now()
      const imageUrl = await generateSingleImage(pagePrompt)
      const pageEndTime = Date.now()
      console.log(`🎨 [IMAGES] Page ${i + 1} image generated in ${pageEndTime - pageStartTime}ms:`, imageUrl)
      illustrations.push(imageUrl)
    }
    
    const totalTime = Date.now() - startTime
    console.log(`🎨 [IMAGES] All images generated in ${totalTime}ms`)
    console.log('🎨 [IMAGES] Generated URLs:', illustrations)
    
    return illustrations
    
  } catch (error) {
    console.error('🎨 [IMAGES] Image generation error:', error)
    
    // Return placeholder images as fallback
    const placeholders = generatePlaceholderImages(content.pages.length + 1)
    console.log('🎨 [IMAGES] Using placeholder images:', placeholders)
    return placeholders
  }
}

async function generateSingleImage(prompt: string, retryCount: number = 0): Promise<string> {
  try {
    console.log('🖼️ [SINGLE_IMAGE] Generating image...')
    const startTime = Date.now()
    
    const response = await openai.images.generate({
      model: process.env.OPENAI_IMAGE_MODEL || 'dall-e-3',
      prompt: prompt,
      n: 1,
      size: '1024x1024',
      quality: 'standard',
      style: 'vivid'
    })
    
    const endTime = Date.now()
    console.log(`🖼️ [SINGLE_IMAGE] Image generated in ${endTime - startTime}ms`)
    
    const imageUrl = response.data?.[0]?.url
    if (!imageUrl) {
      console.error('🖼️ [SINGLE_IMAGE] No image URL in response:', response)
      return '/api/placeholder/story/default.jpg'
    }
    
    console.log('🖼️ [SINGLE_IMAGE] Generated URL:', imageUrl)
    return imageUrl
    
  } catch (error) {
    console.error('🖼️ [SINGLE_IMAGE] Single image generation error:', error)
    console.error('🖼️ [SINGLE_IMAGE] Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : String(error),
      status: (error as any)?.status,
      code: (error as any)?.code
    })
    
    // Handle content policy violations with safer retry
    if ((error as any)?.code === 'content_policy_violation' && retryCount < 2) {
      console.log(`🛡️ [SAFETY_RETRY] Content policy violation, attempting safer prompt (retry ${retryCount + 1}/2)`)
      
      // Generate a much safer, more generic prompt
      const saferPrompt = generateSaferFallbackPrompt(prompt)
      console.log('🛡️ [SAFETY_RETRY] Using safer prompt:', saferPrompt)
      
      return await generateSingleImage(saferPrompt, retryCount + 1)
    }
    
    // Check for other specific API errors
    if ((error as any)?.status === 429) {
      console.error('🖼️ [SINGLE_IMAGE] Rate limit exceeded - too many requests')
    } else if ((error as any)?.status === 401) {
      console.error('🖼️ [SINGLE_IMAGE] Authentication failed - check API key')
    } else if ((error as any)?.status === 402) {
      console.error('🖼️ [SINGLE_IMAGE] Payment required - insufficient credits')
    } else if ((error as any)?.code === 'insufficient_quota') {
      console.error('🖼️ [SINGLE_IMAGE] Insufficient quota - check OpenAI billing')
    } else if ((error as any)?.code === 'content_policy_violation') {
      console.error('🖼️ [SINGLE_IMAGE] Content policy violation - all retry attempts failed')
    }
    
    return '/api/placeholder/story/default.jpg'
  }
}

function generateSaferFallbackPrompt(originalPrompt: string): string {
  // Extract theme if possible
  const themes = ['ocean', 'space', 'forest', 'princess', 'adventure', 'animal', 'magic']
  const detectedTheme = themes.find(theme => originalPrompt.toLowerCase().includes(theme)) || 'adventure'
  
  // Generate a very safe, generic prompt
  const safePrompts = [
    `Children's book illustration of a happy child exploring a colorful ${detectedTheme} world, bright colors, friendly cartoon style, wholesome and cheerful`,
    `Whimsical children's book art showing a magical ${detectedTheme} scene with friendly characters, vibrant colors, warm lighting, safe for children`,
    `Cartoon illustration for children showing a joyful ${detectedTheme} adventure, colorful and bright, friendly characters smiling, child-appropriate content`,
    `Children's storybook style drawing of a beautiful ${detectedTheme} setting with happy characters, magical atmosphere, positive and uplifting mood`
  ]
  
  // Pick a random safe prompt
  const safePrompt = safePrompts[Math.floor(Math.random() * safePrompts.length)]
  
  return safePrompt
}

function buildImageGenerationContext(request: StoryRequest, childName?: string, childAge?: number): ImageGenerationContext {
  const context: ImageGenerationContext = {
    childName: childName || 'child',
    childAge: childAge || 6,
    theme: request.theme,
    customPrompt: request.customPrompt
  }
  
  // Extract specific elements from customPrompt if available
  if (request.customPrompt) {
    const customPrompt = request.customPrompt.toLowerCase()
    
    // Extract characters mentioned
    const characters: string[] = []
    if (customPrompt.includes('mom') || customPrompt.includes('mother')) characters.push('mom')
    if (customPrompt.includes('dad') || customPrompt.includes('father')) characters.push('dad')
    if (customPrompt.includes('sister')) characters.push('sister')
    if (customPrompt.includes('brother')) characters.push('brother')
    if (customPrompt.includes('friend')) characters.push('friend')
    if (customPrompt.includes('grandma') || customPrompt.includes('grandmother')) characters.push('grandma')
    if (customPrompt.includes('grandpa') || customPrompt.includes('grandfather')) characters.push('grandpa')
    
    // Extract character names (simple pattern matching)
    const nameMatches = request.customPrompt.match(/\b[A-Z][a-z]+\b/g)
    if (nameMatches) {
      const commonNames = nameMatches.filter(name => 
        !['The', 'A', 'An', 'Include', 'Story', 'Adventure', 'Magic', 'Magical'].includes(name)
      )
      characters.push(...commonNames)
    }
    
    // Extract relationships
    const relationships: string[] = []
    if (customPrompt.includes('with mom')) relationships.push('with mom')
    if (customPrompt.includes('with dad')) relationships.push('with dad')
    if (customPrompt.includes('with sister')) relationships.push('with sister')
    if (customPrompt.includes('with brother')) relationships.push('with brother')
    if (customPrompt.includes('with friends')) relationships.push('with friends')
    
    // Extract settings
    let setting = ''
    if (customPrompt.includes('at the beach')) setting = 'at the beach'
    else if (customPrompt.includes('in the forest')) setting = 'in the forest'  
    else if (customPrompt.includes('in space')) setting = 'in space'
    else if (customPrompt.includes('at home')) setting = 'at home'
    else if (customPrompt.includes('in the backyard')) setting = 'in the backyard'
    else if (customPrompt.includes('at school')) setting = 'at school'
    else if (customPrompt.includes('in the ocean')) setting = 'in the ocean'
    
    context.extractedCharacters = characters
    context.extractedRelationships = relationships
    context.extractedSettings = setting
  }
  
  return context
}

function buildCoverImagePrompt(title: string, context: ImageGenerationContext): string {
  const baseStyle = "Children's book illustration style, vibrant colors, friendly and magical atmosphere, safe for children"
  
  // Sanitize the title to remove potentially problematic words
  const safeTitle = sanitizeSceneDescription(title)
  
  let prompt = `${baseStyle}. Create a cover illustration for a ${context.theme} themed children's story`
  
  // Add character context
  if (context.extractedCharacters && context.extractedCharacters.length > 0) {
    const characterList = context.extractedCharacters.join(', ')
    prompt += ` featuring ${context.childName} with ${characterList}`
  } else {
    prompt += ` featuring ${context.childName}`
  }
  
  // Add setting context  
  if (context.extractedSettings) {
    prompt += ` ${context.extractedSettings}`
  }
  
  prompt += `. The image should be inviting and exciting, showing cheerful characters in a magical ${context.theme} world. Include whimsical details that would appeal to children aged ${context.childAge}-${context.childAge + 4}. Bright, colorful, positive atmosphere. No text or words in the image.`
  
  return prompt
}

function buildPageImagePrompt(sceneDescription: string, context: ImageGenerationContext): string {
  const baseStyle = "Children's book illustration style, vibrant colors, friendly characters, magical atmosphere"
  const safetyGuidelines = "safe for children, no scary or frightening elements, positive and uplifting tone"
  
  // Clean and sanitize the scene description for DALL-E safety
  let cleanDescription = sanitizeSceneDescription(sceneDescription)
  
  // Enhance scene description with user-specified context
  if (context.extractedCharacters && context.extractedCharacters.length > 0) {
    const characterMentions = context.extractedCharacters.join(', ')
    cleanDescription += `. Include ${context.childName} along with ${characterMentions} as characters in this scene`
  }
  
  if (context.extractedSettings && !cleanDescription.toLowerCase().includes(context.extractedSettings.toLowerCase())) {
    cleanDescription += `. The scene takes place ${context.extractedSettings}`
  }
  
  let prompt = `${baseStyle}. Create an illustration showing: ${cleanDescription}. This is for a ${context.theme} themed children's story`
  
  // Add age-appropriate guidance
  prompt += ` suitable for ${context.childAge} year old children`
  
  prompt += `. ${safetyGuidelines}. The style should be consistent with modern children's book illustrations, with warm lighting and inviting composition. No text or words in the image.`
  
  return prompt
}

function sanitizeSceneDescription(description: string): string {
  // Remove or replace potentially problematic words/phrases for DALL-E
  let cleaned = description
  
  // Common problematic words that might trigger safety filters
  const problematicWords = [
    // Words that might be misinterpreted
    { from: /\bdark shadow\b/gi, to: 'mysterious figure' },
    { from: /\bgrumpy\b/gi, to: 'sad' },
    { from: /\bloomed over\b/gi, to: 'appeared near' },
    { from: /\battack\b/gi, to: 'approach' },
    { from: /\bfight\b/gi, to: 'play' },
    { from: /\bbattle\b/gi, to: 'game' },
    { from: /\bdanger\b/gi, to: 'adventure' },
    { from: /\bweapon\b/gi, to: 'tool' },
    { from: /\bkill\b/gi, to: 'help' },
    { from: /\bdeath\b/gi, to: 'sleep' },
    { from: /\bdie\b/gi, to: 'rest' },
    { from: /\bblood\b/gi, to: 'red color' },
    { from: /\binjure\b/gi, to: 'help' },
    { from: /\bhurt\b/gi, to: 'care for' },
    { from: /\bviolent\b/gi, to: 'energetic' },
    { from: /\bcrash\b/gi, to: 'land' },
    { from: /\bexplosion\b/gi, to: 'sparkles' },
    { from: /\bfire\b/gi, to: 'warm light' },
    { from: /\bburn\b/gi, to: 'glow' },
    { from: /\bsword\b/gi, to: 'magic wand' },
    { from: /\bgun\b/gi, to: 'water sprayer' },
    { from: /\bbomb\b/gi, to: 'surprise gift' }
  ]
  
  // Apply replacements
  problematicWords.forEach(({ from, to }) => {
    cleaned = cleaned.replace(from, to)
  })
  
  // Ensure positive framing
  cleaned = ensurePositiveFraming(cleaned)
  
  // Add extra safety context
  cleaned += '. The scene is cheerful, colorful and child-friendly'
  
  console.log('🛡️ [SAFETY] Original description:', description)
  console.log('🛡️ [SAFETY] Cleaned description:', cleaned)
  
  return cleaned
}

function ensurePositiveFraming(description: string): string {
  // Add positive context to potentially neutral descriptions
  let positive = description
  
  // If the description doesn't contain obviously positive words, add some
  const positiveWords = ['happy', 'joyful', 'cheerful', 'friendly', 'magical', 'wonderful', 'beautiful', 'colorful', 'bright']
  const hasPositiveWord = positiveWords.some(word => positive.toLowerCase().includes(word))
  
  if (!hasPositiveWord) {
    positive = positive.replace(/\.$/, ', with a joyful and magical atmosphere.')
  }
  
  return positive
}

function generatePlaceholderImages(count: number): string[] {
  const placeholders = []
  
  for (let i = 0; i < count; i++) {
    if (i === 0) {
      placeholders.push('/api/placeholder/story/cover.jpg')
    } else {
      placeholders.push(`/api/placeholder/story/page-${i}.jpg`)
    }
  }
  
  return placeholders
}

export async function generateChildAvatar(
  childName: string,
  age: number,
  description?: string
): Promise<string> {
  try {
    const prompt = buildAvatarPrompt(childName, age, description)
    return await generateSingleImage(prompt)
    
  } catch (error) {
    console.error('Avatar generation error:', error)
    return '/api/placeholder/child/default-avatar.jpg'
  }
}

function buildAvatarPrompt(childName: string, age: number, description?: string): string {
  const baseStyle = "Friendly cartoon portrait style, suitable for children's profiles"
  const safetyGuidelines = "appropriate for children, wholesome and innocent"
  
  let prompt = `${baseStyle}. Create a friendly avatar portrait of a ${age}-year-old child. ${safetyGuidelines}. The style should be colorful and appealing, similar to animated movie characters. Focus on a kind, smiling expression.`
  
  if (description) {
    prompt += ` Additional details: ${description}.`
  }
  
  prompt += " No text or words in the image."
  
  return prompt
}

export async function generateCustomStoryImage(
  description: string,
  theme: string
): Promise<string> {
  try {
    const prompt = `Children's book illustration style, vibrant and colorful. Create an image showing: ${description}. This is for a ${theme} themed children's story. Safe for children, positive atmosphere, no scary elements. Style should be modern and appealing to children aged 4-10. No text or words in the image.`
    
    return await generateSingleImage(prompt)
    
  } catch (error) {
    console.error('Custom story image generation error:', error)
    return '/api/placeholder/story/custom.jpg'
  }
}