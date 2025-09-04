# KidsVerse Setup Instructions

## Quick Start

This demo application requires manual dependency installation due to npm cache issues in the current environment.

### Option 1: Manual Package Installation (Recommended)

If you encounter npm cache issues, install packages individually:

```bash
# Core Next.js dependencies
npm install next@14.2.15 react@18.2.0 react-dom@18.2.0 --legacy-peer-deps

# Styling and UI
npm install tailwindcss@3.4.1 postcss@8 autoprefixer@10 --save-dev
npm install clsx@2.1.1 tailwind-merge@2.5.2 --legacy-peer-deps

# Icons and animations
npm install lucide-react@0.400.0 --legacy-peer-deps

# TypeScript and development tools
npm install typescript@5 @types/node@20 @types/react@18 @types/react-dom@18 eslint@8 eslint-config-next@14.2.15 --save-dev
```

### Option 2: Force Installation

If you prefer to use the package.json as-is:

```bash
npm install --force
```

### Option 3: Use Yarn (Alternative)

```bash
yarn install
```

## Running the Demo

Once dependencies are installed:

```bash
npm run dev
```

Then open http://localhost:3000 in your browser.

## Troubleshooting

### Common Issues

1. **npm cache issues**: Clear npm cache with `npm cache clean --force`
2. **Permission errors**: Use `sudo chown -R $(whoami) ~/.npm` to fix npm permissions
3. **Peer dependency warnings**: Use `--legacy-peer-deps` flag with npm install

### Verification

Check if the app structure is correct:
```bash
# Should show the main page component
cat src/app/page.tsx | head -10

# Should show project structure
ls -la src/
```

## Features to Test

1. **Landing Page**: Main interface with child selection
2. **Chat Interface**: Click "Create New Story" to test conversation flow
3. **Theme Selection**: Interactive story theme picker
4. **Story Generation**: Simulated AI progress and completion
5. **Story Library**: Browse created stories
6. **Mobile Responsive**: Test on different screen sizes

## Notes

- This is a demo with simulated AI responses
- Photos are not actually processed (mock character generation)
- Stories are generated with placeholder content
- All data is stored in browser memory only

## Production Deployment

For production use, you would need to:
1. Set up real API keys in .env.local
2. Implement actual AI services (OpenAI, etc.)
3. Add proper database for persistence
4. Configure file storage for photos
5. Add authentication system