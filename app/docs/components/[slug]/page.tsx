'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { getComponent } from '@/lib/db/components'
import type { Component } from '@/lib/supabase'

export default function ComponentDetailPage() {
  const params = useParams()
  const [component, setComponent] = useState<Component | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'preview' | 'code' | 'props' | 'prompts'>('preview')
  
  useEffect(() => {
    async function loadComponent() {
      try {
        const data = await getComponent(params.slug as string)
        setComponent(data)
      } catch (error) {
        console.error('Error loading component:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadComponent()
  }, [params.slug])
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Loading component...</div>
      </div>
    )
  }
  
  if (!component) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Component not found</p>
          <Link href="/docs/components" className="text-primary hover:underline">
            Back to components
          </Link>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-12 max-w-6xl">
          <Link
            href="/docs/components"
            className="text-sm text-muted-foreground hover:text-foreground mb-4 inline-block"
          >
            ← Back to components
          </Link>
          <h1 className="text-4xl font-bold text-foreground mb-2">{component.name}</h1>
          <p className="text-muted-foreground">{component.description}</p>
          
          {/* Variant badges */}
          {Object.keys(component.variants).length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {Object.entries(component.variants).map(([key, values]) => (
                <span
                  key={key}
                  className="inline-block px-3 py-1 bg-accent text-accent-foreground text-sm rounded"
                >
                  {key}: {(values as string[]).join(', ')}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Tabs */}
      <div className="border-b border-border">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="flex gap-6">
            {(['preview', 'code', 'props', 'prompts'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-2 border-b-2 transition-colors capitalize ${
                  activeTab === tab
                    ? 'border-primary text-foreground font-medium'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="container mx-auto px-6 py-12 max-w-6xl">
        {activeTab === 'preview' && (
          <div className="space-y-8">
            {/* Component Info */}
            <div className="p-6 bg-gradient-to-r from-primary/10 to-purple-500/10 border-2 border-primary/30 rounded-lg">
              <h3 className="text-lg font-semibold text-foreground mb-2">💡 About This Component</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {component.description}
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-3 bg-background/50 rounded-md">
                  <p className="text-xs text-muted-foreground mb-1">Category</p>
                  <p className="text-sm font-medium text-foreground capitalize">{component.category}</p>
                </div>
                <div className="p-3 bg-background/50 rounded-md">
                  <p className="text-xs text-muted-foreground mb-1">Slug</p>
                  <p className="text-sm font-medium text-foreground font-mono">{component.slug}</p>
                </div>
                <div className="p-3 bg-background/50 rounded-md">
                  <p className="text-xs text-muted-foreground mb-1">Variants</p>
                  <p className="text-sm font-medium text-foreground">{Object.keys(component.variants).length} groups</p>
                </div>
                <div className="p-3 bg-background/50 rounded-md">
                  <p className="text-xs text-muted-foreground mb-1">Theme</p>
                  <p className="text-sm font-medium text-foreground">CSS Variables</p>
                </div>
              </div>
            </div>

            {/* Visual Preview - Rendered Examples */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">🎨 Visual Preview</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Examples of this component with different variant combinations
              </p>
              
              {/* Type Variants (if exists) */}
              {component.variants.Type && (
                <div className="mb-8 p-6 bg-card border border-border rounded-lg">
                  <p className="text-sm font-semibold text-foreground mb-4">Type Variants</p>
                  <div className="flex flex-wrap gap-4">
                    {(component.variants.Type as string[]).map((type) => {
                      // Map variant names to Tailwind classes
                      const typeClasses = {
                        Primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
                        Secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/90',
                        Ghost: 'bg-transparent border-2 border-border text-foreground hover:bg-accent',
                        White: 'bg-white text-black hover:bg-white/90 border border-border',
                        Destructive: 'bg-red-500 text-white hover:bg-red-600',
                        Outline: 'bg-transparent border-2 border-primary text-primary hover:bg-primary/10',
                      }[type] || 'bg-primary text-primary-foreground'
                      
                      return (
                        <button
                          key={type}
                          className={`px-6 py-3 rounded-md font-medium transition-colors cursor-default ${typeClasses}`}
                        >
                          {type} {component.name}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
              
              {/* Size Variants (if exists) */}
              {component.variants.Size && (
                <div className="mb-8 p-6 bg-card border border-border rounded-lg">
                  <p className="text-sm font-semibold text-foreground mb-4">Size Variants</p>
                  <div className="flex flex-wrap items-center gap-4">
                    {(component.variants.Size as string[]).map((size) => {
                      const sizeClasses = {
                        Small: 'px-3 py-1.5 text-xs',
                        Base: 'px-4 py-2 text-sm',
                        Medium: 'px-5 py-2.5 text-sm',
                        Large: 'px-6 py-3 text-base',
                        XLarge: 'px-8 py-4 text-lg',
                      }[size] || 'px-4 py-2 text-sm'
                      
                      return (
                        <button
                          key={size}
                          className={`bg-primary text-primary-foreground rounded-md font-medium transition-colors cursor-default hover:bg-primary/90 ${sizeClasses}`}
                        >
                          {size}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
              
              {/* State Variants (if exists) */}
              {component.variants.State && (
                <div className="mb-8 p-6 bg-card border border-border rounded-lg">
                  <p className="text-sm font-semibold text-foreground mb-4">State Variants</p>
                  <div className="flex flex-wrap gap-4">
                    {(component.variants.State as string[]).map((state) => {
                      const stateClasses = {
                        Enabled: 'bg-primary text-primary-foreground',
                        Hover: 'bg-primary/90 text-primary-foreground',
                        Focused: 'bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2',
                        Pressed: 'bg-primary/80 text-primary-foreground',
                        Disabled: 'bg-muted text-muted-foreground opacity-50 cursor-not-allowed',
                        Active: 'bg-primary/95 text-primary-foreground',
                      }[state] || 'bg-primary text-primary-foreground'
                      
                      return (
                        <button
                          key={state}
                          className={`px-6 py-3 rounded-md font-medium transition-colors cursor-default ${stateClasses}`}
                        >
                          {state}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
              
              {/* Icon Variants (if exists) */}
              {component.variants.Icon && (
                <div className="mb-8 p-6 bg-card border border-border rounded-lg">
                  <p className="text-sm font-semibold text-foreground mb-4">Icon Variants</p>
                  <div className="flex flex-wrap gap-4">
                    {(component.variants.Icon as string[]).map((icon) => {
                      return (
                        <button
                          key={icon}
                          className="px-6 py-3 bg-primary text-primary-foreground rounded-md font-medium transition-colors cursor-default hover:bg-primary/90 flex items-center gap-2"
                        >
                          {icon === 'Left' && <span>←</span>}
                          {icon} Icon
                          {icon === 'Right' && <span>→</span>}
                          {icon === 'None' && ''}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
              
              {/* All Variants Grid (metadata view) */}
              <div className="p-6 bg-muted/50 rounded-lg border border-border">
                <p className="text-sm font-semibold text-foreground mb-4">All Variant Options</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(component.variants).map(([variantName, options]) => (
                    <div key={variantName}>
                      <p className="text-xs font-semibold text-muted-foreground mb-2">{variantName}</p>
                      <div className="flex flex-wrap gap-1">
                        {(options as string[]).map((option) => (
                          <span
                            key={option}
                            className="px-2 py-1 bg-background border border-border rounded text-xs"
                          >
                            {option}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Usage Example */}
            <div className="p-6 bg-card border border-border rounded-lg space-y-4">
              <h3 className="text-lg font-semibold text-foreground">📘 Usage Example</h3>
              <pre className="p-4 bg-muted rounded-lg overflow-x-auto">
                <code className="text-sm">
{`import { ${component.name} } from '@/components/${component.slug}'

export default function Example() {
  return (
    <${component.name}${Object.keys(component.variants).length > 0 ? `\n      ${Object.keys(component.variants)[0]}="${(component.variants[Object.keys(component.variants)[0]] as string[])[0]}"` : ''}
    >
      Click me
    </${component.name}>
  )
}`}
                </code>
              </pre>
            </div>

            {/* Theme Tokens */}
            <div className="p-6 bg-primary/5 border border-primary/20 rounded-lg space-y-3">
              <h3 className="text-lg font-semibold text-foreground">🎨 Theme-Aware Design</h3>
              <p className="text-sm text-muted-foreground">
                This component uses CSS variables from your active theme. Change themes in the admin panel to see this component adapt automatically.
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                {['--primary', '--secondary', '--accent', '--foreground', '--background', '--border'].map(token => (
                  <code key={token} className="px-3 py-1 bg-background rounded text-xs font-mono text-primary">
                    var({token})
                  </code>
                ))}
              </div>
            </div>

            {/* Interactive Preview Note */}
            <div className="p-6 bg-muted border-2 border-dashed border-border rounded-lg text-center space-y-3">
              <div className="text-4xl">🔧</div>
              <h3 className="text-lg font-semibold text-foreground">Want to See It Live?</h3>
              <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
                To use this component in your project, copy the code from the <strong>Code</strong> tab above 
                and integrate it into your application. The component will render with your active theme automatically!
              </p>
              <div className="pt-3">
                <p className="text-xs text-muted-foreground">
                  💡 <strong>Developer Note:</strong> Interactive preview requires component registration. 
                  See the Code tab for implementation details.
                </p>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'code' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-3">Component Code</h3>
              <pre className="p-4 bg-muted rounded-lg overflow-x-auto">
                <code className="text-sm">{component.code}</code>
              </pre>
            </div>
            
            {component.installation && (
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3">Installation</h3>
                <div className="space-y-2">
                  {(() => {
                    const installation = component.installation as { dependencies?: string[] }
                    return installation.dependencies && installation.dependencies.length > 0 && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">Dependencies:</p>
                        <pre className="p-4 bg-muted rounded-lg overflow-x-auto">
                          <code className="text-sm">
                            npm install {installation.dependencies.join(' ')}
                          </code>
                        </pre>
                      </div>
                    )
                  })()}
                </div>
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'props' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-foreground">Props</h3>
            {Array.isArray(component.props) && component.props.length > 0 ? (
              <div className="border border-border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-muted">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Name</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Type</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Default</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {component.props.map((prop: { name: string; type: string; default?: string; description: string }, i: number) => (
                      <tr key={i} className="border-t border-border">
                        <td className="px-4 py-3 text-sm font-mono">{prop.name}</td>
                        <td className="px-4 py-3 text-sm font-mono text-muted-foreground">{prop.type}</td>
                        <td className="px-4 py-3 text-sm font-mono text-muted-foreground">{prop.default || '-'}</td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">{prop.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-muted-foreground">No props documentation available.</p>
            )}
          </div>
        )}
        
        {activeTab === 'prompts' && (() => {
          const prompts = component.prompts as { basic?: string[]; advanced?: string[]; useCases?: Array<{ scenario: string; prompt: string; output?: string }> }
          return (
            <div className="space-y-8">
              {prompts.basic && prompts.basic.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-3">Basic Prompts</h3>
                  <ul className="space-y-2">
                    {prompts.basic.map((prompt: string, i: number) => (
                      <li key={i} className="p-3 bg-card border border-border rounded-lg text-sm">
                        {prompt}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {prompts.advanced && prompts.advanced.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-3">Advanced Prompts</h3>
                  <ul className="space-y-2">
                    {prompts.advanced.map((prompt: string, i: number) => (
                      <li key={i} className="p-3 bg-card border border-border rounded-lg text-sm">
                        {prompt}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {prompts.useCases && prompts.useCases.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-3">Use Cases</h3>
                  <div className="space-y-4">
                    {prompts.useCases.map((useCase, i: number) => (
                      <div key={i} className="p-4 bg-card border border-border rounded-lg">
                        <h4 className="font-medium text-foreground mb-2">{useCase.scenario}</h4>
                        <p className="text-sm text-muted-foreground mb-3">Prompt: &quot;{useCase.prompt}&quot;</p>
                        {useCase.output && (
                          <pre className="p-3 bg-muted rounded text-xs overflow-x-auto">
                            <code>{useCase.output}</code>
                          </pre>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(!prompts.basic || prompts.basic.length === 0) &&
               (!prompts.advanced || prompts.advanced.length === 0) &&
               (!prompts.useCases || prompts.useCases.length === 0) && (
                <p className="text-muted-foreground">No usage prompts available.</p>
              )}
            </div>
          )
        })()}
      </div>
    </div>
  )
}


