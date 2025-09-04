'use server'

import { Child, PersonalityTrait, Interest } from '@/types'

// In a real app, these would connect to a database
// For now, we'll use the mock data but simulate server responses

export async function getPersonalityTraits(): Promise<PersonalityTrait[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 100))
  
  return [
    { id: '1', name: 'Adventurous', description: 'Loves exploring and trying new things', category: 'active' },
    { id: '2', name: 'Creative', description: 'Enjoys art, music, and imaginative play', category: 'creative' },
    { id: '3', name: 'Curious', description: 'Always asking questions and learning', category: 'learning' },
    { id: '4', name: 'Friendly', description: 'Gets along well with others', category: 'social' },
    { id: '5', name: 'Brave', description: 'Not afraid to face challenges', category: 'active' },
    { id: '6', name: 'Kind', description: 'Shows compassion and empathy', category: 'social' },
    { id: '7', name: 'Funny', description: 'Loves to make others laugh', category: 'social' },
    { id: '8', name: 'Thoughtful', description: 'Considers others feelings', category: 'social' }
  ]
}

export async function getInterests(): Promise<Interest[]> {
  await new Promise(resolve => setTimeout(resolve, 100))
  
  return [
    { id: '1', name: 'Animals', category: 'nature', emoji: '🐾' },
    { id: '2', name: 'Space', category: 'science', emoji: '🚀' },
    { id: '3', name: 'Dinosaurs', category: 'science', emoji: '🦕' },
    { id: '4', name: 'Princesses', category: 'fantasy', emoji: '👑' },
    { id: '5', name: 'Superheroes', category: 'adventure', emoji: '🦸' },
    { id: '6', name: 'Ocean', category: 'nature', emoji: '🌊' },
    { id: '7', name: 'Cars', category: 'vehicles', emoji: '🚗' },
    { id: '8', name: 'Music', category: 'arts', emoji: '🎵' },
    { id: '9', name: 'Cooking', category: 'life-skills', emoji: '👨‍🍳' },
    { id: '10', name: 'Sports', category: 'active', emoji: '⚽' }
  ]
}

export async function getChildren(): Promise<Child[]> {
  await new Promise(resolve => setTimeout(resolve, 150))
  
  const traits = await getPersonalityTraits()
  const interests = await getInterests()
  
  return [
    {
      id: 'child-1',
      name: 'Emma',
      age: 5,
      photoUrl: '/api/placeholder/child/emma.jpg',
      personality: [traits[0], traits[1], traits[3]],
      interests: [interests[0], interests[3], interests[7]],
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-02-01')
    },
    {
      id: 'child-2',
      name: 'Liam',
      age: 7,
      photoUrl: '/api/placeholder/child/liam.jpg',
      personality: [traits[4], traits[2], traits[6]],
      interests: [interests[1], interests[4], interests[6]],
      createdAt: new Date('2024-01-20'),
      updatedAt: new Date('2024-02-05')
    }
  ]
}

export async function createChild(childData: Omit<Child, 'id' | 'createdAt' | 'updatedAt'>): Promise<Child> {
  await new Promise(resolve => setTimeout(resolve, 200))
  
  const newChild: Child = {
    ...childData,
    id: `child-${Date.now()}`,
    createdAt: new Date(),
    updatedAt: new Date()
  }
  
  // In a real app, save to database
  console.log('Creating child:', newChild)
  
  return newChild
}

export async function updateChild(childId: string, updates: Partial<Child>): Promise<Child> {
  await new Promise(resolve => setTimeout(resolve, 200))
  
  // In a real app, update in database
  const existingChildren = await getChildren()
  const child = existingChildren.find(c => c.id === childId)
  
  if (!child) {
    throw new Error('Child not found')
  }
  
  const updatedChild: Child = {
    ...child,
    ...updates,
    updatedAt: new Date()
  }
  
  console.log('Updating child:', updatedChild)
  
  return updatedChild
}