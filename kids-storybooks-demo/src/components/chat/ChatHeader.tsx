'use client'

import { Child } from '@/types'
import { getInitials } from '@/lib/utils'

interface ChatHeaderProps {
  child: Child
  onBack: () => void
}

export function ChatHeader({ child, onBack }: ChatHeaderProps) {
  return (
    <header className="bg-glass border-b border-white/20 px-4 py-4 sticky top-0 z-40">
      <div className="flex items-center space-x-4">
        {/* Back button */}
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

        {/* Child info */}
        <div className="flex items-center space-x-3 flex-1">
          {child.photoUrl ? (
            <img
              src={child.photoUrl}
              alt={child.name}
              className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-lg"
            />
          ) : (
            <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
              {getInitials(child.name)}
            </div>
          )}
          
          <div>
            <h2 className="font-semibold text-gray-800">
              Creating a story for {child.name}
            </h2>
            <p className="text-sm text-gray-600">
              Age {child.age} • {child.personality.length} personality traits
            </p>
          </div>
        </div>

        {/* Status indicator */}
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-xs text-gray-600 hidden sm:inline">AI Assistant</span>
        </div>
      </div>
    </header>
  )
}