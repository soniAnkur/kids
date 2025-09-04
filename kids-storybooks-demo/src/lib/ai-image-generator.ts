import { openai } from './ai-config'

interface StoryContent {
  title: string
  pages: Array<{
    text: string
    sceneDescription: string
  }>
}

interface StoryRequest {
  childId: string
  theme: string
  customPrompt?: string
  preferredLength: 'short' | 'medium' | 'long'
}

export async function generateStoryIllustrations(
  content: StoryContent,
  request: StoryRequest
): Promise<string[]> {
  try {
    const illustrations: string[] = []
    
    // Generate cover image first
    const coverPrompt = buildCoverImagePrompt(content.title, request.theme)
    const coverUrl = await generateSingleImage(coverPrompt)
    illustrations.push(coverUrl)
    
    // Generate illustrations for each page
    for (const page of content.pages) {
      const pagePrompt = buildPageImagePrompt(page.sceneDescription, request.theme)
      const imageUrl = await generateSingleImage(pagePrompt)
      illustrations.push(imageUrl)
    }
    
    return illustrations
    
  } catch (error) {
    console.error('Image generation error:', error)
    
    // Return placeholder images as fallback
    return generatePlaceholderImages(content.pages.length + 1)
  }
}

async function generateSingleImage(prompt: string): Promise<string> {
  try {
    const response = await openai.images.generate({
      model: process.env.OPENAI_IMAGE_MODEL || 'dall-e-3',
      prompt: prompt,
      n: 1,
      size: '1024x1024',
      quality: 'standard',
      style: 'vivid'
    })
    
    return response.data?.[0]?.url || '/api/placeholder/story/default.jpg'
    
  } catch (error) {
    console.error('Single image generation error:', error)
    return '/api/placeholder/story/default.jpg'
  }
}

function buildCoverImagePrompt(title: string, theme: string): string {
  const baseStyle = "Children's book illustration style, vibrant colors, friendly and magical atmosphere, safe for children"
  
  return `${baseStyle}. Create a cover illustration for "${title}", a ${theme} themed children's story. The image should be inviting and exciting, showing the main elements of a ${theme} adventure. Include whimsical details that would appeal to children aged 4-10. No text or words in the image.`
}

function buildPageImagePrompt(sceneDescription: string, theme: string): string {
  const baseStyle = "Children's book illustration style, vibrant colors, friendly characters, magical atmosphere"
  const safetyGuidelines = "safe for children, no scary or frightening elements, positive and uplifting tone"
  
  return `${baseStyle}. Create an illustration showing: ${sceneDescription}. This is for a ${theme} themed children's story. ${safetyGuidelines}. The style should be consistent with modern children's book illustrations, with warm lighting and inviting composition. No text or words in the image.`
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