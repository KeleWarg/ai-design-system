'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getComponents } from '@/lib/db/components'
import type { Component } from '@/lib/supabase'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function ComponentsIndexPage() {
  const [components, setComponents] = useState<Component[]>([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    async function loadComponents() {
      try {
        const data = await getComponents()
        setComponents(data)
      } catch (error) {
        console.error('Error loading components:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadComponents()
  }, [])
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Loading components...</div>
      </div>
    )
  }
  
  const categories = Array.from(new Set(components.map(c => c.category)))
  
  return (
    <div className="min-h-screen">
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-12 max-w-6xl">
          <h1 className="text-4xl font-bold text-foreground mb-2">Components</h1>
          <p className="text-muted-foreground">
            Explore our collection of reusable components for your design system.
          </p>
        </div>
      </div>
      
      <div className="container mx-auto px-6 py-12 max-w-6xl">
        {components.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No components available yet.</p>
            <Link
              href="/admin"
              className="text-primary hover:underline"
            >
              Add your first component in the admin panel
            </Link>
          </div>
        ) : (
          <div className="space-y-12">
            {categories.map(category => {
              const categoryComponents = components.filter(c => c.category === category)
              
              return (
                <div key={category}>
                  <h2 className="text-2xl font-bold text-foreground mb-6 capitalize">
                    {category}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {categoryComponents.map(component => (
                      <Link
                        key={component.id}
                        href={`/docs/components/${component.slug}`}
                        className="block group"
                      >
                        <Card className="h-full transition-all hover:shadow-lg hover:border-primary/50">
                          <CardHeader>
                            <CardTitle className="group-hover:text-primary transition-colors">
                              {component.name}
                            </CardTitle>
                            <CardDescription className="line-clamp-2">
                              {component.description}
                            </CardDescription>
                            {Object.keys(component.variants).length > 0 && (
                              <div className="mt-4 flex flex-wrap gap-1">
                                {Object.keys(component.variants).slice(0, 3).map(variant => (
                                  <span
                                    key={variant}
                                    className="inline-block px-2 py-1 bg-accent text-accent-foreground text-xs rounded"
                                  >
                                    {variant}
                                  </span>
                                ))}
                                {Object.keys(component.variants).length > 3 && (
                                  <span className="inline-block px-2 py-1 text-xs text-muted-foreground">
                                    +{Object.keys(component.variants).length - 3}
                                  </span>
                                )}
                              </div>
                            )}
                          </CardHeader>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}


