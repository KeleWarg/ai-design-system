'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getThemes, deleteTheme, setActiveTheme } from '@/lib/db/themes'
import type { Theme } from '@/lib/supabase'

export default function ThemesPage() {
  const [themes, setThemes] = useState<Theme[]>([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    loadThemes()
  }, [])
  
  async function loadThemes() {
    setLoading(true)
    try {
      const data = await getThemes()
      setThemes(data)
    } catch (error) {
      console.error('Error loading themes:', error)
    } finally {
      setLoading(false)
    }
  }
  
  async function handleDelete(id: string) {
    if (!confirm('Delete this theme? This action cannot be undone.')) return
    
    try {
      await deleteTheme(id)
      loadThemes()
    } catch (error) {
      console.error('Error deleting theme:', error)
      alert('Failed to delete theme')
    }
  }
  
  async function handleSetActive(id: string) {
    try {
      await setActiveTheme(id)
      loadThemes()
    } catch (error) {
      console.error('Error setting active theme:', error)
      alert('Failed to set active theme')
    }
  }
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading themes...</div>
      </div>
    )
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Themes</h1>
          <p className="text-muted-foreground mt-1">Manage your design system themes</p>
        </div>
        <Link
          href="/admin/themes/new"
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors font-medium"
        >
          ➕ Create Theme
        </Link>
      </div>
      
      {themes.length === 0 ? (
        <div className="bg-card border border-border rounded-lg p-12 text-center">
          <p className="text-muted-foreground mb-4">No themes yet. Create your first theme to get started.</p>
          <Link
            href="/admin/themes/new"
            className="inline-block px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors font-medium"
          >
            Create Your First Theme
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {themes.map((theme) => (
            <div
              key={theme.id}
              className="p-6 bg-card rounded-lg border border-border hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-foreground">{theme.name}</h3>
                    {theme.is_active && (
                      <span className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs rounded font-medium">
                        ✓ Active
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">Value: {theme.value}</p>
                  
                  {/* Color Preview */}
                  <div className="mt-4 flex flex-wrap gap-2">
                    {Object.entries(theme.colors).slice(0, 8).map(([key, value]) => (
                      <div key={key} className="flex items-center gap-2">
                        <div 
                          className="w-8 h-8 rounded border border-border"
                          style={{ backgroundColor: value as string }}
                          title={`${key}: ${value}`}
                        />
                      </div>
                    ))}
                    {Object.keys(theme.colors).length > 8 && (
                      <span className="text-xs text-muted-foreground self-center">
                        +{Object.keys(theme.colors).length - 8} more
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-2">
                  {!theme.is_active && (
                    <button
                      onClick={() => handleSetActive(theme.id)}
                      className="px-3 py-1 bg-secondary text-secondary-foreground rounded hover:bg-secondary/90 transition-colors text-sm"
                    >
                      Set Active
                    </button>
                  )}
                  <Link
                    href={`/admin/themes/${theme.id}`}
                    className="px-3 py-1 bg-accent text-accent-foreground rounded hover:bg-accent/90 transition-colors text-sm"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(theme.id)}
                    className="px-3 py-1 bg-destructive text-destructive-foreground rounded hover:bg-destructive/90 transition-colors text-sm"
                    disabled={theme.is_active}
                    title={theme.is_active ? 'Cannot delete active theme' : 'Delete theme'}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}


