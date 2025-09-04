'use client'

import { Child } from '@/types'
import { getInitials, cn } from '@/lib/utils'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus } from 'lucide-react'

interface ChildSelectorProps {
  childrenData: Child[]
  selectedChild: Child | null
  onSelectChild: (child: Child) => void
  onAddChild: () => void
}

export function ChildSelector({
  childrenData,
  selectedChild,
  onSelectChild,
  onAddChild
}: ChildSelectorProps) {
  return (
    <div className="flex space-x-3 overflow-x-auto pb-2">
      {/* Existing children */}
      {childrenData.map((child) => (
        <Button
          key={child.id}
          onClick={() => onSelectChild(child)}
          variant="outline"
          className={cn(
            "flex flex-col items-center space-y-2 min-w-0 flex-shrink-0 h-auto p-3 rounded-lg",
            selectedChild?.id === child.id
              ? "bg-primary/5 border-primary text-primary hover:bg-primary/10"
              : "bg-background hover:bg-muted/50"
          )}
        >
          <div className="relative">
            <Avatar className="w-12 h-12">
              {child.photoUrl ? (
                <AvatarImage
                  src={child.photoUrl}
                  alt={child.name}
                  className="object-cover"
                />
              ) : null}
              <AvatarFallback className="bg-primary/10 text-primary font-medium">
                {getInitials(child.name)}
              </AvatarFallback>
            </Avatar>
            
            {/* Age badge */}
            <Badge 
              variant="secondary" 
              className="absolute -bottom-1 -right-1 w-5 h-5 p-0 flex items-center justify-center text-xs rounded-full"
            >
              {child.age}
            </Badge>
          </div>
          
          <div className="text-center min-w-0">
            <p className="font-medium text-sm truncate max-w-[80px]">
              {child.name}
            </p>
            <p className="text-xs text-muted-foreground">
              Age {child.age}
            </p>
          </div>
        </Button>
      ))}
      
      {/* Add child button */}
      <Button
        onClick={onAddChild}
        variant="outline"
        className="flex flex-col items-center space-y-2 min-w-0 flex-shrink-0 h-auto p-3 border-dashed border-2 hover:bg-muted/50"
      >
        <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center text-muted-foreground">
          <Plus className="w-5 h-5" />
        </div>
        
        <div className="text-center">
          <p className="font-medium text-sm">
            Add Child
          </p>
          <p className="text-xs text-muted-foreground">
            New profile
          </p>
        </div>
      </Button>
    </div>
  )
}