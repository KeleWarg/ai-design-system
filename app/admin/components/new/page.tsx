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
    setAiLoading('extracting')
    
    try {
      // Step 1: Extract spec from image
      const formData = new FormData()
      formData.append('image', file)
      
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
      
      // Step 2: Auto-generate code
      setAiLoading('code')
      const codeRes = await fetch('/api/ai/generate-component', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newFormData.name,
          description: newFormData.description,
          variants: newFormData.variants,
          props: []
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
              {extracting ? 'AI is Processing...' : uploadedImage ? 'Spec Uploaded!' : 'Upload Your Spec Sheet'}
            </h2>
            <p className="text-muted-foreground mb-4">
              {extracting ? (
                <span>
                  {aiLoading === 'extracting' && '📄 Reading image...'}
                  {aiLoading === 'code' && '💻 Generating component code...'}
                  {aiLoading === 'prompts' && '💬 Creating usage prompts...'}
                  {aiLoading === 'docs' && '📚 Writing documentation...'}
                </span>
              ) : uploadedImage ? (
                'Component generated! Review the name and click Save.'
              ) : (
                'PNG, JPG, JPEG, or WebP - AI will extract everything automatically'
              )}
            </p>
            
            {!extracting && (
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


