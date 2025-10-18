'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createComponent } from '@/lib/db/components'
import dynamic from 'next/dynamic'

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false })

const categories = ['buttons', 'inputs', 'layout', 'navigation', 'feedback', 'data-display', 'overlays', 'other']

export default function NewComponentPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [aiLoading, setAiLoading] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    category: 'buttons',
    code: '// Component code will be generated here',
    props: {},
    variants: {} as Record<string, string[]>,
    prompts: { basic: [], advanced: [], useCases: [] },
    examples: [],
    installation: { dependencies: [], setupSteps: [] }
  })
  
  // Variant management
  const [variantKey, setVariantKey] = useState('')
  const [variantValues, setVariantValues] = useState('')
  
  async function handleGenerateCode() {
    if (!formData.name || !formData.description) {
      alert('Please provide name and description first')
      return
    }
    
    setAiLoading('code')
    try {
      const res = await fetch('/api/ai/generate-component', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          variants: formData.variants,
          props: []
        })
      })
      
      const data = await res.json()
      if (res.ok && data.code) {
        setFormData({ ...formData, code: data.code })
      } else {
        alert(data.error || 'Failed to generate code')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Failed to generate code')
    } finally {
      setAiLoading(null)
    }
  }
  
  async function handleGeneratePrompts() {
    if (!formData.name || !formData.description) {
      alert('Please provide name and description first')
      return
    }
    
    setAiLoading('prompts')
    try {
      const res = await fetch('/api/ai/generate-prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          variants: formData.variants
        })
      })
      
      const data = await res.json()
      if (res.ok) {
        setFormData({ ...formData, prompts: data })
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
    if (!formData.code) {
      alert('Please generate or add code first')
      return
    }
    
    setAiLoading('docs')
    try {
      const res = await fetch('/api/ai/generate-docs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          code: formData.code,
          variants: formData.variants
        })
      })
      
      const data = await res.json()
      if (res.ok) {
        setFormData({ 
          ...formData, 
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
    if (!variantKey || !variantValues) {
      alert('Please provide variant key and values')
      return
    }
    
    const values = variantValues.split(',').map(v => v.trim()).filter(Boolean)
    setFormData({
      ...formData,
      variants: {
        ...formData.variants,
        [variantKey]: values
      }
    })
    setVariantKey('')
    setVariantValues('')
  }
  
  function removeVariant(key: string) {
    const newVariants = { ...formData.variants }
    delete newVariants[key]
    setFormData({ ...formData, variants: newVariants })
  }
  
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    
    try {
      await createComponent(formData)
      router.push('/admin/components')
    } catch (error: any) {
      console.error('Error creating component:', error)
      alert(error.message || 'Failed to create component')
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Create Component</h1>
        <p className="text-muted-foreground mt-1">Define a new component with AI assistance</p>
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
                value={formData.name}
                onChange={(e) => {
                  const name = e.target.value
                  const slug = name.toLowerCase().replace(/\s+/g, '-')
                  setFormData({ ...formData, name, slug })
                }}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-foreground"
                placeholder="e.g., Button"
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
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
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
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-foreground"
              rows={3}
              placeholder="Describe what this component does..."
              required
            />
          </div>
          
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-foreground mb-1">
              Category *
            </label>
            <select
              id="category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
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
          
          {Object.entries(formData.variants).length > 0 && (
            <div className="space-y-2">
              {Object.entries(formData.variants).map(([key, values]) => (
                <div key={key} className="flex items-center justify-between p-3 bg-accent rounded-md">
                  <div>
                    <span className="font-medium">{key}:</span>{' '}
                    <span className="text-sm text-muted-foreground">{values.join(', ')}</span>
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
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-foreground">Component Code</h2>
            <button
              type="button"
              onClick={handleGenerateCode}
              disabled={aiLoading === 'code'}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 text-sm"
            >
              {aiLoading === 'code' ? '🤖 Generating...' : '🤖 Generate with AI'}
            </button>
          </div>
          
          <div className="border border-input rounded-md overflow-hidden">
            <MonacoEditor
              height="400px"
              defaultLanguage="typescript"
              value={formData.code}
              onChange={(value) => setFormData({ ...formData, code: value || '' })}
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
              {aiLoading === 'prompts' ? 'Generating...' : 'Generate Usage Prompts'}
            </button>
            <button
              type="button"
              onClick={handleGenerateDocs}
              disabled={aiLoading === 'docs'}
              className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 disabled:opacity-50"
            >
              {aiLoading === 'docs' ? 'Generating...' : 'Generate Documentation'}
            </button>
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Component'}
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


