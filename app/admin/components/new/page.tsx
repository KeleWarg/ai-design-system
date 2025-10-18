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
  
  // Image upload
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [extracting, setExtracting] = useState(false)
  
  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    
    // Show preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setUploadedImage(e.target?.result as string)
    }
    reader.readAsDataURL(file)
    
    // Extract spec from image
    setExtracting(true)
    try {
      const formData = new FormData()
      formData.append('image', file)
      
      const res = await fetch('/api/ai/extract-spec', {
        method: 'POST',
        body: formData
      })
      
      const data = await res.json()
      
      if (res.ok) {
        // Populate form with extracted data
        setFormData(prev => ({
          ...prev,
          name: data.name || prev.name,
          slug: (data.name || prev.name).toLowerCase().replace(/\s+/g, '-'),
          description: data.description || prev.description,
          category: data.category || prev.category,
          variants: data.variants || prev.variants
        }))
        
        if (data.notes) {
          alert(`Extracted! Additional notes: ${data.notes}`)
        } else {
          alert('✅ Spec extracted successfully! Review the form below.')
        }
      } else {
        alert(data.error || 'Failed to extract spec from image')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Failed to extract spec from image')
    } finally {
      setExtracting(false)
    }
  }
  
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
    } catch (error: unknown) {
      console.error('Error creating component:', error)
      const message = error instanceof Error ? error.message : 'Failed to create component'
      alert(message)
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Create Component</h1>
        <p className="text-muted-foreground mt-1">Upload a spec sheet image or define manually</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Image Upload */}
        <div className="bg-gradient-to-r from-primary/10 to-purple-500/10 border-2 border-dashed border-primary/30 rounded-lg p-6 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                📸 Upload Spec Sheet (PNG)
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Upload a design spec or mockup - AI will extract component details automatically
              </p>
            </div>
            <label className="cursor-pointer px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors font-medium">
              {extracting ? '🤖 Extracting...' : '📤 Upload Image'}
              <input
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp"
                onChange={handleImageUpload}
                disabled={extracting}
                className="hidden"
              />
            </label>
          </div>
          
          {uploadedImage && (
            <div className="mt-4 space-y-2">
              <p className="text-sm font-medium text-foreground">Uploaded Spec:</p>
              <div className="relative rounded-lg overflow-hidden border-2 border-primary/30 bg-background">
                <img 
                  src={uploadedImage} 
                  alt="Uploaded spec" 
                  className="max-h-64 w-auto mx-auto"
                />
              </div>
              {extracting && (
                <div className="flex items-center gap-2 text-sm text-primary">
                  <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
                  <span>AI is reading your spec sheet...</span>
                </div>
              )}
            </div>
          )}
          
          {!uploadedImage && (
            <div className="text-center py-8 text-muted-foreground">
              <div className="text-4xl mb-2">📄</div>
              <p className="text-sm">No spec sheet uploaded yet</p>
              <p className="text-xs mt-1">Supports PNG, JPG, JPEG, WebP</p>
            </div>
          )}
        </div>
        
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


