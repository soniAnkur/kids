# Technical Flow Diagrams

## Story Generation Flow

```
┌─────────────────┐
│    User Action  │
│                 │
│ 1. Selects Theme│
│ 2. Or Chats     │
└─────────────────┘
         │
         ▼
┌─────────────────┐
│  ChatInterface  │
│                 │
│ handleTheme()   │
│ handleUser()    │
└─────────────────┘
         │
         ▼
┌─────────────────┐
│ requestStoryGen │
│  (chat-actions) │
│                 │
│ 1. Creates req  │
│ 2. Calls create │
│ 3. Returns msgs │
└─────────────────┘
         │
         ▼
┌─────────────────┐
│   createStory   │
│ (story-actions) │
│                 │
│ 1. Gen storyId  │
│ 2. Set status   │
│ 3. Start BG gen │
└─────────────────┘
         │
         ▼ Background Process
┌─────────────────┐
│generateStoryInBG│
│                 │
│ 1. AI content   │
│ 2. AI images    │
│ 3. Store story  │
│ 4. Set complete │
└─────────────────┘
         │
         ▼ Meanwhile...
┌─────────────────┐
│ pollForComplete │
│ (ChatInterface) │
│                 │
│ Every 1 second: │
│ checkStoryStatus│
└─────────────────┘
         │
         ▼ When complete
┌─────────────────┐
│ checkStoryStatus│
│  (chat-actions) │
│                 │
│ 1. Get status   │
│ 2. Get story    │
│ 3. Return msg   │
└─────────────────┘
         │
         ▼
┌─────────────────┐
│  Display Story  │
│                 │
│ 1. Add to chat  │
│ 2. Show preview │
│ 3. Set generated│
└─────────────────┘
```

## Detailed Story Generation Process

```
USER INTERACTION
┌─────────────────┐
│ Theme Selection │ ──┐
└─────────────────┘   │
                      │
┌─────────────────┐   │
│   Chat Message  │ ──┼─► ┌─────────────────┐
└─────────────────┘   │   │ ChatInterface   │
                      │   │                 │
                      └─► │ 1. Add user msg │
                          │ 2. Send to AI   │
                          │ 3. Check for    │
                          │    story req    │
                          └─────────────────┘
                                    │
                                    ▼
                          ┌─────────────────┐
                          │ requestStoryGen │
                          │                 │
                          │ 1. Build request│
                          │ 2. Call create  │
                          │ 3. Start polling│
                          └─────────────────┘
                                    │
                   ┌────────────────┼────────────────┐
                   │                ▼                │
                   │      ┌─────────────────┐       │
                   │      │   createStory   │       │
                   │      │                 │       │
                   │      │ storyId = gen() │       │
                   │      │ status = 'gen'  │       │
                   │      │ startBG(id,req) │       │
                   │      └─────────────────┘       │
                   │                │                │
                   │                ▼                │
                   │      ┌─────────────────┐       │
                   │      │generateStoryInBG│       │
                   │      │                 │       │
                   │      │ ┌─────────────┐ │       │
                   │      │ │AI Content   │ │       │
                   │      │ │Generation   │ │       │
                   │      │ │             │ │       │
                   │      │ │OpenAI GPT-4 │ │       │
                   │      │ │Story Text   │ │       │
                   │      │ │Educational  │ │       │
                   │      │ └─────────────┘ │       │
                   │      │        │        │       │
                   │      │        ▼        │       │
                   │      │ ┌─────────────┐ │       │
                   │      │ │AI Image Gen │ │       │
                   │      │ │             │ │       │
                   │      │ │DALL-E API   │ │       │
                   │      │ │Per Page Img │ │       │
                   │      │ │Cover Image  │ │       │
                   │      │ └─────────────┘ │       │
                   │      │        │        │       │
                   │      │        ▼        │       │
                   │      │ ┌─────────────┐ │       │
                   │      │ │Store Story  │ │       │
                   │      │ │             │ │       │
                   │      │ │generatedArr │ │       │
                   │      │ │status=comp  │ │       │
                   │      │ └─────────────┘ │       │
                   │      └─────────────────┘       │
                   │                                │
                   │ POLLING PROCESS                │ 
                   │                                │
                   │ ┌─────────────────┐            │
                   │ │pollForComplete  │            │
                   │ │                 │            │
                   │ │ Every 1 second: │◄───────────┘
                   │ │                 │
                   │ │ ┌─────────────┐ │
                   │ │ │checkStatus  │ │
                   │ │ │             │ │
                   │ │ │status?      │ │
                   │ │ │story?       │ │
                   │ │ └─────────────┘ │
                   │ │        │        │
                   │ │        ▼        │
                   │ │ ┌─────────────┐ │
                   │ │ │if completed │ │
                   │ │ │return msg   │ │
                   │ │ │w/ preview   │ │
                   │ │ └─────────────┘ │
                   │ └─────────────────┘
                   │        │
                   │        ▼
                   │ ┌─────────────────┐
                   │ │ Update UI       │
                   │ │                 │
                   │ │ 1. Add message  │
                   │ │ 2. Show preview │
                   │ │ 3. Stop loading │
                   │ │ 4. Enable read  │
                   │ └─────────────────┘
                   └─────────────────────
```

## Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                CLIENT STATE                                     │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  messages: ChatMessage[]     selectedTheme: string     generatedStory: Story    │
│  isGenerating: boolean       loading: boolean          showStoryReader: bool    │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
                                       │
                           ┌───────────┼───────────┐
                           │           │           │
                           ▼           ▼           ▼
                    ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
                    │ Chat Actions│ │Story Actions│ │Child Actions│
                    │             │ │             │ │             │
                    │ Server Side │ │ Server Side │ │ Server Side │
                    └─────────────┘ └─────────────┘ └─────────────┘
                           │           │           │
                           └───────────┼───────────┘
                                       │
┌─────────────────────────────────────────────────────────────────────────────────┐
│                               SERVER STATE                                      │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  generatedStories: Story[]                                                      │
│  storyGenerationStatus: Map<string, 'generating'|'completed'|'error'>          │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
                                       │
                           ┌───────────┼───────────┐
                           │           │           │
                           ▼           ▼           ▼
                  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
                  │ AI Content  │ │ AI Images   │ │   Storage   │
                  │             │ │             │ │             │
                  │ OpenAI API  │ │ DALL-E API  │ │ In-Memory   │
                  └─────────────┘ └─────────────┘ └─────────────┘
```

## Component Communication

```
┌─────────────────┐    API Calls    ┌─────────────────┐
│                 │ ──────────────► │                 │
│  ChatInterface  │                 │   chat-actions  │
│                 │ ◄────────────── │                 │
└─────────────────┘   Response      └─────────────────┘
         │                                    │
         │ State Updates                      │ Server Actions
         ▼                                    ▼
┌─────────────────┐                ┌─────────────────┐
│                 │                │                 │
│  StoryPreview   │                │  story-actions  │
│                 │                │                 │
└─────────────────┘                └─────────────────┘
         │                                    │
         │ Props                              │ AI Services
         ▼                                    ▼
┌─────────────────┐                ┌─────────────────┐
│                 │                │                 │
│   StoryReader   │                │ ai-story-gen    │
│                 │                │ ai-image-gen    │
└─────────────────┘                └─────────────────┘
```