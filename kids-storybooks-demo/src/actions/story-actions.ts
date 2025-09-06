'use server'

import { Story, StoryRequest, GenerationProgress } from '@/types'
import { generateStoryContent } from '@/lib/ai-story-generator'
import { generateStoryIllustrations } from '@/lib/ai-image-generator'
import { getChildren } from './child-actions'

// In-memory storage for generated stories (for demo purposes)
// Clear on server restart to avoid stale data
const generatedStories: Story[] = []
console.log('Story storage initialized. Starting with empty array.')

// Track story generation status
const storyGenerationStatus = new Map<string, 'generating' | 'completed' | 'error'>()

function notifyStoryGenerated(story: Story) {
  // Use window global to notify client-side listeners
  if (typeof window !== 'undefined' && (window as any).__notifyStoryGenerated) {
    ;(window as any).__notifyStoryGenerated(story)
  }
}

export async function getStoriesForChild(childId: string): Promise<Story[]> {
  await new Promise(resolve => setTimeout(resolve, 50))
  
  // Return only generated stories - no mock data
  return generatedStories.filter(story => story.childId === childId)
}

export async function getAllStories(): Promise<Story[]> {
  await new Promise(resolve => setTimeout(resolve, 50))
  
  // Return all generated stories
  return [...generatedStories]
}

export async function getStoryById(storyId: string): Promise<Story | null> {
  const allStories = await getAllStories()
  return allStories.find(story => story.id === storyId) || null
}

export async function createStory(request: StoryRequest): Promise<{ storyId: string }> {
  await new Promise(resolve => setTimeout(resolve, 100))
  
  const storyId = `story-${Date.now()}`
  console.log(`Creating story with ID: ${storyId} for child: ${request.childId}`)
  
  // Mark story as generating
  storyGenerationStatus.set(storyId, 'generating')
  
  // Start background story generation
  generateStoryInBackground(storyId, request)
  
  return { storyId }
}

export async function getStoryGenerationStatus(storyId: string): Promise<'generating' | 'completed' | 'error' | 'unknown'> {
  return storyGenerationStatus.get(storyId) || 'unknown'
}

async function generateStoryInBackground(storyId: string, request: StoryRequest) {
  try {
    // In a real app, save initial story record with 'generating' status
    console.log(`Starting story generation for ${storyId}`)
    
    // Get child information for context
    const children = await getChildren()
    const child = children.find(c => c.id === request.childId)
    
    // Generate story content using AI
    const content = await generateStoryContent(request)
    
    // Generate illustrations using AI with child context
    const illustrations = await generateStoryIllustrations(
      content, 
      request, 
      child?.name, 
      child?.age
    )
    
    // Combine content with illustrations
    const story: Story = {
      id: storyId,
      title: content.title,
      theme: request.theme,
      childId: request.childId,
      content: content.pages.map((page, index) => ({
        id: `page-${index + 1}`,
        pageNumber: index + 1,
        text: page.text,
        illustration: illustrations[index] || '/api/placeholder/story/default.jpg'
      })),
      coverImage: illustrations[0] || '/api/placeholder/story/cover.jpg',
      generatedAt: new Date(),
      readCount: 0,
      isFavorite: false,
      status: 'ready',
      estimatedReadTime: content.estimatedReadTime,
      educationalObjectives: content.educationalObjectives,
      moralLessons: content.moralLessons
    }
    
    // Store the generated story in our in-memory storage
    generatedStories.push(story)
    storyGenerationStatus.set(storyId, 'completed')
    
    console.log(`Story ${storyId} stored. Total stories: ${generatedStories.length}`)
    console.log('Generated stories IDs:', generatedStories.map(s => s.id))
    
    // Notify callbacks that story is ready
    notifyStoryGenerated(story)
    
    console.log('Story generation complete and stored:', story)
    
  } catch (error) {
    console.error('Story generation failed:', error)
    storyGenerationStatus.set(storyId, 'error')
    // In a real app, update story status to 'error'
  }
}

export async function updateStoryFavorite(storyId: string, isFavorite: boolean): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 100))
  
  // In a real app, update in database
  console.log(`Updated story ${storyId} favorite status to ${isFavorite}`)
}

export async function incrementReadCount(storyId: string): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 100))
  
  // In a real app, update in database
  console.log(`Incremented read count for story ${storyId}`)
}

export async function saveGeneratedStory(story: Story): Promise<void> {
  // Add the story to our in-memory storage
  generatedStories.push(story)
  console.log(`Story ${story.id} saved to storage. Total stories: ${generatedStories.length}`)
  console.log('All story IDs:', generatedStories.map(s => s.id))
  
  // Notify any listeners that a new story was generated
  notifyStoryGenerated(story)
}

export async function getStoryThemes() {
  await new Promise(resolve => setTimeout(resolve, 50))
  
  return [
    {
      id: 'adventure',
      name: 'Adventure',
      description: 'Exciting journeys and exploration',
      emoji: '🗺️',
      examples: ['Treasure hunt', 'Mountain climbing', 'Jungle exploration']
    },
    {
      id: 'fantasy',
      name: 'Fantasy',
      description: 'Magical worlds and creatures',
      emoji: '🧙‍♀️',
      examples: ['Dragon friends', 'Fairy kingdoms', 'Magic school']
    },
    {
      id: 'space',
      name: 'Space',
      description: 'Cosmic adventures and alien friends',
      emoji: '🚀',
      examples: ['Mars missions', 'Alien encounters', 'Space stations']
    },
    {
      id: 'ocean',
      name: 'Ocean',
      description: 'Underwater adventures and sea creatures',
      emoji: '🌊',
      examples: ['Mermaid friends', 'Submarine adventures', 'Coral reef exploration']
    },
    {
      id: 'superhero',
      name: 'Superhero',
      description: 'Saving the day with special powers',
      emoji: '🦸',
      examples: ['Flying adventures', 'Helping others', 'Secret missions']
    },
    {
      id: 'animals',
      name: 'Animal Friends',
      description: 'Adventures with animal companions',
      emoji: '🐾',
      examples: ['Safari adventures', 'Pet rescue', 'Talking animals']
    },
    {
      id: 'mystery',
      name: 'Mystery',
      description: 'Solving puzzles and finding clues',
      emoji: '🔍',
      examples: ['Missing toys', 'Secret codes', 'Detective work']
    },
    {
      id: 'friendship',
      name: 'Friendship',
      description: 'Stories about making and keeping friends',
      emoji: '👫',
      examples: ['New school friends', 'Helping friends', 'Team adventures']
    }
  ]
}