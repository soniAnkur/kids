'use server'

import { createStreamableUI } from 'ai/rsc'
import { ReactNode } from 'react'
import { StoryRequest, Story } from '@/types'
import { getChildren } from './child-actions'

// Simple story card component
function StoryCard({ story }: { story: Story }) {
  return (
    <div className="border border-border rounded-lg p-6 bg-card space-y-4">
      <div className="flex items-center space-x-2 text-sm text-green-600 mb-4">
        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
        <span>Story completed successfully!</span>
      </div>
      
      <div className="flex items-start space-x-4">
        <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-xl">
          📚
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-lg text-foreground mb-2">{story.title}</h3>
          <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-2">
            <span>{story.content.length} pages</span>
            <span>{story.metadata.estimatedReadTime} min read</span>
            <span className="capitalize">{story.theme}</span>
          </div>
          <p className="text-sm text-muted-foreground">
            A magical adventure created just for your child!
          </p>
        </div>
      </div>
      
      <div className="pt-4 border-t">
        <p className="text-sm text-muted-foreground mb-3">
          ✨ Your story is ready! This is a test version with sample content.
        </p>
        <button 
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm hover:bg-primary/90 transition-colors"
          disabled
        >
          Story Created! 📚
        </button>
      </div>
    </div>
  )
}

export async function generateTestStory(request: StoryRequest): Promise<ReactNode> {
  const stream = createStreamableUI(null)
  
  // Run test generation
  ;(async () => {
    try {
      console.log('Starting TEST story generation...')
      
      const children = await getChildren()
      const child = children.find(c => c.id === request.childId)
      
      if (!child) {
        stream.done(<div className="text-red-500">Child not found</div>)
        return
      }

      // Show loading
      stream.update(
        <div className="border border-border rounded-lg p-6 bg-card">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
              <div className="w-3 h-3 border-2 border-primary border-t-transparent animate-spin rounded-full"></div>
            </div>
            <span className="font-medium text-foreground">Creating test story for {child.name}...</span>
          </div>
        </div>
      )

      // Simulate some work
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Create test story
      const testStory: Story = {
        id: `test-story-${Date.now()}`,
        title: `${child.name}'s ${request.theme} Adventure`,
        childId: request.childId,
        content: [
          {
            id: 'page-1',
            text: `Once upon a time, ${child.name} discovered a magical ${request.theme} world.`,
            imageUrl: '/api/placeholder/story/default.jpg'
          },
          {
            id: 'page-2',
            text: `In this wonderful place, ${child.name} met friendly creatures and learned valuable lessons.`,
            imageUrl: '/api/placeholder/story/default.jpg'
          },
          {
            id: 'page-3',
            text: `With courage and kindness, ${child.name} helped everyone and became a hero!`,
            imageUrl: '/api/placeholder/story/default.jpg'
          }
        ],
        coverImageUrl: '/api/placeholder/story/cover.jpg',
        theme: request.theme,
        createdAt: new Date(),
        updatedAt: new Date(),
        status: 'completed' as const,
        metadata: {
          estimatedReadTime: 3,
          educationalObjectives: ['Courage', 'Kindness'],
          moralLessons: ['Helping Others', 'Being Brave'],
          customPrompt: request.customPrompt,
          preferredLength: request.preferredLength || 'medium'
        }
      }

      console.log('TEST story created:', testStory.id)

      // Complete the stream
      stream.done(<StoryCard story={testStory} />)

    } catch (error) {
      console.error('TEST story generation error:', error)
      stream.done(
        <div className="border border-red-200 rounded-lg p-4 bg-red-50">
          <div className="text-red-600 font-medium">Test Story Generation Failed</div>
          <div className="text-red-500 text-sm mt-1">
            Error: {error instanceof Error ? error.message : 'Unknown error'}
          </div>
        </div>
      )
    }
  })()

  return stream.value
}