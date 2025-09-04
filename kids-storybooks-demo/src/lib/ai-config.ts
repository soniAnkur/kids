import OpenAI from 'openai'

// Initialize OpenAI client
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// AI Model configurations
export const AI_MODELS = {
  // Chat models
  CHAT_MODEL: process.env.OPENAI_MODEL || 'gpt-4o-mini',
  STORY_MODEL: process.env.OPENAI_STORY_MODEL || 'gpt-4o',
  
  // Image models  
  IMAGE_MODEL: process.env.OPENAI_IMAGE_MODEL || 'dall-e-3',
  
  // Model parameters
  CHAT_TEMPERATURE: 0.7,
  STORY_TEMPERATURE: 0.8,
  MAX_TOKENS: {
    CHAT: 500,
    STORY: 2000,
  }
} as const

// AI Service configuration
export const AI_CONFIG = {
  // Rate limiting
  MAX_REQUESTS_PER_MINUTE: 60,
  MAX_STORY_GENERATIONS_PER_DAY: 10,
  
  // Content safety
  CONTENT_SAFETY_LEVEL: 'strict' as const,
  AGE_APPROPRIATE_FILTERING: true,
  
  // Image generation
  IMAGE_SIZE: '1024x1024' as const,
  IMAGE_QUALITY: 'standard' as const,
  IMAGE_STYLE: 'vivid' as const,
  
  // Story generation
  DEFAULT_STORY_LENGTH: 'medium' as const,
  MIN_PAGES: 3,
  MAX_PAGES: 10,
  
  // Retry configuration
  MAX_RETRIES: 3,
  RETRY_DELAY_MS: 1000,
} as const

// Validate environment variables
export function validateAIConfig(): { isValid: boolean; missingVars: string[] } {
  const requiredVars = ['OPENAI_API_KEY']
  const missingVars: string[] = []
  
  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      missingVars.push(varName)
    }
  }
  
  return {
    isValid: missingVars.length === 0,
    missingVars
  }
}

// Error handling utilities
export class AIServiceError extends Error {
  constructor(
    message: string,
    public code: string,
    public originalError?: unknown
  ) {
    super(message)
    this.name = 'AIServiceError'
  }
}

export function handleAIError(error: unknown, context: string): AIServiceError {
  console.error(`AI Error in ${context}:`, error)
  
  if (error instanceof OpenAI.APIError) {
    return new AIServiceError(
      `OpenAI API error: ${error.message}`,
      error.code || 'OPENAI_ERROR',
      error
    )
  }
  
  if (error instanceof Error) {
    return new AIServiceError(
      error.message,
      'UNKNOWN_ERROR',
      error
    )
  }
  
  return new AIServiceError(
    'An unexpected error occurred',
    'UNKNOWN_ERROR',
    error
  )
}

// Content safety utilities
export function isContentSafe(text: string): boolean {
  const unsafePatterns = [
    /violent|violence|kill|death|scary|frightening|nightmare/i,
    /inappropriate|adult|mature/i,
    /hate|discrimination|prejudice/i
  ]
  
  return !unsafePatterns.some(pattern => pattern.test(text))
}

export function sanitizeForChildren(text: string): string {
  // Replace any potentially concerning words with child-friendly alternatives
  return text
    .replace(/scary/gi, 'surprising')
    .replace(/frightening/gi, 'mysterious')
    .replace(/dangerous/gi, 'challenging')
    .replace(/problem/gi, 'puzzle')
    .trim()
}