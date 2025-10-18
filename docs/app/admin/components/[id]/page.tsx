'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { getComponentById, updateComponent } from '@/lib/db/components'
import type { Component } from '@/lib/supabase'
import dynamic from 'next/dynamic'

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false })

const categories = ['buttons', 'inputs', 'layout', 'navigation', 'feedback', 'data-display', 'overlays', 'other']

export default function EditComponentPage() {
  const router = useRouter()
  const params = useParams()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [aiLoading, setAiLoading] = useState<string | null>(null)
  const [component, setComponent] = useState<Component | null>(null)
  const [variantKey, setVariantKey] = useState('')
  const [variantValues, setVariantValues] = useState('')
  
  useEffect(() => {
    loadComponent()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id])

  async function loadComponent() {
    try {
      const data = await getComponentById(params.id as string)
      if (data) {
        setComponent(data)
      } else {
        alert('Component not found')
        router.push('/admin/components')
      }
    } catch (error) {
      console.error('Error loading component:', error)
    } finally {
      setLoading(false)
    }
  }
  
  async function handleGeneratePrompts() {
    if (!component) return
    
    setAiLoading('prompts')
    try {
      const res = await fetch('/api/ai/generate-prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: component.name,
          description: component.description,
          variants: component.variants
        })
      })
      
      const data = await res.json()
      if (res.ok) {
        setComponent({ ...component, prompts: data })
      } else {
        alert(data.error || 'Failed to generate prompts')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Failed to generate prompts')
    } finally {
      setAiLoading(null)
    }
  }
  
  async function handleGenerateDocs() {
    if (!component) return
    
    setAiLoading('docs')
    try {
      const res = await fetch('/api/ai/generate-docs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: component.name,
          code: component.code,
          variants: component.variants
        })
      })
      
      const data = await res.json()
      if (res.ok) {
        setComponent({ 
          ...component, 
          props: data.api?.props || {},
          installation: data.installation || { dependencies: [], setupSteps: [] },
          examples: data.examples || []
        })
      } else {
        alert(data.error || 'Failed to generate docs')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Failed to generate docs')
    } finally {
      setAiLoading(null)
    }
  }
  
  function addVariant() {
    if (!component || !variantKey || !variantValues) return
    
    const values = variantValues.split(',').map(v => v.trim()).filter(Boolean)
    setComponent({
      ...component,
      variants: {
        ...component.variants,
        [variantKey]: values
      }
    })
    setVariantKey('')
    setVariantValues('')
  }
  
  function removeVariant(key: string) {
    if (!component) return
    const newVariants = { ...component.variants }
    delete newVariants[key]
    setComponent({ ...component, variants: newVariants })
  }
  
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!component) return
    
    setSaving(true)
    
    try {
      await updateComponent(component.id, {
        name: component.name,
        slug: component.slug,
        description: component.description,
        category: component.category,
        code: component.code,
        props: component.props,
        variants: component.variants,
        prompts: component.prompts,
        examples: component.examples,
        installation: component.installation
      })
      router.push('/admin/components')
    } catch (error: unknown) {
      console.error('Error updating component:', error)
      const message = error instanceof Error ? error.message : 'Failed to update component'
      alert(message)
    } finally {
      setSaving(false)
    }
  }
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading component...</div>
      </div>
    )
  }
  
  if (!component) return null
  
  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Edit Component</h1>
        <p className="text-muted-foreground mt-1">Modify component settings and code</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-card border border-border rounded-lg p-6 space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Basic Information</h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1">
                Component Name *
              </label>
              <input
                id="name"
                type="text"
                value={component.name}
                onChange={(e) => setComponent({ ...component, name: e.target.value })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-foreground"
                required
              />
            </div>
            
            <div>
              <label htmlFor="slug" className="block text-sm font-medium text-foreground mb-1">
                Slug *
              </label>
              <input
                id="slug"
                type="text"
                value={component.slug}
                onChange={(e) => setComponent({ ...component, slug: e.target.value })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-foreground font-mono"
                required
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-foreground mb-1">
              Description *
            </label>
            <textarea
              id="description"
              value={component.description}
              onChange={(e) => setComponent({ ...component, description: e.target.value })}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-foreground"
              rows={3}
              required
            />
          </div>
          
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-foreground mb-1">
              Category *
            </label>
            <select
              id="category"
              value={component.category}
              onChange={(e) => setComponent({ ...component, category: e.target.value })}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-foreground"
              required
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>
        
        {/* Variants */}
        <div className="bg-card border border-border rounded-lg p-6 space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Variants</h2>
          
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Variant key (e.g., Type, Size)"
              value={variantKey}
              onChange={(e) => setVariantKey(e.target.value)}
              className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-foreground"
            />
            <input
              type="text"
              placeholder="Values (comma-separated: Primary, Secondary)"
              value={variantValues}
              onChange={(e) => setVariantValues(e.target.value)}
              className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-foreground"
            />
            <button
              type="button"
              onClick={addVariant}
              className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90"
            >
              Add
            </button>
          </div>
          
          {Object.entries(component.variants).length > 0 && (
            <div className="space-y-2">
              {Object.entries(component.variants).map(([key, values]) => (
                <div key={key} className="flex items-center justify-between p-3 bg-accent rounded-md">
                  <div>
                    <span className="font-medium">{key}:</span>{' '}
                    <span className="text-sm text-muted-foreground">{(values as string[]).join(', ')}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeVariant(key)}
                    className="text-destructive hover:text-destructive/80"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Code */}
        <div className="bg-card border border-border rounded-lg p-6 space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Component Code</h2>
          
          <div className="border border-input rounded-md overflow-hidden">
            <MonacoEditor
              height="400px"
              defaultLanguage="typescript"
              value={component.code}
              onChange={(value) => setComponent({ ...component, code: value || '' })}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
                wordWrap: 'on'
              }}
            />
          </div>
        </div>
        
        {/* AI Actions */}
        <div className="bg-card border border-border rounded-lg p-6 space-y-4">
          <h2 className="text-xl font-semibold text-foreground">AI Generation</h2>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={handleGeneratePrompts}
              disabled={aiLoading === 'prompts'}
              className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 disabled:opacity-50"
            >
              {aiLoading === 'prompts' ? 'Generating...' : 'Regenerate Usage Prompts'}
            </button>
            <button
              type="button"
              onClick={handleGenerateDocs}
              disabled={aiLoading === 'docs'}
              className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 disabled:opacity-50"
            >
              {aiLoading === 'docs' ? 'Generating...' : 'Regenerate Documentation'}
            </button>
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


