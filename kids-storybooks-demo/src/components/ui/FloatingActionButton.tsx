'use client'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface FloatingActionButtonProps {
  onClick: () => void
  icon: string
  label: string
  className?: string
}

export function FloatingActionButton({ 
  onClick, 
  icon, 
  label, 
  className = '' 
}: FloatingActionButtonProps) {
  return (
    <Button
      onClick={onClick}
      className={cn("floating-action-btn group", className)}
      aria-label={label}
      size="lg"
    >
      <div className="flex items-center space-x-2">
        <span className="text-2xl">{icon}</span>
        <span className="font-medium hidden sm:inline">{label}</span>
      </div>
      
      {/* Tooltip for mobile */}
      <div className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-popover text-popover-foreground text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap sm:hidden shadow-md border border-border">
        {label}
        <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-border"></div>
      </div>
    </Button>
  )
}