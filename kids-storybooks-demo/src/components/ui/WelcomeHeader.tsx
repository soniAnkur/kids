'use client'

import { User } from '@/types'
import { getInitials, cn } from '@/lib/utils'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'

interface WelcomeHeaderProps {
  user: User
}

export function WelcomeHeader({ user }: WelcomeHeaderProps) {
  const greeting = getGreeting()

  return (
    <header className="bg-background border-b border-border px-4 py-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between">
          {/* Logo and greeting */}
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-primary rounded-md flex items-center justify-center">
              <span className="text-primary-foreground font-bold">K</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">KidsVerse</h1>
              <p className="text-sm text-muted-foreground hidden sm:block">
                {greeting}, {user.name}
              </p>
            </div>
          </div>

          {/* User avatar and info */}
          <div className="flex items-center space-x-3">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-foreground">{user.name}</p>
              <Badge variant="secondary" className="text-xs capitalize">
                {user.subscription.type}
              </Badge>
            </div>
            <Avatar className="w-8 h-8">
              <AvatarFallback className="bg-primary/10 text-primary font-medium">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>

        {/* Mobile greeting */}
        <div className="sm:hidden mt-3">
          <p className="text-sm text-muted-foreground">
            {greeting}, {user.name}
          </p>
        </div>
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