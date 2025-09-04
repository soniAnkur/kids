'use client'

import { Story } from '@/types'

// Simple event system for notifying when stories are generated (client-side only)
type StoryGeneratedCallback = (story: Story) => void
const storyGeneratedCallbacks: StoryGeneratedCallback[] = []

export function onStoryGenerated(callback: StoryGeneratedCallback) {
  storyGeneratedCallbacks.push(callback)
  return () => {
    const index = storyGeneratedCallbacks.indexOf(callback)
    if (index > -1) storyGeneratedCallbacks.splice(index, 1)
  }
}

export function notifyStoryGenerated(story: Story) {
  storyGeneratedCallbacks.forEach(callback => callback(story))
}

// Export for server-side story actions to trigger notifications
if (typeof window !== 'undefined') {
  ;(window as any).__notifyStoryGenerated = notifyStoryGenerated
}