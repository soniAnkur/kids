'use client'

import { Story } from '@/types'

interface StoryPreviewProps {
  story: Story
  onStartNewStory: () => void
  onReadStory: () => void
}

export function StoryPreview({ story, onStartNewStory, onReadStory }: StoryPreviewProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
      {/* Story Cover */}
      <div className="relative h-48 bg-gradient-to-br from-primary-100 to-secondary-100">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-2">{story.title}</h3>
            <div className="w-32 h-24 bg-white/80 rounded-lg flex items-center justify-center mx-auto shadow-lg">
              <span className="text-4xl">📖</span>
            </div>
          </div>
        </div>
        
        {/* Success badge */}
        <div className="absolute top-3 right-3 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1">
          <span>✨</span>
          <span>Ready!</span>
        </div>
      </div>
      
      {/* Story Info */}
      <div className="p-4">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center">
            <p className="text-sm text-gray-500">Reading time</p>
            <p className="font-semibold text-gray-800">{story.estimatedReadTime} min</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-500">Pages</p>
            <p className="font-semibold text-gray-800">{story.content.length}</p>
          </div>
        </div>
        
        {/* Educational objectives */}
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">📚 Learning objectives:</p>
          <div className="flex flex-wrap gap-1">
            {story.educationalObjectives.slice(0, 3).map((objective, index) => (
              <span 
                key={index}
                className="inline-block px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs"
              >
                {objective}
              </span>
            ))}
          </div>
        </div>
        
        {/* Moral lessons */}
        <div className="mb-6">
          <p className="text-sm text-gray-600 mb-2">💝 Life lessons:</p>
          <div className="flex flex-wrap gap-1">
            {story.moralLessons.slice(0, 2).map((lesson, index) => (
              <span 
                key={index}
                className="inline-block px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs"
              >
                {lesson}
              </span>
            ))}
          </div>
        </div>
        
        {/* Action buttons */}
        <div className="flex space-x-3">
          <button
            onClick={onReadStory}
            className="flex-1 bg-primary-500 hover:bg-primary-600 text-white px-4 py-3 rounded-xl font-medium transition-colors flex items-center justify-center space-x-2"
          >
            <span>📖</span>
            <span>Read Story</span>
          </button>
          
          <button className="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
            </svg>
          </button>
        </div>
        
        {/* Create another story */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <button
            onClick={onStartNewStory}
            className="w-full text-center text-primary-600 hover:text-primary-700 font-medium text-sm transition-colors"
          >
            ✨ Create another story
          </button>
        </div>
      </div>
    </div>
  )
}