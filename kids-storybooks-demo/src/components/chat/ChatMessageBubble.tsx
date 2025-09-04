'use client'

import { ChatMessage } from '@/types'
import { formatRelativeTime } from '@/lib/utils'

interface ChatMessageBubbleProps {
  message: ChatMessage
}

export function ChatMessageBubble({ message }: ChatMessageBubbleProps) {
  const isUser = message.type === 'user'
  const isGenerationUpdate = message.metadata?.isGenerationUpdate

  if (isGenerationUpdate) {
    return (
      <div className="flex justify-start">
        <div className="max-w-xs sm:max-w-md bg-gray-100 text-gray-600 rounded-2xl rounded-bl-md px-4 py-2 mr-8 border border-gray-200 text-sm italic">
          {message.content}
        </div>
      </div>
    )
  }

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} group`}>
      <div className="flex flex-col space-y-1 max-w-xs sm:max-w-md">
        {/* Message bubble */}
        <div className={isUser ? 'chat-bubble-user' : 'chat-bubble-assistant'}>
          {message.content}
        </div>
        
        {/* Timestamp */}
        <div className={`text-xs text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${
          isUser ? 'text-right mr-2' : 'text-left ml-2'
        }`}>
          {formatRelativeTime(message.timestamp)}
        </div>
      </div>
    </div>
  )
}