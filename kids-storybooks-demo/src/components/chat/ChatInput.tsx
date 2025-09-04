'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Send } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ChatInputProps {
  onSendMessage: (message: string) => void
  placeholder?: string
  disabled?: boolean
}

export function ChatInput({ 
  onSendMessage, 
  placeholder = "Type your message...",
  disabled = false
}: ChatInputProps) {
  const [message, setMessage] = useState('')
  const [isComposing, setIsComposing] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px'
    }
  }, [message])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (message.trim() && !disabled && !isComposing) {
      onSendMessage(message.trim())
      setMessage('')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const quickSuggestions = [
    "Adventure story",
    "Princess story", 
    "Space adventure",
    "Animal friends"
  ]

  return (
    <div className="max-w-4xl mx-auto">
      {/* Quick suggestions */}
      {message.length === 0 && !disabled && (
        <div className="mb-3">
          <p className="text-xs text-muted-foreground mb-2">Quick suggestions:</p>
          <div className="flex flex-wrap gap-2">
            {quickSuggestions.map((suggestion) => (
              <Button
                key={suggestion}
                onClick={() => setMessage(suggestion)}
                variant="outline"
                size="sm"
                className="rounded-full text-xs h-7"
              >
                {suggestion}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Input form */}
      <form onSubmit={handleSubmit} className="flex items-end space-x-3">
        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            onCompositionStart={() => setIsComposing(true)}
            onCompositionEnd={() => setIsComposing(false)}
            placeholder={placeholder}
            disabled={disabled}
            className={cn(
              "resize-none min-h-[52px] max-h-[120px] rounded-2xl transition-all",
              "focus:ring-2 focus:ring-primary focus:border-primary"
            )}
            rows={1}
          />
        </div>
        
        <Button
          type="submit"
          disabled={!message.trim() || disabled || isComposing}
          size="icon"
          className="w-12 h-12 rounded-2xl shadow-lg flex-shrink-0"
        >
          <Send className="w-5 h-5" />
          <span className="sr-only">Send message</span>
        </Button>
      </form>
    </div>
  )
}