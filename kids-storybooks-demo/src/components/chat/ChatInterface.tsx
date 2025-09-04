'use client'

import { useState, useEffect, useRef } from 'react'
import { Child, User, ChatMessage, Story, StoryRequest } from '@/types'
import { ChatHeader } from './ChatHeader'
import { ChatMessageBubble } from './ChatMessageBubble'
import { ChatInput } from './ChatInput'
import { ThemeSelector } from './ThemeSelector'
import { StoryPreview } from '../story/StoryPreview'
import { StoryReader } from '../story/StoryReader'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { generateId, delay } from '@/lib/utils'
import { sendChatMessage, getInitialChatMessage, requestStoryGeneration, checkStoryGenerationStatus } from '@/actions/chat-actions'
import { getStoryThemes } from '@/actions/story-actions'
import { onStoryGenerated } from '@/lib/story-events'

interface ChatInterfaceProps {
  child: Child
  onBack: () => void
  user: User
}

export function ChatInterface({ child, onBack, user }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [storyThemes, setStoryThemes] = useState<any[]>([])
  
  const [selectedTheme, setSelectedTheme] = useState<string>('')
  const [generatedStory, setGeneratedStory] = useState<Story | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [showStoryReader, setShowStoryReader] = useState(false)
  const [loading, setLoading] = useState(false)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Initialize chat and load themes
  useEffect(() => {
    async function initializeChat() {
      try {
        const [initialMessage, themes] = await Promise.all([
          getInitialChatMessage(),
          getStoryThemes()
        ])
        
        setMessages([{
          ...initialMessage,
          content: `Hi! I'm here to help you create magical personalized stories for ${child.name}. What kind of adventure should we create today?`
        }])
        setStoryThemes(themes)
      } catch (error) {
        console.error('Failed to initialize chat:', error)
      }
    }
    
    initializeChat()
  }, [child.name])

  // Listen for completed story generations
  useEffect(() => {
    const unsubscribe = onStoryGenerated((story) => {
      if (story.childId === child.id) {
        setGeneratedStory(story)
        setIsGenerating(false)
        
        // Add completion message
        const completionMessage: ChatMessage = {
          id: `msg-completion-${Date.now()}`,
          type: 'assistant',
          content: `🎉 ${child.name}'s story "${story.title}" is ready! It's a wonderful adventure with ${story.content.length} pages.`,
          timestamp: new Date(),
          metadata: {
            component: 'story-preview',
            action: 'completed',
            data: story,
            isGenerationUpdate: true
          }
        }
        
        setMessages(prev => [...prev, completionMessage])
      } else {
        // For other children's stories, just update the generated story if it matches
        if (story.id === generatedStory?.id) {
          setGeneratedStory(story)
        }
      }
    })
    
    return unsubscribe
  }, [child.id, child.name])

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
    if (loading) return
    
    setLoading(true)
    
    try {
      const updatedMessages = await sendChatMessage(content, messages)
      setMessages(updatedMessages)
      
      // Check if the AI wants to create a story
      const lastMessage = updatedMessages[updatedMessages.length - 1]
      if (lastMessage.metadata?.component === 'story-request') {
        const storyRequest: StoryRequest = {
          ...lastMessage.metadata.data,
          childId: child.id
        }
        
        // Start story generation
        setIsGenerating(true)
        const storyMessages = await requestStoryGeneration(storyRequest, updatedMessages)
        setMessages(storyMessages)
        
        // Extract story ID and start polling
        const storyGenMessage = storyMessages[storyMessages.length - 1]
        if (storyGenMessage.metadata?.data?.storyId) {
          const storyId = storyGenMessage.metadata.data.storyId
          pollForStoryCompletion(storyId)
        }
      }
    } catch (error) {
      console.error('Failed to send message:', error)
      addMessage('Sorry, I had trouble processing your message. Please try again.', 'assistant')
    } finally {
      setLoading(false)
    }
  }

  const handleThemeSelection = async (themeId: string) => {
    const theme = storyThemes.find(t => t.id === themeId)
    if (!theme) return

    setSelectedTheme(themeId)
    
    const storyRequest: StoryRequest = {
      childId: child.id,
      theme: theme.name,
      preferredLength: 'medium'
    }
    
    try {
      setIsGenerating(true)
      
      // Add user message about theme selection
      addMessage(`I'd love a ${theme.name.toLowerCase()} story!`, 'user')
      
      // Request story generation
      const updatedMessages = await requestStoryGeneration(storyRequest, messages)
      setMessages(updatedMessages)
      
      // Extract story ID from the response metadata
      const lastMessage = updatedMessages[updatedMessages.length - 1]
      if (lastMessage.metadata?.data?.storyId) {
        const storyId = lastMessage.metadata.data.storyId
        // Start polling for completion
        pollForStoryCompletion(storyId)
      }
    } catch (error) {
      console.error('Failed to create story:', error)
      addMessage('Sorry, I had trouble creating your story. Please try again.', 'assistant')
      setIsGenerating(false)
    }
  }


  // Poll for story completion
  const pollForStoryCompletion = async (storyId: string) => {
    const maxAttempts = 30 // 30 seconds max
    let attempts = 0
    
    const poll = async () => {
      if (attempts >= maxAttempts) {
        setIsGenerating(false)
        addMessage('Story generation is taking longer than expected. Please check your library later.', 'assistant')
        return
      }
      
      try {
        const completionMessages = await checkStoryGenerationStatus(storyId)
        console.log(`Polling for story ${storyId}, attempt ${attempts}, found ${completionMessages.length} messages`)
        
        if (completionMessages.length > 0) {
          // Story is complete
          console.log('Story completed! Adding to messages:', completionMessages[0])
          setMessages(prev => [...prev, ...completionMessages])
          setIsGenerating(false)
          
          // Set the generated story for display
          const completedStory = completionMessages[0]?.metadata?.data
          if (completedStory) {
            setGeneratedStory(completedStory)
          }
          return
        }
        
        // Continue polling
        attempts++
        setTimeout(poll, 1000)
      } catch (error) {
        console.error('Error polling for story completion:', error)
        attempts++
        setTimeout(poll, 1000)
      }
    }
    
    setTimeout(poll, 1000) // Start polling after 1 second
  }

  const handleStartNewStory = async () => {
    try {
      const initialMessage = await getInitialChatMessage()
      setMessages([{
        ...initialMessage,
        content: `Great! Let's create another amazing story for ${child.name}. What adventure should we go on this time?`
      }])
      setSelectedTheme('')
      setGeneratedStory(null)
      setIsGenerating(false)
    } catch (error) {
      console.error('Failed to restart chat:', error)
    }
  }

  // Show story reader if active
  if (showStoryReader && generatedStory) {
    return (
      <StoryReader
        story={generatedStory}
        onClose={() => setShowStoryReader(false)}
        onShare={() => {
          console.log('Share story:', generatedStory.id)
          // In a real app, this would handle sharing
        }}
      />
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <ChatHeader child={child} onBack={onBack} />
      
      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {messages.map((message) => (
          <div key={message.id}>
            <ChatMessageBubble message={message} />
            
            {/* Show theme selector when available */}
            {storyThemes.length > 0 && !selectedTheme && !isGenerating && messages.length > 1 && (
              <div className="mt-4 ml-8 mr-16">
                <ThemeSelector
                  themes={storyThemes}
                  onThemeSelect={handleThemeSelection}
                  disabled={loading}
                />
              </div>
            )}
            
            {/* Show story preview */}
            {message.metadata?.component === 'story-preview' && message.metadata?.data && (
              <div className="mt-4 ml-8 mr-16">
                <StoryPreview
                  story={message.metadata.data}
                  onStartNewStory={handleStartNewStory}
                  onReadStory={() => {
                    setGeneratedStory(message.metadata.data)
                    setShowStoryReader(true)
                  }}
                />
              </div>
            )}
          </div>
        ))}
        
        {/* Generation progress */}
        {isGenerating && (
          <div className="ml-8 mr-16">
            <Card className="p-4">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
                  <div className="w-3 h-3 border-2 border-primary border-t-transparent animate-spin rounded-full"></div>
                </div>
                <span className="font-medium text-foreground">Creating your magical story...</span>
              </div>
            </Card>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      {/* Chat Input */}
      {!isGenerating && (
        <div className="border-t border-border bg-background p-4">
          <ChatInput 
            onSendMessage={handleUserMessage}
            placeholder={`Tell me what kind of story ${child.name} would love...`}
            disabled={loading}
          />
        </div>
      )}
    </div>
  )
}