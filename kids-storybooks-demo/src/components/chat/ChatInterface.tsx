'use client'

import { useState, useEffect, useRef } from 'react'
import { Child, User, ChatMessage, Story } from '@/types'
import { ChatHeader } from './ChatHeader'
import { ChatMessageBubble } from './ChatMessageBubble'
import { ChatInput } from './ChatInput'
import { ThemeSelector } from './ThemeSelector'
import { StoryPreview } from '../story/StoryPreview'
import { generateId, delay, simulateApiCall } from '@/lib/utils'
import { mockChatMessages, storyThemes, aiResponses, mockStories } from '@/data/mock-data'

interface ChatInterfaceProps {
  child: Child
  onBack: () => void
  user: User
}

export function ChatInterface({ child, onBack, user }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      ...mockChatMessages[0],
      content: `Hi! I'm here to help you create magical personalized stories for ${child.name}. What kind of adventure should we create today?`
    }
  ])
  
  const [currentStep, setCurrentStep] = useState<'greeting' | 'theme-selection' | 'generating' | 'completed'>('greeting')
  const [selectedTheme, setSelectedTheme] = useState<string>('')
  const [generatedStory, setGeneratedStory] = useState<Story | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationProgress, setGenerationProgress] = useState(0)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const addMessage = (content: string, type: 'user' | 'assistant' | 'system', metadata?: any) => {
    const newMessage: ChatMessage = {
      id: generateId(),
      type,
      content,
      timestamp: new Date(),
      metadata
    }
    
    setMessages(prev => [...prev, newMessage])
    return newMessage
  }

  const handleUserMessage = async (content: string) => {
    // Add user message
    addMessage(content, 'user')
    
    // Simulate AI response delay
    await delay(1000)
    
    if (currentStep === 'greeting') {
      // Show theme selection
      addMessage(
        "Perfect! Let's choose what kind of story you'd like me to create for " + child.name + ". What adventure sounds most exciting?",
        'assistant',
        { component: 'theme-selector' }
      )
      setCurrentStep('theme-selection')
    }
  }

  const handleThemeSelection = async (themeId: string) => {
    const theme = storyThemes.find(t => t.id === themeId)
    if (!theme) return

    setSelectedTheme(themeId)
    
    // Add user message about theme selection
    addMessage(`I'd love a ${theme.name.toLowerCase()} story!`, 'user')
    
    // Show confirmation and start generation
    await delay(800)
    const responseTemplate = aiResponses.storyRequest[Math.floor(Math.random() * aiResponses.storyRequest.length)]
    const response = responseTemplate
      .replace('{childName}', child.name)
      .replace('{theme}', theme.name.toLowerCase())
    
    addMessage(response, 'assistant')
    
    // Start story generation
    setCurrentStep('generating')
    setIsGenerating(true)
    await generateStory(theme.name)
  }

  const generateStory = async (themeName: string) => {
    const steps = [
      { message: `Analyzing ${child.name}'s personality and interests...`, progress: 20 },
      { message: `Writing a magical ${themeName.toLowerCase()} adventure...`, progress: 50 },
      { message: `Creating beautiful illustrations featuring ${child.name}...`, progress: 80 },
      { message: `Adding the finishing touches...`, progress: 95 }
    ]

    for (const step of steps) {
      await delay(2000)
      setGenerationProgress(step.progress)
      addMessage(step.message, 'assistant', { isGenerationUpdate: true })
    }

    // Complete generation
    await delay(1500)
    setGenerationProgress(100)
    
    // Create a mock story based on the theme
    const newStory: Story = {
      ...mockStories[0],
      id: generateId(),
      title: `${child.name} and the ${themeName} Adventure`,
      theme: themeName,
      childId: child.id,
      generatedAt: new Date(),
      readCount: 0,
      isFavorite: false
    }
    
    setGeneratedStory(newStory)
    setIsGenerating(false)
    setCurrentStep('completed')
    
    const completionResponse = aiResponses.completed[0]
      .replace('{childName}', child.name)
      .replace('{title}', newStory.title)
    
    addMessage(completionResponse, 'assistant', { component: 'story-preview', story: newStory })
  }

  const handleStartNewStory = () => {
    setMessages([
      {
        ...mockChatMessages[0],
        content: `Great! Let's create another amazing story for ${child.name}. What adventure should we go on this time?`
      }
    ])
    setCurrentStep('greeting')
    setSelectedTheme('')
    setGeneratedStory(null)
    setGenerationProgress(0)
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <ChatHeader child={child} onBack={onBack} />
      
      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {messages.map((message) => (
          <div key={message.id}>
            <ChatMessageBubble message={message} />
            
            {/* Show theme selector after specific message */}
            {message.metadata?.component === 'theme-selector' && (
              <div className="mt-4 ml-8 mr-16">
                <ThemeSelector
                  themes={storyThemes}
                  onThemeSelect={handleThemeSelection}
                  disabled={isGenerating}
                />
              </div>
            )}
            
            {/* Show story preview */}
            {message.metadata?.component === 'story-preview' && generatedStory && (
              <div className="mt-4 ml-8 mr-16">
                <StoryPreview
                  story={generatedStory}
                  onStartNewStory={handleStartNewStory}
                  onReadStory={() => {
                    console.log('Open story reader for:', generatedStory.id)
                    // In a real app, this would navigate to the story reader
                  }}
                />
              </div>
            )}
          </div>
        ))}
        
        {/* Generation progress */}
        {isGenerating && (
          <div className="ml-8 mr-16">
            <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
                <span className="font-medium text-gray-800">Creating your story...</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-primary-500 h-2 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${generationProgress}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600 mt-2">{generationProgress}% complete</p>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      {/* Chat Input */}
      {!isGenerating && currentStep !== 'completed' && (
        <div className="border-t border-white/20 bg-glass p-4">
          <ChatInput 
            onSendMessage={handleUserMessage}
            placeholder={`Tell me what kind of story ${child.name} would love...`}
            disabled={currentStep === 'theme-selection'}
          />
        </div>
      )}
    </div>
  )
}