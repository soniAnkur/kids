'use client'

import { useState, useEffect } from 'react'
import { Story, StoryPage } from '@/types'

interface StoryReaderProps {
  story: Story
  onClose: () => void
  onShare?: () => void
}

export function StoryReader({ story, onClose, onShare }: StoryReaderProps) {
  const [currentPage, setCurrentPage] = useState(0)
  const [isReading, setIsReading] = useState(false)
  const totalPages = story.content.length

  useEffect(() => {
    // Mark story as read (increment read count)
    console.log(`Story "${story.title}" being read - would increment read count in real app`)
  }, [story.id])

  const goToNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1)
    }
  }

  const goToPrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1)
    }
  }

  const currentStoryPage = story.content[currentPage]

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-50 to-purple-50 z-50">
      {/* Header */}
      <header className="bg-glass border-b border-white/20 px-4 py-4 sticky top-0 z-40">
        <div className="flex items-center justify-between">
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/80 flex items-center justify-center hover:bg-white transition-colors shadow-lg"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          <div className="text-center">
            <h1 className="font-bold text-gray-800 text-lg truncate max-w-48">{story.title}</h1>
            <p className="text-sm text-gray-600">
              Page {currentPage + 1} of {totalPages}
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            {onShare && (
              <button
                onClick={onShare}
                className="w-10 h-10 rounded-full bg-white/80 flex items-center justify-center hover:bg-white transition-colors shadow-lg"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Story Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Illustration */}
          <div className="h-64 bg-gradient-to-br from-kids-blue/20 to-kids-purple/20 flex items-center justify-center relative">
            <div className="text-center">
              <div className="w-32 h-24 bg-white/90 rounded-xl flex items-center justify-center mx-auto shadow-lg">
                <span className="text-4xl">🎨</span>
              </div>
              <p className="text-sm text-gray-600 mt-2">Illustration for page {currentPage + 1}</p>
            </div>
            
            {/* Page number indicator */}
            <div className="absolute top-4 right-4 bg-black/50 text-white px-2 py-1 rounded-full text-xs">
              {currentPage + 1}/{totalPages}
            </div>
          </div>
          
          {/* Text content */}
          <div className="p-6">
            <p className="text-lg leading-relaxed text-gray-800 text-center">
              {currentStoryPage.text}
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-6 w-full max-w-md">
          <div className="w-full bg-white/50 rounded-full h-2">
            <div 
              className="bg-primary-500 h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${((currentPage + 1) / totalPages) * 100}%` }}
            ></div>
          </div>
          <p className="text-center text-sm text-gray-600 mt-2">
            {Math.round(((currentPage + 1) / totalPages) * 100)}% complete
          </p>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="bg-glass border-t border-white/20 px-4 py-4">
        <div className="flex items-center justify-between max-w-md mx-auto">
          <button
            onClick={goToPrevPage}
            disabled={currentPage === 0}
            className="flex items-center space-x-2 px-6 py-3 bg-white/80 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-colors shadow-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="font-medium">Previous</span>
          </button>
          
          <div className="flex space-x-2">
            {story.content.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentPage(index)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentPage
                    ? 'bg-primary-500'
                    : 'bg-white/50 hover:bg-white/70'
                }`}
              />
            ))}
          </div>
          
          {currentPage === totalPages - 1 ? (
            <button
              onClick={onClose}
              className="flex items-center space-x-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl transition-colors shadow-lg"
            >
              <span className="font-medium">Finish</span>
              <span>🎉</span>
            </button>
          ) : (
            <button
              onClick={goToNextPage}
              className="flex items-center space-x-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl transition-colors shadow-lg"
            >
              <span className="font-medium">Next</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}