'use client'

import { useState, useEffect } from 'react'
import { ChatInterface } from '@/components/chat/ChatInterface'
import { WelcomeHeader } from '@/components/ui/WelcomeHeader'
import { FloatingActionButton } from '@/components/ui/FloatingActionButton'
import { ChildSelector } from '@/components/child/ChildSelector'
import { ChildProfileSetup } from '@/components/child/ChildProfileSetup'
import { StoryLibrary } from '@/components/story/StoryLibrary'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <WelcomeHeader user={currentUser} />
      
      {/* Main Content */}
      <div className="px-4 pb-24 pt-6">
        {/* Child Selection */}
        {currentUser.children.length > 0 ? (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-foreground mb-4">
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
            <Card className="p-6">
              <CardHeader className="p-0 mb-4">
                <CardTitle className="text-xl">Get started</CardTitle>
                <CardDescription>
                  Set up a profile for your child to create personalized stories.
                </CardDescription>
              </CardHeader>
              <Button 
                onClick={handleAddChild}
                size="lg"
                className="w-full sm:w-auto"
              >
                Add Your First Child
              </Button>
            </Card>
          </div>
        )}

        {/* Quick Actions */}
        {selectedChild && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-foreground mb-4">
              What would you like to do?
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Create New Story */}
              <Card className="cursor-pointer transition-all hover:shadow-md hover:scale-[1.02]" onClick={handleStartStoryCreation}>
                <CardContent className="p-6">
                  <div className="flex items-center mb-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <div className="w-6 h-6 bg-primary rounded-full"></div>
                    </div>
                    <CardTitle className="text-lg ml-3">
                      Create Story
                    </CardTitle>
                  </div>
                  <CardDescription>
                    Create a personalized story for {selectedChild.name}
                  </CardDescription>
                </CardContent>
              </Card>

              {/* View Library */}
              <Card className="cursor-pointer transition-all hover:shadow-md hover:scale-[1.02]" onClick={handleViewLibrary}>
                <CardContent className="p-6">
                  <div className="flex items-center mb-3">
                    <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                      <div className="w-6 h-6 bg-muted-foreground rounded"></div>
                    </div>
                    <CardTitle className="text-lg ml-3">
                      Story Library
                    </CardTitle>
                  </div>
                  <CardDescription>
                    Browse previously created stories
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Feature Highlights */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Features
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center mb-3">
                  <div className="w-4 h-4 bg-primary rounded"></div>
                </div>
                <h4 className="font-semibold text-foreground mb-1">Personalized</h4>
                <p className="text-sm text-muted-foreground">Your child as the main character</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center mb-3">
                  <div className="w-4 h-4 bg-muted-foreground rounded"></div>
                </div>
                <h4 className="font-semibold text-foreground mb-1">Educational</h4>
                <p className="text-sm text-muted-foreground">Age-appropriate learning content</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center mb-3">
                  <div className="w-4 h-4 bg-accent rounded"></div>
                </div>
                <h4 className="font-semibold text-foreground mb-1">Interactive</h4>
                <p className="text-sm text-muted-foreground">Engaging story experience</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

    </div>
  )
}