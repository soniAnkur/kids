'use client'

import { Child } from '@/types'
import { getInitials } from '@/lib/utils'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ChevronLeft } from 'lucide-react'

interface ChatHeaderProps {
  child: Child
  onBack: () => void
}

export function ChatHeader({ child, onBack }: ChatHeaderProps) {
  return (
    <header className="bg-background border-b border-border px-4 py-4">
      <div className="flex items-center space-x-4">
        {/* Back button */}
        <Button
          onClick={onBack}
          variant="ghost"
          size="sm"
          className="w-8 h-8 p-0 rounded-md hover:bg-muted"
        >
          <ChevronLeft className="w-4 h-4 text-muted-foreground" />
          <span className="sr-only">Go back</span>
        </Button>

        {/* Child info */}
        <div className="flex items-center space-x-3 flex-1">
          <Avatar className="w-8 h-8">
            {child.photoUrl ? (
              <AvatarImage
                src={child.photoUrl}
                alt={child.name}
                className="object-cover"
              />
            ) : null}
            <AvatarFallback className="bg-primary/10 text-primary font-medium text-sm">
              {getInitials(child.name)}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <h2 className="font-semibold text-foreground">
              Story for {child.name}
            </h2>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                Age {child.age}
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}