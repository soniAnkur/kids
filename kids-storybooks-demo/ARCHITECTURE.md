# Kids Storybooks Demo - Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                   CLIENT SIDE                                    │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐              │
│  │   ChatInterface │    │  StoryLibrary   │    │  StoryReader    │              │
│  │                 │    │                 │    │                 │              │
│  │ - Message UI    │    │ - Story List    │    │ - Page Display  │              │
│  │ - Theme Select  │    │ - Filtering     │    │ - Navigation    │              │
│  │ - Polling       │    │ - Event Listen  │    │ - Illustrations │              │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘              │
│           │                       │                       │                     │
│           └───────────────────────┼───────────────────────┘                     │
│                                   │                                             │
│  ┌─────────────────────────────────────────────────────────────────────────────┐ │
│  │                          Component Layer                                    │ │
│  │                                                                             │ │
│  │ ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │ │
│  │ │ChatMessage  │  │StoryPreview │  │ThemeSelector│  │ChildProfile │        │ │
│  │ │   Bubble    │  │             │  │             │  │   Setup     │        │ │
│  │ └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘        │ │
│  └─────────────────────────────────────────────────────────────────────────────┘ │
│                                   │                                             │
├───────────────────────────────────┼─────────────────────────────────────────────┤
│                                   │                                             │
│  ┌─────────────────────────────────────────────────────────────────────────────┐ │
│  │                          Client Utils                                       │ │
│  │                                                                             │ │
│  │ ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                          │ │
│  │ │story-events │  │   utils     │  │ai-config    │                          │ │
│  │ │ (Event Bus) │  │ (Helpers)   │  │ (Config)    │                          │ │
│  │ └─────────────┘  └─────────────┘  └─────────────┘                          │ │
│  └─────────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────────┘
                                   │
                                   │ API Calls (Server Actions)
                                   │
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                  SERVER SIDE                                     │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────────┐ │
│  │                           Server Actions                                     │ │
│  │                                                                             │ │
│  │ ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │ │
│  │ │chat-actions │  │story-actions│  │child-actions│  │             │        │ │
│  │ │             │  │             │  │             │  │             │        │ │
│  │ │ - sendChat  │  │ - createStory│ │ - getChildren│ │             │        │ │
│  │ │ - reqStory  │  │ - getStories │ │ - saveChild  │ │             │        │ │
│  │ │ - checkStatus│ │ - getById    │ │             │  │             │        │ │
│  │ └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘        │ │
│  └─────────────────────────────────────────────────────────────────────────────┘ │
│                                   │                                             │
│  ┌─────────────────────────────────────────────────────────────────────────────┐ │
│  │                           AI Services                                       │ │
│  │                                                                             │ │
│  │ ┌─────────────────┐              ┌─────────────────┐                       │ │
│  │ │ai-story-generator│              │ai-image-generator│                      │ │
│  │ │                 │              │                 │                       │ │
│  │ │ - generateStory │              │ - generateImages│                       │ │
│  │ │ - parseResponse │              │ - DALL-E API    │                       │ │
│  │ │ - fallback      │              │                 │                       │ │
│  │ └─────────────────┘              └─────────────────┘                       │ │
│  └─────────────────────────────────────────────────────────────────────────────┘ │
│                                   │                                             │
│  ┌─────────────────────────────────────────────────────────────────────────────┐ │
│  │                            Data Layer                                       │ │
│  │                                                                             │ │
│  │ ┌─────────────────┐              ┌─────────────────┐                       │ │
│  │ │  In-Memory       │              │   Status Maps   │                       │ │
│  │ │  Story Array     │              │                 │                       │ │
│  │ │                 │              │ - generationMap │                       │ │
│  │ │ generatedStories│              │ - statusTracking│                       │ │
│  │ └─────────────────┘              └─────────────────┘                       │ │
│  └─────────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────────┘
                                   │
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              EXTERNAL APIS                                       │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌─────────────────┐              ┌─────────────────┐                         │
│  │   OpenAI API    │              │   DALL-E API    │                         │
│  │                 │              │                 │                         │
│  │ - GPT-4 Model   │              │ - Image Gen     │                         │
│  │ - Story Content │              │ - Illustrations │                         │
│  │ - Educational   │              │ - Cover Images  │                         │
│  └─────────────────┘              └─────────────────┘                         │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## Key Components

### Client Side
- **ChatInterface**: Main chat UI with theme selection and polling mechanism
- **StoryLibrary**: Displays all generated stories with filtering
- **StoryReader**: Full-screen story reading experience with page navigation
- **story-events**: Client-side event system for real-time updates

### Server Side
- **Server Actions**: Next.js server actions handling API communication
- **AI Services**: OpenAI integration for content and image generation
- **Data Layer**: In-memory storage for demo (would be database in production)

### External APIs
- **OpenAI GPT-4**: Story content generation
- **DALL-E**: Illustration generation