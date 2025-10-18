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
          <div className="space-y-6">
            <div className="p-8 bg-card border border-border rounded-lg">
              <p className="text-sm text-muted-foreground mb-4">
                Component preview would render here. The actual component code needs to be dynamically evaluated and rendered.
              </p>
              <div className="text-xs text-muted-foreground font-mono bg-muted p-4 rounded">
                Note: Dynamic component rendering requires additional setup with safe code evaluation.
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


