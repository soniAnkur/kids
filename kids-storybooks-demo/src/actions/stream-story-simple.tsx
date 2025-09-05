'use server'

import { createStreamableUI } from 'ai/rsc'
import { ReactNode } from 'react'
import { StoryRequest, Child, Story } from '@/types'
import { generateStoryContent } from '@/lib/ai-story-generator'
import { generateStoryIllustrations } from '@/lib/ai-image-generator'
import { getChildren } from './child-actions'
import { StoryPreview } from '@/components/story/StoryPreview'

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
          <span>Crafting {theme} adventure</span>
        </div>
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <div className="w-2 h-2 bg-primary/60 rounded-full animate-pulse"></div>
          <span>Creating beautiful illustrations</span>
        </div>
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <div className="w-2 h-2 bg-primary/40 rounded-full animate-pulse"></div>
          <span>Adding personalized touches</span>
        </div>
      </div>
    </div>
  )
}

export async function generateStreamingStory(request: StoryRequest): Promise<ReactNode> {
  const stream = createStreamableUI(null)
  
  // Run the generation in the background
  ;(async () => {
    try {
      const children = await getChildren()
      const child = children.find(c => c.id === request.childId)
      
      if (!child) {
        stream.done(<div className="text-red-500">Child not found</div>)
        return
      }

      // Show initial placeholder
      stream.update(
        <StoryGenerationPlaceholder 
          childName={child.name} 
          theme={request.theme} 
        />
      )

      // Generate story content
      const storyContent = await generateStoryContent(request)
      
      // Update placeholder with progress
      stream.update(
        <div className="border border-border rounded-lg p-6 bg-card">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
              <div className="w-3 h-3 border-2 border-primary border-t-transparent animate-spin rounded-full"></div>
            </div>
            <span className="font-medium text-foreground">Almost ready! Creating illustrations...</span>
          </div>
          <div className="text-sm text-muted-foreground">
            Story &quot;{storyContent.title}&quot; has been created with {storyContent.pages.length} magical pages
          </div>
        </div>
      )

      // Generate illustrations
      const illustrations = await generateStoryIllustrations(storyContent, request)

      // Create complete story object
      const story: Story = {
        id: `story-${Date.now()}`,
        title: storyContent.title,
        childId: request.childId,
        content: storyContent.pages.map((page, index) => ({
          id: `page-${index + 1}`,
          pageNumber: index + 1,
          text: page.text,
          illustration: illustrations[index + 1] || '/api/placeholder/story/default.jpg'
        })),
        coverImage: illustrations[0] || '/api/placeholder/story/cover.jpg',
        theme: request.theme,
        generatedAt: new Date(),
        readCount: 0,
        isFavorite: false,
        status: 'ready' as const,
        estimatedReadTime: storyContent.estimatedReadTime,
        educationalObjectives: storyContent.educationalObjectives,
        moralLessons: storyContent.moralLessons
      }

      // Show final story preview
      stream.done(
        <div className="space-y-4" data-story-id={story.id}>
          <div className="flex items-center space-x-2 text-sm text-green-600">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Story completed successfully!</span>
          </div>
          <StoryPreview 
            story={story}
            onStartNewStory={() => {
              // This will emit a custom event that the parent can listen to
              if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('story:startNew'))
              }
            }}
            onReadStory={() => {
              // This will emit a custom event that the parent can listen to
              if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('story:read', { 
                  detail: { story } 
                }))
              }
            }}
          />
        </div>
      )

    } catch (error) {
      console.error('Streaming story generation error:', error)
      stream.done(
        <div className="border border-red-200 rounded-lg p-4 bg-red-50">
          <div className="text-red-600 font-medium">Story Generation Failed</div>
          <div className="text-red-500 text-sm mt-1">
            Sorry, I couldn&apos;t create your story right now. Please try again.
          </div>
        </div>
      )
    }
  })()

  return stream.value
}