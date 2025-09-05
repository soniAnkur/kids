'use server'

import { createStreamableUI } from 'ai/rsc'
import { ReactNode } from 'react'
import { StoryRequest, Child, Story } from '@/types'
import { generateStoryContent } from '@/lib/ai-story-generator'
import { generateStoryIllustrations } from '@/lib/ai-image-generator'
import { getChildren } from './child-actions'

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

// Simple story card component for display
function StoryCard({ story }: { story: Story }) {
  return (
    <div className="border border-border rounded-lg p-6 bg-card space-y-4">
      <div className="flex items-center space-x-2 text-sm text-green-600 mb-4">
        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
        <span>Story completed successfully!</span>
      </div>
      
      <div className="flex items-start space-x-4">
        <img 
          src={story.coverImage} 
          alt={`Cover for ${story.title}`}
          className="w-20 h-20 rounded-lg object-cover border"
        />
        <div className="flex-1">
          <h3 className="font-semibold text-lg text-foreground mb-2">{story.title}</h3>
          <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-2">
            <span>{story.content.length} pages</span>
            <span>{story.estimatedReadTime} min read</span>
            <span className="capitalize">{story.theme}</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Educational focuses: {story.educationalObjectives.join(', ')}
          </p>
        </div>
      </div>
      
      <div className="pt-4 border-t">
        <p className="text-sm text-muted-foreground mb-3">
          ✨ Your story is ready! You can find it in the Story Library to read or start another adventure.
        </p>
        <div className="flex space-x-2">
          <button 
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm hover:bg-primary/90 transition-colors"
            disabled
          >
            Story Created! 📚
          </button>
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

      // Generate story content quickly
      console.log('Starting story content generation...')
      const storyContent = await generateStoryContent(request)
      console.log('Story content generated:', storyContent.title)
      
      // Create story object with placeholder images first
      const storyWithPlaceholders: Story = {
        id: `story-${Date.now()}`,
        title: storyContent.title,
        childId: request.childId,
        content: storyContent.pages.map((page, index) => ({
          id: `page-${index + 1}`,
          pageNumber: index + 1,
          text: page.text,
          illustration: '/api/placeholder/story/default.jpg'
        })),
        coverImage: '/api/placeholder/story/cover.jpg',
        theme: request.theme,
        generatedAt: new Date(),
        readCount: 0,
        isFavorite: false,
        status: 'ready' as const,
        estimatedReadTime: storyContent.estimatedReadTime,
        educationalObjectives: storyContent.educationalObjectives,
        moralLessons: storyContent.moralLessons
      }

      // Complete the stream with story (using placeholders for now)
      console.log('Story completed with placeholder images:', storyWithPlaceholders.id)
      stream.done(<StoryCard story={storyWithPlaceholders} />)

      // Generate illustrations in the background (don't await)
      setTimeout(async () => {
        try {
          console.log('Starting illustration generation in background...')
          const illustrations = await generateStoryIllustrations(storyContent, request)
          console.log('Background illustrations generated:', illustrations.length)
          // Note: In a real app, you'd save these to database and update the UI
        } catch (error) {
          console.error('Background illustration generation failed:', error)
        }
      }, 100)

    } catch (error) {
      console.error('Streaming story generation error:', error)
      stream.done(
        <div className="border border-red-200 rounded-lg p-4 bg-red-50">
          <div className="text-red-600 font-medium">Story Generation Failed</div>
          <div className="text-red-500 text-sm mt-1">
            Sorry, I couldn&apos;t create your story right now. Please try again.
            <br />
            <span className="text-xs">Error: {error instanceof Error ? error.message : 'Unknown error'}</span>
          </div>
        </div>
      )
    }
  })()

  return stream.value
}