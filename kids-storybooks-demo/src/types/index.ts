// Core Types for KidsVerse Personalized Storybooks

export interface Child {
  id: string;
  name: string;
  age: number;
  photoUrl?: string;
  personality: PersonalityTrait[];
  interests: Interest[];
  createdAt: Date;
  updatedAt: Date;
}

export interface PersonalityTrait {
  id: string;
  name: string;
  description: string;
  category: 'social' | 'learning' | 'creative' | 'active';
}

export interface Interest {
  id: string;
  name: string;
  category: string;
  emoji: string;
}

export interface Story {
  id: string;
  title: string;
  theme: string;
  childId: string;
  content: StoryPage[];
  coverImage: string;
  generatedAt: Date;
  readCount: number;
  isFavorite: boolean;
  shareUrl?: string;
  status: 'generating' | 'ready' | 'error';
  estimatedReadTime: number;
  educationalObjectives: string[];
  moralLessons: string[];
}

export interface StoryPage {
  id: string;
  pageNumber: number;
  text: string;
  illustration: string;
  narrationUrl?: string;
}

export interface ChatMessage {
  id: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: {
    component?: string;
    action?: string;
    data?: any;
    isGenerationUpdate?: boolean;
  };
}

export interface StoryRequest {
  childId: string;
  theme: string;
  customPrompt?: string;
  preferredLength: 'short' | 'medium' | 'long';
  educationalFocus?: string[];
  includePhotos?: boolean;
}

export interface GenerationProgress {
  step: 'analyzing' | 'writing' | 'illustrating' | 'finalizing' | 'complete';
  progress: number;
  message: string;
  estimatedTimeRemaining?: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  children: Child[];
  subscription: SubscriptionPlan;
  createdAt: Date;
  preferences: UserPreferences;
}

export interface SubscriptionPlan {
  type: 'free' | 'premium' | 'family';
  storiesPerMonth: number;
  hasVoiceNarration: boolean;
  hasPrintOnDemand: boolean;
  hasAdvancedCustomization: boolean;
}

export interface UserPreferences {
  defaultStoryLength: 'short' | 'medium' | 'long';
  autoShare: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
  contentSafety: 'strict' | 'moderate';
}

export interface ShareOptions {
  type: 'email' | 'link' | 'social';
  recipients?: string[];
  message?: string;
  expiresAt?: Date;
}