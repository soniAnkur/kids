import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'KidsVerse - Personalized Storybooks',
  description: 'AI-powered personalized storybooks featuring your child as the hero',
  keywords: ['children', 'storybooks', 'personalized', 'AI', 'education', 'reading'],
  authors: [{ name: 'KidsVerse Team' }],
  creator: 'KidsVerse',
  publisher: 'KidsVerse',
  robots: 'index, follow',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <meta name="theme-color" content="#f054ff" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="KidsVerse" />
      </head>
      <body className="min-h-screen antialiased">
        <div className="relative min-h-screen">
          {/* Background decoration */}
          <div className="fixed inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-10 right-10 w-20 h-20 bg-kids-pink/20 rounded-full animate-float" />
            <div className="absolute top-32 left-6 w-16 h-16 bg-kids-blue/20 rounded-full animate-bounce-gentle" />
            <div className="absolute bottom-20 right-20 w-24 h-24 bg-kids-yellow/20 rounded-full animate-float" />
            <div className="absolute bottom-40 left-8 w-12 h-12 bg-kids-green/20 rounded-full animate-bounce-gentle" />
          </div>
          
          {/* Main content */}
          <main className="relative z-10">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}