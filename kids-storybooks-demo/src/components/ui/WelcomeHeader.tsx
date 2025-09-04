'use client'

import { User } from '@/types'
import { getInitials } from '@/lib/utils'

interface WelcomeHeaderProps {
  user: User
}

export function WelcomeHeader({ user }: WelcomeHeaderProps) {
  const greeting = getGreeting()

  return (
    <header className="bg-glass border-b border-white/20 px-4 py-6 sticky top-0 z-40">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between">
          {/* Logo and greeting */}
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">K</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gradient">KidsVerse</h1>
              <p className="text-sm text-gray-600 hidden sm:block">
                {greeting}, {user.name}!
              </p>
            </div>
          </div>

          {/* User avatar and info */}
          <div className="flex items-center space-x-3">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-gray-800">{user.name}</p>
              <p className="text-xs text-gray-500 capitalize">
                {user.subscription.type} plan
              </p>
            </div>
            <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-semibold shadow-lg">
              {getInitials(user.name)}
            </div>
          </div>
        </div>

        {/* Mobile greeting */}
        <div className="sm:hidden mt-3">
          <p className="text-sm text-gray-600">
            {greeting}, {user.name}!
          </p>
        </div>

        {/* Quick stats */}
        {user.children.length > 0 && (
          <div className="mt-4 flex items-center space-x-6 text-sm">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-kids-blue rounded-full"></span>
              <span className="text-gray-600">
                {user.children.length} {user.children.length === 1 ? 'child' : 'children'}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-kids-green rounded-full"></span>
              <span className="text-gray-600">
                {user.subscription.storiesPerMonth} stories/month
              </span>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

function getGreeting(): string {
  const hour = new Date().getHours()
  
  if (hour < 12) {
    return 'Good morning'
  } else if (hour < 17) {
    return 'Good afternoon'
  } else {
    return 'Good evening'
  }
}