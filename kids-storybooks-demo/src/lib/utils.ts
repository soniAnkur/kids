import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatRelativeTime(date: Date): string {
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  
  if (diffInSeconds < 60) {
    return 'just now'
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`
  }
  
  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 30) {
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`
  }
  
  return date.toLocaleDateString()
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(part => part.charAt(0).toUpperCase())
    .join('')
    .slice(0, 2)
}

export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

export function estimateReadingTime(wordCount: number, ageGroup: number = 6): number {
  // Average reading speeds by age group (words per minute)
  const readingSpeeds = {
    3: 20,   // 3-4 years (read-aloud pace)
    4: 25,   // 4-5 years
    5: 30,   // 5-6 years
    6: 40,   // 6-7 years
    7: 60,   // 7-8 years
    8: 80,   // 8+ years
  }
  
  const wpm = readingSpeeds[Math.min(ageGroup, 8) as keyof typeof readingSpeeds] || 40
  return Math.ceil(wordCount / wpm)
}

export function validatePhotoFile(file: File): { valid: boolean; error?: string } {
  // Check file type
  if (!file.type.match(/^image\/(jpeg|jpg|png|webp)$/)) {
    return { valid: false, error: 'Please upload a JPEG, PNG, or WebP image file.' }
  }
  
  // Check file size (max 10MB)
  if (file.size > 10 * 1024 * 1024) {
    return { valid: false, error: 'File size must be less than 10MB.' }
  }
  
  return { valid: true }
}

export function sanitizeFileName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

// Mock API delay for demo purposes
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// Simulate API call with loading states
export async function simulateApiCall<T>(
  operation: () => T,
  minDelay: number = 1000,
  maxDelay: number = 3000
): Promise<T> {
  const delayTime = Math.random() * (maxDelay - minDelay) + minDelay
  await delay(delayTime)
  return operation()
}