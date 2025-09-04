'use client'

import { useState } from 'react'
import { Child } from '@/types'
import { mockStories } from '@/data/mock-data'
import { formatRelativeTime, getInitials } from '@/lib/utils'

interface StoryLibraryProps {
  children: Child[]
  onBack: () => void
  onCreateStory: () => void
}

export function StoryLibrary({ children, onBack, onCreateStory }: StoryLibraryProps) {
  const [selectedChildId, setSelectedChildId] = useState<string | 'all'>('all')
  
  // Filter stories based on selected child
  const filteredStories = selectedChildId === 'all' 
    ? mockStories 
    : mockStories.filter(story => story.childId === selectedChildId)
  
  const getChildById = (childId: string) => {
    return children.find(child => child.id === childId)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <header className="bg-glass border-b border-white/20 px-4 py-4 sticky top-0 z-40">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-white/80 flex items-center justify-center hover:bg-white transition-colors shadow-lg"
          >
            <svg 
              className="w-5 h-5 text-gray-600" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-800">Story Library</h1>
            <p className="text-sm text-gray-600">
              {filteredStories.length} {filteredStories.length === 1 ? 'story' : 'stories'}
            </p>
          </div>
          
          <button
            onClick={onCreateStory}
            className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center space-x-2 shadow-lg"
          >
            <span>✨</span>
            <span className="hidden sm:inline">New Story</span>
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
              className={`flex-shrink-0 px-4 py-2 rounded-xl font-medium transition-colors ${
                selectedChildId === 'all'
                  ? 'bg-primary-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              All Stories
            </button>
            {children.map((child) => (
              <button
                key={child.id}
                onClick={() => setSelectedChildId(child.id)}
                className={`flex-shrink-0 px-4 py-2 rounded-xl font-medium transition-colors flex items-center space-x-2 ${
                  selectedChildId === child.id
                    ? 'bg-primary-500 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                {child.photoUrl ? (
                  <img
                    src={child.photoUrl}
                    alt={child.name}
                    className="w-6 h-6 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-6 h-6 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-full flex items-center justify-center text-white text-xs font-bold">
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
                <div key={story.id} className="story-card group cursor-pointer">
                  {/* Story cover */}
                  <div className="relative h-48 bg-gradient-to-br from-kids-blue/20 to-kids-purple/20 overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center p-4">
                      <div className="text-center">
                        <div className="w-20 h-16 bg-white/90 rounded-lg flex items-center justify-center mx-auto shadow-lg mb-2">
                          <span className="text-3xl">📖</span>
                        </div>
                        <h3 className="font-bold text-gray-800 text-sm line-clamp-2">
                          {story.title}
                        </h3>
                      </div>
                    </div>
                    
                    {/* Favorite badge */}
                    {story.isFavorite && (
                      <div className="absolute top-2 right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                        <span className="text-sm">⭐</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Story info */}
                  <div className="p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      {child?.photoUrl ? (
                        <img
                          src={child.photoUrl}
                          alt={child.name}
                          className="w-6 h-6 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-6 h-6 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-full flex items-center justify-center text-white text-xs font-bold">
                          {child ? getInitials(child.name) : '?'}
                        </div>
                      )}
                      <span className="text-sm font-medium text-gray-700">
                        {child?.name || 'Unknown'}
                      </span>
                      <span className="text-xs text-gray-500">
                        • {story.theme}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                      <span>{story.estimatedReadTime} min read</span>
                      <span>{formatRelativeTime(story.generatedAt)}</span>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-xs text-gray-600">
                      <span className="flex items-center space-x-1">
                        <span>👁️</span>
                        <span>{story.readCount}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <span>📄</span>
                        <span>{story.content.length} pages</span>
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl text-gray-400">📚</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              {selectedChildId === 'all' ? 'No stories yet' : `No stories for ${children.find(c => c.id === selectedChildId)?.name}`}
            </h3>
            <p className="text-gray-600 mb-6">
              Create your first personalized story to get started
            </p>
            <button
              onClick={onCreateStory}
              className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-xl font-medium transition-colors inline-flex items-center space-x-2"
            >
              <span>✨</span>
              <span>Create First Story</span>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}