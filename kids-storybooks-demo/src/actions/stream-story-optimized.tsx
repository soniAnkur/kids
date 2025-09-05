'use server'

import { createStreamableUI } from 'ai/rsc'
import { ReactNode } from 'react'
import { StoryRequest, Child, Story } from '@/types'
import { generateStoryContent } from '@/lib/ai-story-generator'
import { getChildren } from './child-actions'
import { saveGeneratedStory } from './story-actions'
// Remove direct component import for server action

// Story generation placeholder component
function StoryGenerationPlaceholder({ childName, theme }: { childName: string; theme: string }) {
  return (
    <div className="border border-border rounded-lg p-6 bg-card">
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
          <div className="w-3 h-3 border-2 border-primary border-t-transparent animate-spin rounded-full"></div>
        </div>
        <span className="font-medium text-foreground">Creating {childName}'s magical story...</span>
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


export async function generateStreamingStory(request: StoryRequest): Promise<ReactNode> {
  const stream = createStreamableUI(null)
  
  console.log('=== Starting streaming story generation ===')
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

    // Generate story content with timeout protection
    console.log('Starting story content generation...')
    
    const storyPromise = generateStoryContent(request)
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Story generation timeout')), 30000) // 30 second timeout
    })

    const storyContent = await Promise.race([storyPromise, timeoutPromise])
    console.log('Story content generated successfully:', storyContent.title)
    
    // Create story object with correct structure matching Story interface
    const story: Story = {
      id: `story-${Date.now()}`,
      title: storyContent.title,
      childId: request.childId,
      theme: request.theme,
      content: storyContent.pages.map((page, index) => ({
        id: `page-${index + 1}`,
        pageNumber: index + 1,
        text: page.text,
        illustration: '/api/placeholder/story/default.jpg' // Using placeholder for now
      })),
      coverImage: '/api/placeholder/story/cover.jpg', // Using placeholder for now
      generatedAt: new Date(),
      readCount: 0,
      isFavorite: false,
      shareUrl: undefined
    }

    console.log('Story object created successfully:', story.id)

    // Save the story to the global stories array
    await saveGeneratedStory(story)
    console.log('Story saved to global storage')

    // Complete the stream with story completion message and trigger client-side event
    stream.done(
      <div className="border border-border rounded-lg p-6 bg-card">
        <div className="flex items-center space-x-2 text-sm text-green-600 mb-4">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span>Story completed successfully!</span>
        </div>
        <div className="text-center">
          <h3 className="font-semibold text-lg text-foreground mb-2">{story.title}</h3>
          <p className="text-sm text-muted-foreground mb-4">
            ✨ Your personalized story is ready! The interactive story card will appear below.
          </p>
        </div>
        <script dangerouslySetInnerHTML={{
          __html: `
            if (typeof window !== 'undefined' && window.__notifyStoryGenerated) {
              window.__notifyStoryGenerated(${JSON.stringify(story)});
            }
          `
        }} />
      </div>
    )
    
    console.log('=== Streaming story generation completed successfully ===')

  } catch (error) {
    console.error('=== Streaming story generation failed ===')
    console.error('Error details:', error)
    
    stream.done(
      <div className="border border-red-200 rounded-lg p-4 bg-red-50">
        <div className="text-red-600 font-medium">Story Generation Failed</div>
        <div className="text-red-500 text-sm mt-1">
          Sorry, I couldn't create your story right now. Please try again.
        </div>
        <div className="text-xs text-red-400 mt-2 font-mono">
          Error: {error instanceof Error ? error.message : 'Unknown error'}
        </div>
      </div>
    )
  }

  return stream.value
}