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
    <div className="fixed inset-0 bg-gray-50 z-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="flex items-center justify-between">
          <button
            onClick={onClose}
            className="w-8 h-8 bg-gray-100 flex items-center justify-center"
          >
            <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          <div className="text-center">
            <h1 className="font-semibold text-gray-900 text-lg truncate max-w-48">{story.title}</h1>
            <p className="text-sm text-gray-600">
              {currentPage + 1} of {totalPages}
            </p>
          </div>
          
          <div className="w-8 h-8"></div>
        </div>
      </header>

      {/* Story Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        <div className="max-w-md w-full bg-white border border-gray-200">
          {/* Illustration */}
          <div className="h-64 bg-gray-100 flex items-center justify-center">
            <div className="text-center">
              <div className="w-24 h-16 bg-white border border-gray-300 flex items-center justify-center mx-auto">
                <div className="w-8 h-8 bg-gray-400"></div>
              </div>
              <p className="text-sm text-gray-600 mt-2">Page {currentPage + 1}</p>
            </div>
          </div>
          
          {/* Text content */}
          <div className="p-6">
            <p className="text-lg leading-relaxed text-gray-900">
              {currentStoryPage.text}
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-6 w-full max-w-md">
          <div className="w-full bg-gray-200 h-1">
            <div 
              className="bg-primary-700 h-1"
              style={{ width: `${((currentPage + 1) / totalPages) * 100}%` }}
            ></div>
          </div>
          <p className="text-center text-sm text-gray-600 mt-2">
            {Math.round(((currentPage + 1) / totalPages) * 100)}%
          </p>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="bg-white border-t border-gray-200 px-4 py-4">
        <div className="flex items-center justify-between max-w-md mx-auto">
          <button
            onClick={goToPrevPage}
            disabled={currentPage === 0}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Previous</span>
          </button>
          
          <div className="flex space-x-1">
            {story.content.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentPage(index)}
                className={`w-2 h-2 ${
                  index === currentPage
                    ? 'bg-primary-700'
                    : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
          
          {currentPage === totalPages - 1 ? (
            <button
              onClick={onClose}
              className="flex items-center space-x-2 px-4 py-2 bg-primary-700 text-white"
            >
              <span>Done</span>
            </button>
          ) : (
            <button
              onClick={goToNextPage}
              className="flex items-center space-x-2 px-4 py-2 bg-primary-700 text-white"
            >
              <span>Next</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}