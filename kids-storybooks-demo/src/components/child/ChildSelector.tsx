'use client'

import { Child } from '@/types'
import { getInitials } from '@/lib/utils'

interface ChildSelectorProps {
  children: Child[]
  selectedChild: Child | null
  onSelectChild: (child: Child) => void
  onAddChild: () => void
}

export function ChildSelector({
  children,
  selectedChild,
  onSelectChild,
  onAddChild
}: ChildSelectorProps) {
  return (
    <div className="flex space-x-3 overflow-x-auto pb-2">
      {/* Existing children */}
      {children.map((child) => (
        <button
          key={child.id}
          onClick={() => onSelectChild(child)}
          className={`flex flex-col items-center space-y-2 min-w-0 flex-shrink-0 p-3 rounded-xl transition-all duration-200 ${
            selectedChild?.id === child.id
              ? 'bg-primary-100 border-2 border-primary-300'
              : 'bg-white border-2 border-transparent hover:bg-gray-50'
          }`}
        >
          <div className="relative">
            {child.photoUrl ? (
              <img
                src={child.photoUrl}
                alt={child.name}
                className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-lg"
              />
            ) : (
              <div className="child-avatar">
                {getInitials(child.name)}
              </div>
            )}
            
            {/* Age badge */}
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-kids-yellow rounded-full flex items-center justify-center text-xs font-bold text-gray-800 shadow-lg">
              {child.age}
            </div>
          </div>
          
          <div className="text-center min-w-0">
            <p className="font-semibold text-gray-800 text-sm truncate max-w-[80px]">
              {child.name}
            </p>
            <p className="text-xs text-gray-500">
              {child.age} years old
            </p>
          </div>
        </button>
      ))}
      
      {/* Add child button */}
      <button
        onClick={onAddChild}
        className="flex flex-col items-center space-y-2 min-w-0 flex-shrink-0 p-3 rounded-xl bg-white border-2 border-dashed border-gray-300 hover:border-primary-300 hover:bg-primary-50 transition-all duration-200"
      >
        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:text-primary-500 transition-colors">
          <span className="text-2xl">+</span>
        </div>
        
        <div className="text-center">
          <p className="font-semibold text-gray-600 text-sm">
            Add Child
          </p>
          <p className="text-xs text-gray-400">
            New profile
          </p>
        </div>
      </button>
    </div>
  )
}