'use client'

import { Story } from '@/types'

interface StreamedStoryCardProps {
  story: Story
}

export function StreamedStoryCard({ story }: StreamedStoryCardProps) {
  const handleReadStory = () => {
    // Emit custom event for reading story
    window.dispatchEvent(new CustomEvent('streamed-story:read', { 
      detail: { story } 
    }))
  }

  const handleFindInLibrary = () => {
    // Emit custom event for finding in library
    window.dispatchEvent(new CustomEvent('streamed-story:library'))
  }

  return (
    <div className="border border-border rounded-lg p-6 bg-card space-y-4">
      <div className="flex items-center space-x-2 text-sm text-green-600 mb-4">
        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
        <span>Story completed successfully!</span>
      </div>
      
      <div className="flex items-start space-x-4">
        <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white font-bold text-2xl">
          📖
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-lg text-foreground mb-2">{story.title}</h3>
          <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-2">
            <span>{story.content.length} pages</span>
            <span className="capitalize">{story.theme}</span>
          </div>
          <p className="text-sm text-muted-foreground">
            A personalized story created with AI just for your child!
          </p>
        </div>
      </div>
      
      <div className="pt-4 border-t">
        <p className="text-sm text-muted-foreground mb-3">
          ✨ Your personalized story is ready! Created with AI just for your child.
        </p>
        <div className="flex space-x-2">
          <button 
            onClick={handleReadStory}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm hover:bg-primary/90 transition-colors"
          >
            Read Story 📖
          </button>
          <button 
            onClick={handleFindInLibrary}
            className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md text-sm hover:bg-secondary/90 transition-colors"
          >
            Find in Library
          </button>
        </div>
      </div>
    </div>
  )
}