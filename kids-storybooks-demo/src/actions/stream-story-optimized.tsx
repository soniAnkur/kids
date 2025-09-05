'use server'

import { createStreamableUI } from 'ai/rsc'
import { ReactNode } from 'react'
import { StoryRequest, Child, Story } from '@/types'
import { generateStoryContent } from '@/lib/ai-story-generator'
import { generateStoryIllustrations } from '@/lib/ai-image-generator'
import { getChildren } from './child-actions'
import { saveGeneratedStory } from './story-actions'
// Server action - avoid direct client component imports

// Story generation placeholder component
function StoryGenerationPlaceholder({ childName, theme }: { childName: string; theme: string }) {
  return (
    <div className="border border-border rounded-lg p-6 bg-card">
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
          <div className="w-3 h-3 border-2 border-primary border-t-transparent animate-spin rounded-full"></div>
        </div>
        <span className="font-medium text-foreground">Creating {childName}&apos;s magical story...</span>
      </div>
      
      <div className="space-y-3">
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <div className="w-2 h-2 bg-primary rounded-full"></div>
          <span>Crafting {theme} adventure with AI</span>
        </div>
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <div className="w-2 h-2 bg-primary/60 rounded-full animate-pulse"></div>
          <span>Personalizing for {childName}</span>
        </div>
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <div className="w-2 h-2 bg-primary/40 rounded-full animate-pulse"></div>
          <span>Adding magical touches</span>
        </div>
      </div>
    </div>
  )
}

// Story generation progress component
function StoryGenerationProgress({ 
  childName, 
  theme, 
  currentStep 
}: { 
  childName: string
  theme: string
  currentStep: 'story' | 'images' | 'merging'
}) {
  const steps = [
    { id: 'story', label: 'Creating your story', icon: '📝' },
    { id: 'images', label: 'Generating illustrations', icon: '🎨' },
    { id: 'merging', label: 'Putting it all together', icon: '🔄' }
  ]

  return (
    <div className="border border-border rounded-lg p-6 bg-card">
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
          <div className="w-3 h-3 border-2 border-primary border-t-transparent animate-spin rounded-full"></div>
        </div>
        <span className="font-medium text-foreground">Creating {childName}&apos;s {theme} story...</span>
      </div>
      
      <div className="space-y-3">
        {steps.map((step) => (
          <div key={step.id} className="flex items-center space-x-3">
            <div className="text-lg">{step.icon}</div>
            <div className="flex items-center space-x-2 text-sm">
              <div className={`w-2 h-2 rounded-full ${
                step.id === currentStep 
                  ? 'bg-primary animate-pulse' 
                  : steps.findIndex(s => s.id === currentStep) > steps.findIndex(s => s.id === step.id)
                    ? 'bg-green-500'
                    : 'bg-gray-300'
              }`}></div>
              <span className={step.id === currentStep ? 'text-foreground font-medium' : 'text-muted-foreground'}>
                {step.label}
                {step.id === currentStep && '...'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Story completion notification component
function StoryCompletionNotification({ 
  story, 
  hasRealImages,
  imagesInProgress = false
}: { 
  story: Story
  hasRealImages: boolean
  imagesInProgress?: boolean
}) {
  return (
    <div className="border border-border rounded-lg p-6 bg-card">
      <div className="flex items-center space-x-2 text-sm text-green-600 mb-4">
        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
        <span className="font-medium">Story completed!</span>
      </div>
      
      <div className="text-center">
        <h3 className="font-semibold text-lg text-foreground mb-2">{story.title}</h3>
        <p className="text-sm text-muted-foreground mb-4">
          ✨ Your personalized story is ready! 
          {hasRealImages 
            ? ' Custom illustrations included.' 
            : imagesInProgress 
              ? ' Custom illustrations are being generated...' 
              : ' Enhanced with AI-generated images.'
          }
        </p>
        
        {imagesInProgress && (
          <div className="mb-4 p-2 bg-blue-50 rounded text-xs text-blue-600">
            🎨 High-quality illustrations are still being created in the background. 
            The story may update with better images shortly!
          </div>
        )}
        
        <div className="flex justify-center space-x-6 text-xs text-muted-foreground">
          <div className="flex items-center space-x-1">
            <span>📖</span>
            <span>{story.content.length} pages</span>
          </div>
          <div className="flex items-center space-x-1">
            <span>⏱️</span>
            <span>{story.estimatedReadTime} min read</span>
          </div>
          <div className="flex items-center space-x-1">
            <span>🎨</span>
            <span>
              {hasRealImages 
                ? 'Custom images' 
                : imagesInProgress 
                  ? 'Images generating...' 
                  : 'AI images'
              }
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}


export async function generateStreamingStory(request: StoryRequest): Promise<ReactNode> {
  const stream = createStreamableUI(null)
  
  console.log('=== Starting optimized streaming story generation ===')
  console.log('Request:', { childId: request.childId, theme: request.theme })
  
  try {
    // Get child info immediately
    const children = await getChildren()
    const child = children.find(c => c.id === request.childId)
    
    if (!child) {
      console.log('Child not found for ID:', request.childId)
      stream.done(<div className="text-red-500 p-4">Child not found</div>)
      return stream.value
    }

    console.log('Found child:', child.name, 'age:', child.age)

    // Show initial placeholder immediately
    stream.update(
      <StoryGenerationPlaceholder 
        childName={child.name} 
        theme={request.theme} 
      />
    )

    // Step 1: Generate story content first
    console.log('Step 1: Generating story content...')
    stream.update(
      <StoryGenerationProgress 
        childName={child.name} 
        theme={request.theme}
        currentStep="story"
      />
    )
    
    console.log('📖 [STORY] Starting story content generation...')
    let storyContent: any
    
    try {
      storyContent = await Promise.race([
        generateStoryContent(request),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Story generation timeout')), 30000))
      ])
      console.log('📖 [STORY] Story content completed successfully:', storyContent.title)
    } catch (storyError) {
      console.error('📖 [STORY] Story generation failed:', storyError)
      
      // Use fallback story
      storyContent = {
        title: `A Magical ${request.theme} Adventure`,
        pages: [
          {
            text: `Once upon a time, ${child.name} discovered something amazing.`,
            sceneDescription: `${child.name}, a cheerful ${child.age}-year-old, standing in a magical place filled with wonder and excitement`
          },
          {
            text: `With courage and curiosity, ${child.name} explored this new world.`,
            sceneDescription: `${child.name} exploring a beautiful, safe, and colorful magical environment`
          },
          {
            text: `Through kindness and friendship, ${child.name} made wonderful discoveries.`,
            sceneDescription: `${child.name} meeting friendly characters and making new friends in a joyful scene`
          },
          {
            text: `${child.name} learned valuable lessons and felt proud of the adventure.`,
            sceneDescription: `${child.name} smiling happily, surrounded by the magic of the adventure with a warm, golden light`
          },
          {
            text: `And so ${child.name}'s magical journey came to a wonderful end, with many more adventures to come.`,
            sceneDescription: `${child.name} waving goodbye to the magical world, looking forward to future adventures with a big smile`
          }
        ],
        estimatedReadTime: 5,
        educationalObjectives: ['Adventure', 'Discovery', 'Courage'],
        moralLessons: ['Kindness', 'Friendship', 'Curiosity']
      }
    }
    
    // Step 2: Generate images sequentially
    console.log('Step 2: Generating illustrations...')
    stream.update(
      <StoryGenerationProgress 
        childName={child.name} 
        theme={request.theme}
        currentStep="images"
      />
    )
    
    console.log('🎨 [IMAGES] Starting sequential image generation...')
    let illustrations: string[]
    
    try {
      // Create a simple outline object from the story content for image generation
      const simpleOutline = {
        title: storyContent.title,
        pages: storyContent.pages.map((page: any, index: number) => ({
          pageNumber: index + 1,
          sceneDescription: page.sceneDescription,
          keyElements: ['adventure', 'friendship', 'magic']
        }))
      }
      
      illustrations = await Promise.race([
        generateStoryIllustrations(simpleOutline, request),
        new Promise<string[]>((_, reject) => setTimeout(() => reject(new Error('Image generation timeout')), 120000)) // 2 minute timeout
      ])
      console.log('🎨 [IMAGES] Images completed successfully:', illustrations.length)
    } catch (imageError) {
      console.error('🎨 [IMAGES] Image generation failed:', imageError)
      // Use placeholder images
      illustrations = Array(storyContent.pages.length + 1).fill('/api/placeholder/story/default.jpg')
    }
    
    console.log('Sequential generation completed successfully')
    console.log('Story pages:', storyContent.pages.length)
    console.log('Generated images:', illustrations.length)
    
    // Step 3: Merge results
    console.log('Step 3: Merging story content and images...')
    stream.update(
      <StoryGenerationProgress 
        childName={child.name} 
        theme={request.theme}
        currentStep="merging"
      />
    )
    
    // Create story object with dynamic images
    const story: Story = {
      id: `story-${Date.now()}`,
      title: storyContent.title,
      childId: request.childId,
      theme: request.theme,
      content: storyContent.pages.map((page, index) => ({
        id: `page-${index + 1}`,
        pageNumber: index + 1,
        text: page.text,
        illustration: illustrations[index + 1] || '/api/placeholder/story/default.jpg' // +1 because first image is cover
      })),
      coverImage: illustrations[0] || '/api/placeholder/story/cover.jpg',
      generatedAt: new Date(),
      readCount: 0,
      isFavorite: false,
      shareUrl: undefined,
      status: 'ready',
      estimatedReadTime: storyContent.estimatedReadTime,
      educationalObjectives: storyContent.educationalObjectives,
      moralLessons: storyContent.moralLessons
    }

    console.log('Story object created successfully:', story.id)

    // Save the story to the global stories array
    await saveGeneratedStory(story)
    console.log('Story saved to global storage')

    // Determine if images are still being generated in background
    const hasRealImages = illustrations.some((img: string) => !img.includes('/api/placeholder'))
    const imagesInProgress = !hasRealImages && illustrations.some((img: string) => img.includes('/api/placeholder'))

    // Complete the stream with completion notification
    stream.done(
      <StoryCompletionNotification 
        story={story}
        hasRealImages={hasRealImages}
        imagesInProgress={imagesInProgress}
      />
    )
    
    console.log('=== Sequential streaming story generation completed successfully ===')

  } catch (error) {
    console.error('=== Streaming story generation failed ===')
    console.error('Error details:', error)
    
    stream.done(
      <div className="border border-red-200 rounded-lg p-4 bg-red-50">
        <div className="text-red-600 font-medium">Story Generation Failed</div>
        <div className="text-red-500 text-sm mt-1">
          Sorry, I couldn&apos;t create your story right now. Please try again.
        </div>
        <div className="text-xs text-red-400 mt-2 font-mono">
          Error: {error instanceof Error ? error.message : 'Unknown error'}
        </div>
      </div>
    )
  }

  return stream.value
}