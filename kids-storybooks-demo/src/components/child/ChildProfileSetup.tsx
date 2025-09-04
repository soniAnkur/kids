'use client'

import { useState } from 'react'
import { Child, PersonalityTrait, Interest } from '@/types'
import { mockPersonalityTraits, mockInterests } from '@/data/mock-data'
import { generateId, validatePhotoFile } from '@/lib/utils'

interface ChildProfileSetupProps {
  onComplete: (child: Child) => void
  onBack: () => void
}

export function ChildProfileSetup({ onComplete, onBack }: ChildProfileSetupProps) {
  const [step, setStep] = useState<'basic' | 'photo' | 'personality' | 'interests'>('basic')
  const [formData, setFormData] = useState({
    name: '',
    age: 5,
    photoFile: null as File | null,
    photoUrl: '',
    personality: [] as PersonalityTrait[],
    interests: [] as Interest[]
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleBasicInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    }

    if (formData.age < 3 || formData.age > 12) {
      newErrors.age = 'Age must be between 3 and 12'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setErrors({})
    setStep('photo')
  }

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const validation = validatePhotoFile(file)
    if (!validation.valid) {
      setErrors({ photo: validation.error || 'Invalid file' })
      return
    }

    setFormData(prev => ({
      ...prev,
      photoFile: file,
      photoUrl: URL.createObjectURL(file)
    }))
    setErrors({})
  }

  const togglePersonalityTrait = (trait: PersonalityTrait) => {
    setFormData(prev => ({
      ...prev,
      personality: prev.personality.find(t => t.id === trait.id)
        ? prev.personality.filter(t => t.id !== trait.id)
        : [...prev.personality, trait]
    }))
  }

  const toggleInterest = (interest: Interest) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.find(i => i.id === interest.id)
        ? prev.interests.filter(i => i.id !== interest.id)
        : [...prev.interests, interest]
    }))
  }

  const handleComplete = () => {
    const child: Child = {
      id: generateId(),
      name: formData.name,
      age: formData.age,
      photoUrl: formData.photoUrl,
      personality: formData.personality,
      interests: formData.interests,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    // In a real app, this would upload the photo and create the profile
    console.log('Creating child profile:', child)
    console.log('Photo file would be uploaded:', formData.photoFile)

    onComplete(child)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <header className="bg-glass border-b border-white/20 px-4 py-4 sticky top-0 z-40">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-white/80 flex items-center justify-center hover:bg-white transition-colors shadow-lg"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-800">Add Child Profile</h1>
            <p className="text-sm text-gray-600">
              Step {step === 'basic' ? 1 : step === 'photo' ? 2 : step === 'personality' ? 3 : 4} of 4
            </p>
          </div>
        </div>
      </header>

      <div className="px-4 py-6 max-w-lg mx-auto">
        {/* Basic Info Step */}
        {step === 'basic' && (
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">👶</span>
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">Tell me about your child</h2>
              <p className="text-gray-600 text-sm">
                This helps me create personalized stories just for them
              </p>
            </div>

            <form onSubmit={handleBasicInfoSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  What's their name?
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter your child's name"
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  How old are they?
                </label>
                <select
                  value={formData.age}
                  onChange={(e) => setFormData(prev => ({ ...prev, age: parseInt(e.target.value) }))}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  {Array.from({ length: 10 }, (_, i) => i + 3).map(age => (
                    <option key={age} value={age}>{age} years old</option>
                  ))}
                </select>
                {errors.age && <p className="text-red-500 text-sm mt-1">{errors.age}</p>}
              </div>

              <button
                type="submit"
                className="w-full bg-primary-500 hover:bg-primary-600 text-white py-3 rounded-xl font-medium transition-colors mt-6"
              >
                Continue
              </button>
            </form>
          </div>
        )}

        {/* Photo Upload Step */}
        {step === 'photo' && (
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">📸</span>
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">Add a photo (optional)</h2>
              <p className="text-gray-600 text-sm">
                This helps me create illustrations that look like {formData.name}
              </p>
            </div>

            <div className="space-y-4">
              {formData.photoUrl ? (
                <div className="text-center">
                  <img
                    src={formData.photoUrl}
                    alt="Child preview"
                    className="w-32 h-32 rounded-full object-cover mx-auto border-4 border-white shadow-lg"
                  />
                  <button
                    onClick={() => setFormData(prev => ({ ...prev, photoFile: null, photoUrl: '' }))}
                    className="mt-3 text-sm text-red-600 hover:text-red-700"
                  >
                    Remove photo
                  </button>
                </div>
              ) : (
                <label className="block cursor-pointer">
                  <div className="w-full border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-primary-300 hover:bg-primary-50 transition-colors">
                    <span className="text-4xl mb-3 block">📷</span>
                    <p className="text-gray-600 font-medium mb-1">Tap to upload a photo</p>
                    <p className="text-sm text-gray-500">JPG, PNG up to 10MB</p>
                  </div>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>
              )}
              
              {errors.photo && <p className="text-red-500 text-sm text-center">{errors.photo}</p>}

              <div className="flex space-x-3">
                <button
                  onClick={() => setStep('basic')}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-medium transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep('personality')}
                  className="flex-1 bg-primary-500 hover:bg-primary-600 text-white py-3 rounded-xl font-medium transition-colors"
                >
                  Continue
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Personality Traits Step */}
        {step === 'personality' && (
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-kids-pink/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">✨</span>
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">What is {formData.name} like?</h2>
              <p className="text-gray-600 text-sm">
                Pick traits that describe their personality
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6">
              {mockPersonalityTraits.map((trait) => (
                <button
                  key={trait.id}
                  onClick={() => togglePersonalityTrait(trait)}
                  className={`p-3 rounded-xl border-2 text-left transition-all duration-200 ${
                    formData.personality.find(t => t.id === trait.id)
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-200 hover:border-primary-300 hover:bg-primary-50'
                  }`}
                >
                  <div className="font-medium text-sm mb-1">{trait.name}</div>
                  <div className="text-xs text-gray-600">{trait.description}</div>
                </button>
              ))}
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setStep('photo')}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-medium transition-colors"
              >
                Back
              </button>
              <button
                onClick={() => setStep('interests')}
                className="flex-1 bg-primary-500 hover:bg-primary-600 text-white py-3 rounded-xl font-medium transition-colors"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Interests Step */}
        {step === 'interests' && (
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-kids-green/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🎯</span>
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">What does {formData.name} love?</h2>
              <p className="text-gray-600 text-sm">
                Select their favorite topics and activities
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6">
              {mockInterests.map((interest) => (
                <button
                  key={interest.id}
                  onClick={() => toggleInterest(interest)}
                  className={`p-3 rounded-xl border-2 text-left transition-all duration-200 ${
                    formData.interests.find(i => i.id === interest.id)
                      ? 'border-secondary-500 bg-secondary-50 text-secondary-700'
                      : 'border-gray-200 hover:border-secondary-300 hover:bg-secondary-50'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{interest.emoji}</span>
                    <div>
                      <div className="font-medium text-sm">{interest.name}</div>
                      <div className="text-xs text-gray-600 capitalize">{interest.category}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setStep('personality')}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-medium transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleComplete}
                className="flex-1 bg-primary-500 hover:bg-primary-600 text-white py-3 rounded-xl font-medium transition-colors"
              >
                Complete Setup
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}