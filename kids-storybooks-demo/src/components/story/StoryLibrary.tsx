'use client'

import { useState } from 'react'
import { Child, Story } from '@/types'
import { mockStories } from '@/data/mock-data'
import { formatRelativeTime, getInitials } from '@/lib/utils'
import { StoryReader } from './StoryReader'

interface StoryLibraryProps {
  children: Child[]
  onBack: () => void
  onCreateStory: () => void
}

export function StoryLibrary({ children, onBack, onCreateStory }: StoryLibraryProps) {
  const [selectedChildId, setSelectedChildId] = useState<string | 'all'>('all')
  const [selectedStory, setSelectedStory] = useState<Story | null>(null)
  
  // Filter stories based on selected child
  const filteredStories = selectedChildId === 'all' 
    ? mockStories 
    : mockStories.filter(story => story.childId === selectedChildId)
  
  const getChildById = (childId: string) => {
    return children.find(child => child.id === childId)
  }

  // Show story reader if a story is selected
  if (selectedStory) {
    return (
      <StoryReader
        story={selectedStory}
        onClose={() => setSelectedStory(null)}
        onShare={() => {
          console.log('Share story:', selectedStory.id)
          // In a real app, this would handle sharing
        }}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="w-8 h-8 bg-gray-100 flex items-center justify-center"
          >
            <svg 
              className="w-4 h-4 text-gray-700" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <div className="flex-1">
            <h1 className="text-xl font-semibold text-gray-900">Library</h1>
            <p className="text-sm text-gray-600">
              {filteredStories.length} {filteredStories.length === 1 ? 'story' : 'stories'}
            </p>
          </div>
          
          <button
            onClick={onCreateStory}
            className="bg-primary-700 text-white px-4 py-2 text-sm font-medium"
          >
            <span className="hidden sm:inline">New Story</span>
            <span className="sm:hidden">New</span>
          </button>
        </div>
      </header>

      <div className="px-4 py-6">
        {/* Child filter */}
        <div className="mb-6">
          <h2 className="text-sm font-medium text-gray-700 mb-3">Filter by child:</h2>
          <div className="flex space-x-3 overflow-x-auto pb-2">
            <button
              onClick={() => setSelectedChildId('all')}
              className={`flex-shrink-0 px-4 py-2 font-medium ${
                selectedChildId === 'all'
                  ? 'bg-primary-700 text-white'
                  : 'bg-white text-gray-700 border border-gray-200'
              }`}
            >
              All
            </button>
            {children.map((child) => (
              <button
                key={child.id}
                onClick={() => setSelectedChildId(child.id)}
                className={`flex-shrink-0 px-4 py-2 font-medium flex items-center space-x-2 ${
                  selectedChildId === child.id
                    ? 'bg-primary-700 text-white'
                    : 'bg-white text-gray-700 border border-gray-200'
                }`}
              >
                {child.photoUrl ? (
                  <img
                    src={child.photoUrl}
                    alt={child.name}
                    className="w-5 h-5 object-cover border border-gray-300"
                  />
                ) : (
                  <div className="w-5 h-5 bg-primary-200 flex items-center justify-center text-primary-900 text-xs font-medium">
                    {getInitials(child.name)}
                  </div>
                )}
                <span>{child.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Stories grid */}
        {filteredStories.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredStories.map((story) => {
              const child = getChildById(story.childId)
              
              return (
                <div 
                  key={story.id} 
                  className="story-card group cursor-pointer"
                  onClick={() => setSelectedStory(story)}
                >
                  {/* Story cover */}
                  <div className="h-48 bg-gray-100 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-16 h-12 bg-white border border-gray-300 flex items-center justify-center mx-auto mb-2">
                        <div className="w-6 h-6 bg-gray-400"></div>
                      </div>
                      <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 px-2">
                        {story.title}
                      </h3>
                    </div>
                  </div>
                  
                  {/* Story info */}
                  <div className="p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      {child?.photoUrl ? (
                        <img
                          src={child.photoUrl}
                          alt={child.name}
                          className="w-5 h-5 object-cover border border-gray-300"
                        />
                      ) : (
                        <div className="w-5 h-5 bg-primary-200 flex items-center justify-center text-primary-900 text-xs font-medium">
                          {child ? getInitials(child.name) : '?'}
                        </div>
                      )}
                      <span className="text-sm font-medium text-gray-900">
                        {child?.name || 'Unknown'}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                      <span>{story.estimatedReadTime} min</span>
                      <span>{formatRelativeTime(story.generatedAt)}</span>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-gray-600">
                      <span>Read {story.readCount} times</span>
                      <span>{story.content.length} pages</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-200 flex items-center justify-center mx-auto mb-4">
              <div className="w-8 h-8 bg-gray-400"></div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {selectedChildId === 'all' ? 'No stories' : `No stories for ${children.find(c => c.id === selectedChildId)?.name}`}
            </h3>
            <p className="text-gray-600 mb-6">
              Create your first story to get started
            </p>
            <button
              onClick={onCreateStory}
              className="bg-primary-700 text-white px-6 py-3 font-medium"
            >
              Create Story
            </button>
          </div>
        )}
      </div>
    </div>
  )
}