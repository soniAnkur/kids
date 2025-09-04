'use client'

import { useState, useEffect } from 'react'
import { ChatInterface } from '@/components/chat/ChatInterface'
import { WelcomeHeader } from '@/components/ui/WelcomeHeader'
import { FloatingActionButton } from '@/components/ui/FloatingActionButton'
import { ChildSelector } from '@/components/child/ChildSelector'
import { ChildProfileSetup } from '@/components/child/ChildProfileSetup'
import { StoryLibrary } from '@/components/story/StoryLibrary'
import { mockChildren, mockUser } from '@/data/mock-data'
import { Child, User } from '@/types'

export default function HomePage() {
  const [currentUser, setCurrentUser] = useState<User>(mockUser)
  const [selectedChild, setSelectedChild] = useState<Child | null>(null)
  const [showChat, setShowChat] = useState(false)
  const [showLibrary, setShowLibrary] = useState(false)
  const [showChildSetup, setShowChildSetup] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Auto-select first child if available
  useEffect(() => {
    if (currentUser.children.length > 0 && !selectedChild) {
      setSelectedChild(currentUser.children[0])
    }
  }, [currentUser.children, selectedChild])

  const handleStartStoryCreation = () => {
    if (!selectedChild) {
      // If no child selected, show child setup first
      return
    }
    setShowChat(true)
    setShowLibrary(false)
  }

  const handleViewLibrary = () => {
    setShowLibrary(true)
    setShowChat(false)
  }

  const handleBackToHome = () => {
    setShowChat(false)
    setShowLibrary(false)
    setShowChildSetup(false)
  }

  const handleAddChild = () => {
    setShowChildSetup(true)
  }

  const handleChildSetupComplete = (newChild: Child) => {
    setCurrentUser(prev => ({
      ...prev,
      children: [...prev.children, newChild]
    }))
    setSelectedChild(newChild)
    setShowChildSetup(false)
  }

  // Main chat interface view
  if (showChat && selectedChild) {
    return (
      <div className="min-h-screen">
        <ChatInterface
          child={selectedChild}
          onBack={handleBackToHome}
          user={currentUser}
        />
      </div>
    )
  }

  // Story library view
  if (showLibrary) {
    return (
      <div className="min-h-screen">
        <StoryLibrary
          children={currentUser.children}
          onBack={handleBackToHome}
          onCreateStory={handleStartStoryCreation}
        />
      </div>
    )
  }

  // Child setup view
  if (showChildSetup) {
    return (
      <div className="min-h-screen">
        <ChildProfileSetup
          onComplete={handleChildSetupComplete}
          onBack={handleBackToHome}
        />
      </div>
    )
  }

  // Main homepage view
  return (
    <div className="min-h-screen">
      {/* Header */}
      <WelcomeHeader user={currentUser} />
      
      {/* Main Content */}
      <div className="px-4 pb-24 pt-6">
        {/* Child Selection */}
        {currentUser.children.length > 0 ? (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Choose your storyteller
            </h2>
            <ChildSelector
              children={currentUser.children}
              selectedChild={selectedChild}
              onSelectChild={setSelectedChild}
              onAddChild={handleAddChild}
            />
          </div>
        ) : (
          <div className="mb-8">
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                Let's get started!
              </h2>
              <p className="text-gray-600 mb-4">
                First, let's set up a profile for your child so I can create personalized stories just for them.
              </p>
              <button 
                onClick={handleAddChild}
                className="bg-primary-500 text-white px-6 py-3 rounded-xl font-medium hover:bg-primary-600 transition-colors"
              >
                Add Your First Child
              </button>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        {selectedChild && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              What would you like to do?
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Create New Story */}
              <button
                onClick={handleStartStoryCreation}
                className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 text-left group"
              >
                <div className="flex items-center mb-3">
                  <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center group-hover:bg-primary-200 transition-colors">
                    <span className="text-2xl">✨</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 ml-3">
                    Create New Story
                  </h3>
                </div>
                <p className="text-gray-600">
                  Start a conversation to create a magical personalized story for {selectedChild.name}
                </p>
              </button>

              {/* View Library */}
              <button
                onClick={handleViewLibrary}
                className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 text-left group"
              >
                <div className="flex items-center mb-3">
                  <div className="w-12 h-12 bg-secondary-100 rounded-xl flex items-center justify-center group-hover:bg-secondary-200 transition-colors">
                    <span className="text-2xl">📚</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 ml-3">
                    Story Library
                  </h3>
                </div>
                <p className="text-gray-600">
                  Browse and read previously created stories
                </p>
              </button>
            </div>
          </div>
        )}

        {/* Feature Highlights */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Why kids love KidsVerse stories
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100">
              <div className="w-10 h-10 bg-kids-blue/20 rounded-lg flex items-center justify-center mb-3">
                <span className="text-kids-blue text-xl">🎭</span>
              </div>
              <h4 className="font-semibold text-gray-800 mb-1">They're the Hero</h4>
              <p className="text-sm text-gray-600">Your child becomes the main character in every adventure</p>
            </div>
            
            <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100">
              <div className="w-10 h-10 bg-kids-green/20 rounded-lg flex items-center justify-center mb-3">
                <span className="text-kids-green text-xl">🧠</span>
              </div>
              <h4 className="font-semibold text-gray-800 mb-1">Educational Fun</h4>
              <p className="text-sm text-gray-600">Every story includes age-appropriate learning objectives</p>
            </div>
            
            <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100">
              <div className="w-10 h-10 bg-kids-pink/20 rounded-lg flex items-center justify-center mb-3">
                <span className="text-kids-pink text-xl">🎨</span>
              </div>
              <h4 className="font-semibold text-gray-800 mb-1">Beautiful Art</h4>
              <p className="text-sm text-gray-600">Custom illustrations that look like your child</p>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Action Button */}
      {selectedChild && (
        <FloatingActionButton
          onClick={handleStartStoryCreation}
          icon="✨"
          label="Create Story"
        />
      )}
    </div>
  )
}