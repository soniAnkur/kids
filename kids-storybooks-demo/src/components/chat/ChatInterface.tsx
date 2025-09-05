'use client'

import { useState, useEffect, useRef } from 'react'
import { ReactNode } from 'react'
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
import { generateStreamingStory } from '@/actions/stream-story-optimized'
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
  const [streamingStory, setStreamingStory] = useState<ReactNode | null>(null)
  
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

  // Listen for events from the StreamedStoryCard
  useEffect(() => {
    const handleReadStory = (event: CustomEvent) => {
      const story = event.detail?.story
      if (story) {
        console.log('CLIENT: Read story requested from streamed card:', story.title)
        setGeneratedStory(story)
        setShowStoryReader(true)
        setStreamingStory(null) // Hide the streaming story card
      }
    }

    const handleFindInLibrary = () => {
      console.log('CLIENT: Find in library requested from streamed card')
      // Here you could navigate to library or show a message
      const libraryMessage = {
        id: `msg-library-${Date.now()}`,
        type: 'assistant' as const,
        content: '💡 You can find this story in your Story Library!',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, libraryMessage])
      setStreamingStory(null) // Hide the streaming story card
    }

    window.addEventListener('streamed-story:read', handleReadStory as EventListener)
    window.addEventListener('streamed-story:library', handleFindInLibrary)

    return () => {
      window.removeEventListener('streamed-story:read', handleReadStory as EventListener)
      window.removeEventListener('streamed-story:library', handleFindInLibrary)
    }
  }, [])


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
        
        // Start streaming story generation
        setIsGenerating(true)
        console.log('CLIENT: Starting streaming story generation...')
        const streamedStory = await generateStreamingStory(storyRequest)
        console.log('CLIENT: Received streamed story:', !!streamedStory)
        setStreamingStory(streamedStory)
        setIsGenerating(false)
        console.log('CLIENT: Streaming story state updated')
        
        // Check for newly generated story after streaming completes
        // Give it a moment for the story to be saved
        setTimeout(async () => {
          try {
            const { getAllStories } = await import('@/actions/story-actions')
            const allStories = await getAllStories()
            const latestStory = allStories
              .filter(story => story.childId === child.id)
              .sort((a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime())[0]
            
            if (latestStory) {
              console.log('CLIENT: Found newly generated story, triggering event:', latestStory.title)
              const { notifyStoryGenerated } = await import('@/lib/story-events')
              notifyStoryGenerated(latestStory)
            }
          } catch (error) {
            console.error('CLIENT: Failed to check for generated story:', error)
          }
        }, 1000)
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
      
      // Add AI response message
      addMessage(`🎉 Perfect choice! I'm creating a wonderful ${theme.name.toLowerCase()} story for ${child.name}. This will be magical!`, 'assistant')
      
      // Start streaming story generation
      console.log('CLIENT: Starting theme-based streaming story generation...')
      const streamedStory = await generateStreamingStory(storyRequest)
      console.log('CLIENT: Received theme-based streamed story:', !!streamedStory)
      setStreamingStory(streamedStory)
      setIsGenerating(false)
      console.log('CLIENT: Theme-based streaming story state updated')
      
      // Check for newly generated story after streaming completes
      // Give it a moment for the story to be saved
      setTimeout(async () => {
        try {
          const { getAllStories } = await import('@/actions/story-actions')
          const allStories = await getAllStories()
          const latestStory = allStories
            .filter(story => story.childId === child.id)
            .sort((a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime())[0]
          
          if (latestStory) {
            console.log('CLIENT: Found newly generated theme-based story, triggering event:', latestStory.title)
            const { notifyStoryGenerated } = await import('@/lib/story-events')
            notifyStoryGenerated(latestStory)
          }
        } catch (error) {
          console.error('CLIENT: Failed to check for generated theme-based story:', error)
        }
      }, 1000)
      
    } catch (error) {
      console.error('Failed to create story:', error)
      addMessage('Sorry, I had trouble creating your story. Please try again.', 'assistant')
      setIsGenerating(false)
    }
  }


  // Note: Polling functionality replaced with streaming story generation

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
      setStreamingStory(null)
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
        
        {/* Streaming story generation */}
        {streamingStory && (
          <div className="ml-8 mr-16">
            {streamingStory}
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