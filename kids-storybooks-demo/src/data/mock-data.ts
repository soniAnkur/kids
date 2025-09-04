// Mock data for KidsVerse Personalized Storybooks Demo

import { Child, Story, PersonalityTrait, Interest, ChatMessage, User } from '@/types'

export const mockPersonalityTraits: PersonalityTrait[] = [
  { id: '1', name: 'Adventurous', description: 'Loves exploring and trying new things', category: 'active' },
  { id: '2', name: 'Creative', description: 'Enjoys art, music, and imaginative play', category: 'creative' },
  { id: '3', name: 'Curious', description: 'Always asking questions and learning', category: 'learning' },
  { id: '4', name: 'Friendly', description: 'Gets along well with others', category: 'social' },
  { id: '5', name: 'Brave', description: 'Not afraid to face challenges', category: 'active' },
  { id: '6', name: 'Kind', description: 'Shows compassion and empathy', category: 'social' },
  { id: '7', name: 'Funny', description: 'Loves to make others laugh', category: 'social' },
  { id: '8', name: 'Thoughtful', description: 'Considers others feelings', category: 'social' }
]

export const mockInterests: Interest[] = [
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

export const mockChildren: Child[] = [
  {
    id: 'child-1',
    name: 'Emma',
    age: 5,
    photoUrl: '/api/placeholder/child/emma.jpg',
    personality: [mockPersonalityTraits[0], mockPersonalityTraits[1], mockPersonalityTraits[3]],
    interests: [mockInterests[0], mockInterests[3], mockInterests[7]],
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-02-01')
  },
  {
    id: 'child-2',
    name: 'Liam',
    age: 7,
    photoUrl: '/api/placeholder/child/liam.jpg',
    personality: [mockPersonalityTraits[4], mockPersonalityTraits[2], mockPersonalityTraits[6]],
    interests: [mockInterests[1], mockInterests[4], mockInterests[6]],
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-02-05')
  }
]

export const mockStories: Story[] = [
  {
    id: 'story-1',
    title: 'Emma and the Magical Forest Adventure',
    theme: 'Forest Adventure',
    childId: 'child-1',
    content: [
      {
        id: 'page-1',
        pageNumber: 1,
        text: 'Once upon a time, Emma discovered a magical path in her backyard that led to an enchanted forest.',
        illustration: '/api/placeholder/story/forest-entrance.jpg'
      },
      {
        id: 'page-2',
        pageNumber: 2,
        text: 'As Emma stepped into the forest, colorful butterflies danced around her, welcoming her to their magical home.',
        illustration: '/api/placeholder/story/butterflies.jpg'
      },
      {
        id: 'page-3',
        pageNumber: 3,
        text: 'Deep in the forest, Emma met a wise owl who needed help finding his lost acorns for winter.',
        illustration: '/api/placeholder/story/wise-owl.jpg'
      }
    ],
    coverImage: '/api/placeholder/story/emma-forest-cover.jpg',
    generatedAt: new Date('2024-02-01'),
    readCount: 12,
    isFavorite: true,
    status: 'ready',
    estimatedReadTime: 5,
    educationalObjectives: ['Problem Solving', 'Empathy', 'Nature Appreciation'],
    moralLessons: ['Helping Others', 'Being Kind to Animals']
  },
  {
    id: 'story-2',
    title: 'Liam's Space Mission to Mars',
    theme: 'Space Adventure',
    childId: 'child-2',
    content: [
      {
        id: 'page-1',
        pageNumber: 1,
        text: 'Astronaut Liam received an important mission: deliver supplies to the Mars research station.',
        illustration: '/api/placeholder/story/space-mission.jpg'
      },
      {
        id: 'page-2',
        pageNumber: 2,
        text: 'Liam piloted his rocket through asteroid fields, using his quick thinking to navigate safely.',
        illustration: '/api/placeholder/story/asteroid-field.jpg'
      }
    ],
    coverImage: '/api/placeholder/story/liam-space-cover.jpg',
    generatedAt: new Date('2024-02-03'),
    readCount: 8,
    isFavorite: false,
    status: 'ready',
    estimatedReadTime: 4,
    educationalObjectives: ['STEM Learning', 'Problem Solving', 'Courage'],
    moralLessons: ['Perseverance', 'Helping Others']
  }
]

export const mockUser: User = {
  id: 'user-1',
  email: 'parent@example.com',
  name: 'Sarah Johnson',
  children: mockChildren,
  subscription: {
    type: 'premium',
    storiesPerMonth: 10,
    hasVoiceNarration: true,
    hasPrintOnDemand: true,
    hasAdvancedCustomization: true
  },
  createdAt: new Date('2024-01-10'),
  preferences: {
    defaultStoryLength: 'medium',
    autoShare: false,
    emailNotifications: true,
    pushNotifications: true,
    contentSafety: 'strict'
  }
}

export const mockChatMessages: ChatMessage[] = [
  {
    id: 'msg-1',
    type: 'assistant',
    content: 'Hi! I\'m here to help you create magical personalized stories for your child. What kind of adventure should we create today?',
    timestamp: new Date()
  }
]

// Story themes with descriptions and examples
export const storyThemes = [
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

// Sample AI responses for chat simulation
export const aiResponses = {
  storyRequest: [
    "That sounds like an amazing adventure! Let me create a personalized story where {childName} becomes the hero of their own {theme} story.",
    "What a wonderful idea! I'll craft a special tale featuring {childName} as the main character in a {theme} adventure.",
    "Perfect choice! {childName} is going to love being the star of this {theme} story. Let me work on something magical!"
  ],
  generating: [
    "I'm crafting the perfect adventure for {childName}...",
    "Creating magical illustrations that feature {childName}...",
    "Writing an educational story with important lessons...",
    "Almost ready! Adding the finishing touches to {childName}'s story..."
  ],
  completed: [
    "🎉 Your story is ready! {childName}'s adventure awaits in '{title}'",
    "✨ All done! I've created a magical story called '{title}' starring {childName}",
    "📚 Story complete! '{title}' is ready for {childName} to enjoy"
  ]
}