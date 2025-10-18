'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createComponent } from '@/lib/db/components'
import { createClient } from '@/lib/supabase'
import type { Theme } from '@/lib/supabase'
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
  
  // Theme management
  const [themes, setThemes] = useState<Theme[]>([])
  const [selectedTheme, setSelectedTheme] = useState<Theme | null>(null)
  const [loadingThemes, setLoadingThemes] = useState(true)
  
  // Image upload
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [extracting, setExtracting] = useState(false)
  const [showGenerate, setShowGenerate] = useState(false)
  
  // Fetch themes on mount
  useEffect(() => {
    async function loadThemes() {
      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from('themes')
          .select('*')
          .order('created_at', { ascending: false })
        
        if (error) throw error
        
        setThemes(data || [])
        // Auto-select active theme or first theme
        const activeTheme = data?.find(t => t.is_active) || data?.[0]
        if (activeTheme) setSelectedTheme(activeTheme)
      } catch (error) {
        console.error('Error loading themes:', error)
      } finally {
        setLoadingThemes(false)
      }
    }
    
    loadThemes()
  }, [])
  
  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    
    // Store the file for later processing
    setUploadedFile(file)
    
    // Show preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setUploadedImage(e.target?.result as string)
      setShowGenerate(true) // Show the generate button
    }
    reader.readAsDataURL(file)
  }
  
  async function handleGenerateComponent() {
    if (!uploadedFile) return
    
    if (!selectedTheme) {
      alert('Please select a theme first')
      return
    }
    
    // Extract spec from image
    setExtracting(true)
    setAiLoading('extracting')
    setShowGenerate(false)
    
    try {
      // Step 1: Extract spec from image with theme context
      const formData = new FormData()
      formData.append('image', uploadedFile)
      formData.append('theme', JSON.stringify({
        name: selectedTheme.name,
        colors: selectedTheme.colors,
        typography: selectedTheme.typography,
        spacing: selectedTheme.spacing
      }))
      
      const extractRes = await fetch('/api/ai/extract-spec', {
        method: 'POST',
        body: formData
      })
      
      const extractedData = await extractRes.json()
      
      if (!extractRes.ok) {
        alert(extractedData.error || 'Failed to extract spec from image')
        return
      }
      
      // Populate form with extracted data
      const newFormData = {
        ...formData,
        name: extractedData.name || '',
        slug: (extractedData.name || '').toLowerCase().replace(/\s+/g, '-'),
        description: extractedData.description || '',
        category: extractedData.category || 'other',
        variants: extractedData.variants || {}
      }
      
      setFormData(prev => ({ ...prev, ...newFormData }))
      
      // Step 2: Auto-generate code with theme awareness
      setAiLoading('code')
      const codeRes = await fetch('/api/ai/generate-component', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newFormData.name,
          description: newFormData.description,
          variants: newFormData.variants,
          props: [],
          theme: {
            name: selectedTheme.name,
            colors: selectedTheme.colors,
            typography: selectedTheme.typography,
            spacing: selectedTheme.spacing
          },
          colorMapping: extractedData.colorMapping || {}
        })
      })
      
      const codeData = await codeRes.json()
      if (codeRes.ok && codeData.code) {
        setFormData(prev => ({ ...prev, code: codeData.code }))
      }
      
      // Step 3: Auto-generate prompts
      setAiLoading('prompts')
      const promptsRes = await fetch('/api/ai/generate-prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newFormData.name,
          description: newFormData.description,
          variants: newFormData.variants
        })
      })
      
      const promptsData = await promptsRes.json()
      if (promptsRes.ok) {
        setFormData(prev => ({ ...prev, prompts: promptsData }))
      }
      
      // Step 4: Auto-generate documentation
      setAiLoading('docs')
      const docsRes = await fetch('/api/ai/generate-docs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newFormData.name,
          code: codeData.code,
          variants: newFormData.variants
        })
      })
      
      const docsData = await docsRes.json()
      if (docsRes.ok) {
        setFormData(prev => ({ 
          ...prev, 
          props: docsData.api?.props || {},
          installation: docsData.installation || { dependencies: [], setupSteps: [] },
          examples: docsData.examples || []
        }))
      }
      
      alert('✅ Component generated! Review the name below and click Save.')
      
    } catch (error) {
      console.error('Error:', error)
      alert('Failed to process spec sheet')
    } finally {
      setExtracting(false)
      setAiLoading(null)
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
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Create Component</h1>
        <p className="text-muted-foreground mt-1">Upload a spec sheet - AI will handle the rest</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Image Upload - Primary Action */}
        <div className="bg-gradient-to-r from-primary/10 to-purple-500/10 border-2 border-dashed border-primary/30 rounded-lg p-8 space-y-4">
          <div className="text-center">
            <div className="text-5xl mb-4">
              {extracting ? '🤖' : uploadedImage ? '✅' : '📸'}
            </div>
            <h2 className="text-2xl font-semibold text-foreground mb-2">
              {extracting ? 'AI is Processing...' : uploadedImage && !showGenerate ? 'Component Generated!' : uploadedImage ? 'Ready to Generate!' : 'Upload Your Spec Sheet'}
            </h2>
            <p className="text-muted-foreground mb-4">
              {extracting ? (
                <span>
                  {aiLoading === 'extracting' && '📄 Reading image...'}
                  {aiLoading === 'code' && '💻 Generating component code...'}
                  {aiLoading === 'prompts' && '💬 Creating usage prompts...'}
                  {aiLoading === 'docs' && '📚 Writing documentation...'}
                </span>
              ) : uploadedImage && !showGenerate ? (
                'Review the name below and click Save.'
              ) : uploadedImage ? (
                'Click below to start AI generation'
              ) : (
                'PNG, JPG, JPEG, or WebP format'
              )}
            </p>
            
            {!extracting && !showGenerate && (
              <label className="cursor-pointer inline-block px-8 py-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium text-lg">
                {uploadedImage ? '📤 Upload Different Spec' : '📤 Upload Spec Sheet'}
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  onChange={handleImageUpload}
                  disabled={extracting}
                  className="hidden"
                />
              </label>
            )}
          </div>
          
          {uploadedImage && (
            <div className="mt-6">
              <div className="relative rounded-lg overflow-hidden border-2 border-primary/30 bg-background mx-auto max-w-2xl">
                <img 
                  src={uploadedImage} 
                  alt="Uploaded spec" 
                  className="w-full h-auto"
                />
              </div>
            </div>
          )}
          
          {/* Theme Selector - Only show after upload, before processing */}
          {showGenerate && !extracting && (
            <div className="mt-6 max-w-xl mx-auto">
              <div className="bg-card border border-border rounded-lg p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">🎨 Select Theme</h3>
                    <p className="text-sm text-muted-foreground">AI will map spec colors to your theme tokens</p>
                  </div>
                  {selectedTheme && (
                    <div className="flex gap-2">
                      {Object.entries(selectedTheme.colors).slice(0, 4).map(([key, value]) => (
                        <div
                          key={key}
                          className="w-8 h-8 rounded-full border-2 border-border"
                          style={{ backgroundColor: value as string }}
                          title={key}
                        />
                      ))}
                    </div>
                  )}
                </div>
                
                {loadingThemes ? (
                  <div className="text-center text-muted-foreground py-4">Loading themes...</div>
                ) : themes.length === 0 ? (
                  <div className="text-center text-muted-foreground py-4">
                    No themes available. <a href="/admin/themes/new" className="text-primary underline">Create one first</a>
                  </div>
                ) : (
                  <select
                    value={selectedTheme?.id || ''}
                    onChange={(e) => {
                      const theme = themes.find(t => t.id === e.target.value)
                      setSelectedTheme(theme || null)
                    }}
                    className="w-full rounded-md border border-input bg-background px-4 py-3 text-foreground text-base"
                  >
                    {themes.map(theme => (
                      <option key={theme.id} value={theme.id}>
                        {theme.name} {theme.is_active && '(Active)'}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>
          )}
          
          {/* Generate Component CTA - Only show after upload and theme selection */}
          {showGenerate && !extracting && selectedTheme && (
            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={handleGenerateComponent}
                className="px-12 py-5 bg-gradient-to-r from-primary to-purple-600 text-white rounded-lg hover:opacity-90 transition-opacity font-bold text-xl shadow-lg"
              >
                ✨ Generate Component from Spec
              </button>
              <p className="text-sm text-muted-foreground mt-3">
                AI will map colors to <strong>{selectedTheme.name}</strong> theme (~30-40 seconds)
              </p>
            </div>
          )}
          
          {extracting && (
            <div className="flex justify-center">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          )}
        </div>
        
        {/* Component Name - Only Editable Field */}
        {uploadedImage && formData.name && (
          <div className="bg-card border border-border rounded-lg p-6 space-y-4">
            <h2 className="text-xl font-semibold text-foreground">Component Name</h2>
            <p className="text-sm text-muted-foreground">You can rename the component if needed</p>
            
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
            
            {/* Summary of generated content */}
            <div className="mt-4 p-4 bg-muted rounded-md space-y-2">
              <p className="text-sm font-medium text-foreground">✅ Generated Automatically:</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Description: {formData.description}</li>
                <li>• Category: {formData.category}</li>
                <li>• Variants: {Object.keys(formData.variants).length} variant groups</li>
                <li>• Component code, prompts & documentation</li>
              </ul>
            </div>
          </div>
        )}
        
        {/* Live Preview - Show component variants */}
        {uploadedImage && formData.name && formData.code && (
          <div className="bg-card border border-border rounded-lg p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-foreground">🎨 Component Preview</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Live preview with <strong>{selectedTheme?.name || 'current'}</strong> theme
                </p>
              </div>
              {selectedTheme && (
                <div className="flex gap-2">
                  {Object.entries(selectedTheme.colors).slice(0, 5).map(([key, value]) => (
                    <div
                      key={key}
                      className="w-6 h-6 rounded-full border border-border"
                      style={{ backgroundColor: value as string }}
                      title={key}
                    />
                  ))}
                </div>
              )}
            </div>
            
            {/* Variant Grid */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-foreground">Detected Variants:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(formData.variants).map(([variantName, options]) => (
                  <div key={variantName} className="p-4 bg-muted rounded-lg">
                    <p className="text-sm font-semibold text-foreground mb-2">{variantName}</p>
                    <div className="flex flex-wrap gap-2">
                      {(options as string[]).map((option) => (
                        <span
                          key={option}
                          className="px-3 py-1 bg-background border border-border rounded-md text-xs text-foreground"
                        >
                          {option}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Code Preview */}
            <div>
              <h3 className="text-sm font-medium text-foreground mb-2">Generated Code:</h3>
              <div className="bg-muted rounded-lg p-4 max-h-64 overflow-y-auto">
                <pre className="text-xs text-foreground font-mono">
                  <code>{formData.code}</code>
                </pre>
              </div>
            </div>
            
            {/* Theme Tokens Used */}
            <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
              <p className="text-sm font-medium text-foreground mb-2">🎨 Theme-Aware Design:</p>
              <p className="text-xs text-muted-foreground">
                This component uses <strong>theme tokens</strong> instead of hardcoded colors.
                When you change themes, this component will automatically adapt!
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {['bg-primary', 'text-foreground', 'border-border', 'hover:bg-primary-hover'].map(token => (
                  <code key={token} className="px-2 py-1 bg-background rounded text-xs text-primary">
                    {token}
                  </code>
                ))}
              </div>
            </div>
            
            {/* Next Steps */}
            <div className="p-4 bg-muted rounded-lg space-y-2">
              <p className="text-sm font-medium text-foreground">📝 Next Steps:</p>
              <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
                <li>Review the component name and code above</li>
                <li>Click "Save Component" below</li>
                <li>View live preview at <code className="text-primary">/docs/components/{formData.slug}</code></li>
                <li>Test all variants interactively on the docs page</li>
              </ol>
            </div>
          </div>
        )}
        
        {/* Actions - Only show after component is generated */}
        {uploadedImage && formData.name && formData.code && (
          <div className="flex flex-col gap-4">
            <button
              type="submit"
              disabled={loading || !formData.name}
              className="w-full px-8 py-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 text-lg font-semibold"
            >
              {loading ? '💾 Saving Component...' : '💾 Save Component'}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="w-full px-6 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 transition-colors"
            >
              Cancel
            </button>
          </div>
        )}
      </form>
    </div>
  )
}


