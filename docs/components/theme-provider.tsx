'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { getActiveTheme } from '@/lib/db/themes'
import type { Theme } from '@/lib/supabase'
import { getSupabase } from '@/lib/supabase'

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: string
  storageKey?: string
}

type ThemeProviderState = {
  theme: Theme | null
  setTheme: (theme: Theme) => void
}

const initialState: ThemeProviderState = {
  theme: null,
  setTheme: () => null,
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
  children,
  ...props
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Load active theme from database
    async function loadTheme() {
      try {
        const activeTheme = await getActiveTheme()
        if (activeTheme) {
          applyTheme(activeTheme)
          setThemeState(activeTheme)
        } else {
          console.log('No active theme found')
        }
      } catch (error) {
        console.error('Error loading theme:', error)
        console.error('Continuing without database theme')
      } finally {
        setLoading(false)
      }
    }

    // Only load if we're in the browser
    if (typeof window !== 'undefined') {
      loadTheme()
    } else {
      setLoading(false)
    }

    // Subscribe to theme changes in real-time
    const supabase = getSupabase()
    const channel = supabase
      .channel('theme-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'themes'
        },
        async () => {
          // Reload active theme when any theme is updated
          const activeTheme = await getActiveTheme()
          if (activeTheme) {
            applyTheme(activeTheme)
            setThemeState(activeTheme)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])
  
  const setTheme = (newTheme: Theme) => {
    applyTheme(newTheme)
    setThemeState(newTheme)
  }
  
  const value = {
    theme,
    setTheme,
  }
  
  if (loading) {
    return <div className="min-h-screen bg-background" />
  }
  
  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)
  
  if (context === undefined)
    throw new Error('useTheme must be used within a ThemeProvider')
  
  return context
}

// Apply theme by setting CSS variables
function applyTheme(theme: Theme) {
  const root = document.documentElement
  
  // Apply colors as CSS variables
  Object.entries(theme.colors).forEach(([key, value]) => {
    root.style.setProperty(`--${key}`, value as string)
  })
  
  // Apply typography if available
  if (theme.typography) {
    Object.entries(theme.typography).forEach(([key, value]) => {
      root.style.setProperty(`--typography-${key}`, value as string)
    })
  }
  
  // Apply spacing if available
  if (theme.spacing) {
    Object.entries(theme.spacing).forEach(([key, value]) => {
      root.style.setProperty(`--spacing-${key}`, value as string)
    })
  }
  
  // Apply effects if available
  if (theme.effects) {
    Object.entries(theme.effects).forEach(([key, value]) => {
      root.style.setProperty(`--effect-${key}`, value as string)
    })
  }
  
  // Store theme value in data attribute
  root.setAttribute('data-theme', theme.value)
}


