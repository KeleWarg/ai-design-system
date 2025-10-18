'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { getTheme, updateTheme } from '@/lib/db/themes'
import type { Theme } from '@/lib/supabase'

export default function EditThemePage() {
  const router = useRouter()
  const params = useParams()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [theme, setTheme] = useState<Theme | null>(null)
  
  useEffect(() => {
    loadTheme()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id])

  async function loadTheme() {
    try {
      const data = await getTheme(params.id as string)
      if (data) {
        setTheme(data)
      } else {
        alert('Theme not found')
        router.push('/admin/themes')
      }
    } catch (error) {
      console.error('Error loading theme:', error)
    } finally {
      setLoading(false)
    }
  }
  
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!theme) return
    
    setSaving(true)
    
    try {
      await updateTheme(theme.id, {
        name: theme.name,
        value: theme.value,
        colors: theme.colors,
        typography: theme.typography,
        spacing: theme.spacing,
        effects: theme.effects,
        is_active: theme.is_active
      })
      router.push('/admin/themes')
    } catch (error: unknown) {
      console.error('Error updating theme:', error)
      const message = error instanceof Error ? error.message : 'Failed to update theme'
      alert(message)
    } finally {
      setSaving(false)
    }
  }
  
  function handleColorChange(key: string, value: string) {
    if (!theme) return
    setTheme({
      ...theme,
      colors: {
        ...theme.colors,
        [key]: value
      }
    })
  }
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading theme...</div>
      </div>
    )
  }
  
  if (!theme) return null
  
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Edit Theme</h1>
        <p className="text-muted-foreground mt-1">Modify theme settings and colors</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-card border border-border rounded-lg p-6 space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Basic Information</h2>
          
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1">
              Theme Name *
            </label>
            <input
              id="name"
              type="text"
              value={theme.name}
              onChange={(e) => setTheme({ ...theme, name: e.target.value })}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-foreground"
              required
            />
          </div>
          
          <div>
            <label htmlFor="value" className="block text-sm font-medium text-foreground mb-1">
              Theme Value * (unique identifier)
            </label>
            <input
              id="value"
              type="text"
              value={theme.value}
              onChange={(e) => setTheme({ ...theme, value: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-foreground font-mono"
              required
            />
          </div>
          
          <div className="flex items-center gap-2">
            <input
              id="is_active"
              type="checkbox"
              checked={theme.is_active}
              onChange={(e) => setTheme({ ...theme, is_active: e.target.checked })}
              className="w-4 h-4 rounded border-input"
            />
            <label htmlFor="is_active" className="text-sm font-medium text-foreground">
              Set as active theme
            </label>
          </div>
        </div>
        
        {/* Colors */}
        <div className="bg-card border border-border rounded-lg p-6 space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Colors</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(theme.colors).map(([key, value]) => (
              <div key={key}>
                <label htmlFor={`color-${key}`} className="block text-sm font-medium text-foreground mb-1">
                  {key}
                </label>
                <div className="flex gap-2">
                  <input
                    id={`color-${key}`}
                    type="color"
                    value={value as string}
                    onChange={(e) => handleColorChange(key, e.target.value)}
                    className="w-12 h-10 rounded border border-input cursor-pointer"
                  />
                  <input
                    type="text"
                    value={value as string}
                    onChange={(e) => handleColorChange(key, e.target.value)}
                    className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-foreground font-mono text-sm"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}


