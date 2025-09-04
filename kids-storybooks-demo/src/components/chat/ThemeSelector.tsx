'use client'

interface Theme {
  id: string
  name: string
  description: string
  emoji: string
  examples: string[]
}

interface ThemeSelectorProps {
  themes: Theme[]
  onThemeSelect: (themeId: string) => void
  disabled?: boolean
}

export function ThemeSelector({ themes, onThemeSelect, disabled = false }: ThemeSelectorProps) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100">
      <h3 className="font-semibold text-gray-800 mb-3 text-center">
        Choose a story theme
      </h3>
      
      <div className="grid grid-cols-2 gap-3">
        {themes.map((theme) => (
          <button
            key={theme.id}
            onClick={() => onThemeSelect(theme.id)}
            disabled={disabled}
            className="p-3 rounded-xl border-2 border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-all duration-200 text-left group disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-gray-200 disabled:hover:bg-white"
          >
            <div className="flex items-center space-x-3 mb-2">
              <span className="text-2xl group-hover:scale-110 transition-transform duration-200">
                {theme.emoji}
              </span>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-gray-800 text-sm truncate">
                  {theme.name}
                </h4>
              </div>
            </div>
            <p className="text-xs text-gray-600 line-clamp-2">
              {theme.description}
            </p>
            
            {/* Examples on hover/focus */}
            <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <div className="flex flex-wrap gap-1">
                {theme.examples.slice(0, 2).map((example, index) => (
                  <span 
                    key={index}
                    className="inline-block px-2 py-1 bg-primary-100 text-primary-700 rounded-full text-xs"
                  >
                    {example}
                  </span>
                ))}
              </div>
            </div>
          </button>
        ))}
      </div>
      
      <div className="mt-4 text-center">
        <p className="text-xs text-gray-500">
          Don't see what you want? Just describe it in your message!
        </p>
      </div>
    </div>
  )
}