'use client'

import { Story } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Clock, BookOpen, Target } from 'lucide-react'

interface StoryPreviewProps {
  story: Story
  onStartNewStory: () => void
  onReadStory: () => void
}

export function StoryPreview({ story, onStartNewStory, onReadStory }: StoryPreviewProps) {
  return (
    <Card className="overflow-hidden">
      {/* Story Cover */}
      <div className="h-48 bg-muted/30 flex items-center justify-center relative">
        {story.coverImage ? (
          <img
            src={story.coverImage}
            alt={`Cover for ${story.title}`}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : null}
        <div className="relative z-10 text-center p-6 bg-background/80 backdrop-blur-sm rounded-lg">
          <CardTitle className="text-xl mb-4">{story.title}</CardTitle>
          {!story.coverImage && (
            <div className="w-24 h-16 bg-background border border-border rounded-md flex items-center justify-center mx-auto">
              <div className="w-8 h-8 bg-muted rounded"></div>
            </div>
          )}
        </div>
      </div>
      
      {/* Story Info */}
      <CardContent className="p-4">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Reading time</p>
              <p className="font-medium text-foreground">{story.estimatedReadTime} min</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <BookOpen className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Pages</p>
              <p className="font-medium text-foreground">{story.content.length}</p>
            </div>
          </div>
        </div>
        
        {/* Educational objectives */}
        <div className="mb-4">
          <div className="flex items-center space-x-2 mb-2">
            <Target className="w-4 h-4 text-muted-foreground" />
            <p className="text-sm font-medium text-foreground">Learning objectives</p>
          </div>
          <div className="space-y-1">
            {story.educationalObjectives.slice(0, 3).map((objective, index) => (
              <Badge 
                key={index}
                variant="secondary"
                className="text-xs mr-1 mb-1"
              >
                {objective}
              </Badge>
            ))}
          </div>
        </div>
        
        {/* Action buttons */}
        <div className="flex space-x-3">
          <Button
            onClick={onReadStory}
            className="flex-1"
            size="lg"
          >
            Read Story
          </Button>
        </div>
        
        {/* Create another story */}
        <div className="mt-4 pt-4 border-t border-border">
          <Button
            onClick={onStartNewStory}
            variant="link"
            className="w-full text-sm p-0"
          >
            Create another story
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}