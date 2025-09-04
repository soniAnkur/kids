'use server'

import { ChatMessage, StoryRequest, Child } from '@/types'
import { processUserMessage } from '@/lib/ai-chat-handler'
import { createStory, getStoryById, getStoryGenerationStatus } from './story-actions'
import { getChildren } from './child-actions'

export async function sendChatMessage(
  message: string,
  conversationHistory: ChatMessage[] = []
): Promise<ChatMessage[]> {
  await new Promise(resolve => setTimeout(resolve, 100))
  
  // Add user message to history
  const userMessage: ChatMessage = {
    id: `msg-${Date.now()}`,
    type: 'user',
    content: message,
    timestamp: new Date()
  }
  
  const updatedHistory = [...conversationHistory, userMessage]
  
  try {
    // Process the message with AI
    const aiResponse = await processUserMessage(message, conversationHistory)
    console.log('AI Response:', aiResponse);
    
    const assistantMessage: ChatMessage = {
      id: `msg-${Date.now() + 1}`,
      type: 'assistant',
      content: aiResponse.content,
      timestamp: new Date(),
      metadata: aiResponse.metadata
    }
    
    return [...updatedHistory, assistantMessage]
    
  } catch (error) {
    console.error('Chat processing error:', error)
    
    const errorMessage: ChatMessage = {
      id: `msg-${Date.now() + 1}`,
      type: 'assistant',
      content: "I'm sorry, I'm having trouble processing your request right now. Please try again.",
      timestamp: new Date()
    }
    
    return [...updatedHistory, errorMessage]
  }
}

export async function requestStoryGeneration(
  request: StoryRequest,
  conversationHistory: ChatMessage[] = []
): Promise<ChatMessage[]> {
  try {
    // Start story generation
    const { storyId } = await createStory(request)
    
    const children = await getChildren()
    const child = children.find(c => c.id === request.childId)
    const childName = child?.name || 'your child'
    
    const responseMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      type: 'assistant',
      content: `🎉 I'm creating a wonderful ${request.theme} story for ${childName}! This will take a few moments while I craft the perfect adventure and create beautiful illustrations.`,
      timestamp: new Date(),
      metadata: {
        component: 'story-generation',
        action: 'started',
        data: { storyId, request },
        isGenerationUpdate: true
      }
    }
    
    return [...conversationHistory, responseMessage]
    
  } catch (error) {
    console.error('Story generation request error:', error)
    
    const errorMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      type: 'assistant',
      content: "I'm sorry, I couldn't start creating your story right now. Please try again.",
      timestamp: new Date()
    }
    
    return [...conversationHistory, errorMessage]
  }
}


export async function checkStoryGenerationStatus(storyId: string): Promise<ChatMessage[]> {
  const status = await getStoryGenerationStatus(storyId)
  console.log(`Checking status for story ${storyId}: ${status}`)
  const messages: ChatMessage[] = []
  
  if (status === 'completed') {
    const story = await getStoryById(storyId)
    console.log(`Found completed story:`, story ? `${story.id} - ${story.title}` : 'null')
    
    if (story) {
      const children = await getChildren()
      const child = children.find(c => c.id === story.childId)
      const childName = child?.name || 'your child'
      
      const completionMessage: ChatMessage = {
        id: `msg-completion-${Date.now()}`,
        type: 'assistant',
        content: `🎉 ${childName}'s story "${story.title}" is ready! It's a wonderful adventure with ${story.content.length} pages.`,
        timestamp: new Date(),
        metadata: {
          component: 'story-preview',
          action: 'completed',
          data: story,
          isGenerationUpdate: true
        }
      }
      messages.push(completionMessage)
    }
  }
  
  return messages
}

export async function getInitialChatMessage(): Promise<ChatMessage> {
  return {
    id: 'msg-welcome',
    type: 'assistant',
    content: "Hi! I'm here to help you create magical personalized stories for your child. What kind of adventure should we create today?",
    timestamp: new Date()
  }
}