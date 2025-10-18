'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createTheme } from '@/lib/db/themes'

const defaultColors = {
  // Base colors
  background: '#ffffff',
  foreground: '#000000',
  card: '#ffffff',
  'card-foreground': '#000000',
  popover: '#ffffff',
  'popover-foreground': '#000000',
  
  // Primary
  primary: '#0070f3',
  'primary-foreground': '#ffffff',
  'primary-hover': '#0060df',
  'primary-active': '#0050c5',
  
  // Secondary
  secondary: '#f4f4f5',
  'secondary-foreground': '#18181b',
  'secondary-hover': '#e4e4e7',
  'secondary-active': '#d4d4d8',
  
  // Muted
  muted: '#f4f4f5',
  'muted-foreground': '#71717a',
  
  // Accent
  accent: '#f4f4f5',
  'accent-foreground': '#18181b',
  
  // Destructive
  destructive: '#ef4444',
  'destructive-foreground': '#ffffff',
  'destructive-hover': '#dc2626',
  
  // Border & Input
  border: '#e4e4e7',
  input: '#e4e4e7',
  ring: '#0070f3',
  
  // Success
  success: '#10b981',
  'success-foreground': '#ffffff',
}

export default function NewThemePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    value: '',
    colors: defaultColors,
    is_active: false
  })
  
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    
    try {
      await createTheme(formData)
      router.push('/admin/themes')
    } catch (error: any) {
      console.error('Error creating theme:', error)
      alert(error.message || 'Failed to create theme')
    } finally {
      setLoading(false)
    }
  }
  
  function handleColorChange(key: string, value: string) {
    setFormData(prev => ({
      ...prev,
      colors: {
        ...prev.colors,
        [key]: value
      }
    }))
  }
  
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Create Theme</h1>
        <p className="text-muted-foreground mt-1">Define a new theme for your design system</p>
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
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-foreground"
              placeholder="e.g., Light Theme, Dark Mode"
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
              value={formData.value}
              onChange={(e) => setFormData({ ...formData, value: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-foreground font-mono"
              placeholder="e.g., light, dark, ocean"
              required
            />
          </div>
          
          <div className="flex items-center gap-2">
            <input
              id="is_active"
              type="checkbox"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
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
            {Object.entries(formData.colors).map(([key, value]) => (
              <div key={key}>
                <label htmlFor={`color-${key}`} className="block text-sm font-medium text-foreground mb-1">
                  {key}
                </label>
                <div className="flex gap-2">
                  <input
                    id={`color-${key}`}
                    type="color"
                    value={value}
                    onChange={(e) => handleColorChange(key, e.target.value)}
                    className="w-12 h-10 rounded border border-input cursor-pointer"
                  />
                  <input
                    type="text"
                    value={value}
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
            disabled={loading}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Theme'}
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


