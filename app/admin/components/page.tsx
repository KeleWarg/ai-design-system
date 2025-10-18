'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getComponents, deleteComponent } from '@/lib/db/components'
import type { Component } from '@/lib/supabase'
import { usePermissions } from '@/hooks/use-permissions'

export default function ComponentsPage() {
  const [components, setComponents] = useState<Component[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const { canDelete } = usePermissions()
  
  useEffect(() => {
    loadComponents()
  }, [])
  
  async function loadComponents() {
    setLoading(true)
    try {
      const data = await getComponents()
      setComponents(data)
    } catch (error) {
      console.error('Error loading components:', error)
    } finally {
      setLoading(false)
    }
  }
  
  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete component "${name}"? This action cannot be undone.`)) return
    
    try {
      const response = await fetch(`/api/admin/components/${id}`, {
        method: 'DELETE',
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        alert(data.error || 'Failed to delete component')
        return
      }
      
      loadComponents()
    } catch (error) {
      console.error('Error deleting component:', error)
      alert('Failed to delete component')
    }
  }
  
  const filteredComponents = components.filter(comp =>
    comp.name.toLowerCase().includes(filter.toLowerCase()) ||
    comp.description.toLowerCase().includes(filter.toLowerCase()) ||
    comp.category.toLowerCase().includes(filter.toLowerCase())
  )
  
  const categories = Array.from(new Set(components.map(c => c.category)))
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading components...</div>
      </div>
    )
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Components</h1>
          <p className="text-muted-foreground mt-1">Manage your design system components</p>
        </div>
        <Link
          href="/admin/components/new"
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors font-medium"
        >
          ➕ Create Component
        </Link>
      </div>
      
      {/* Filter */}
      {components.length > 0 && (
        <div className="bg-card border border-border rounded-lg p-4">
          <input
            type="text"
            placeholder="Search components..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-foreground"
          />
        </div>
      )}
      
      {components.length === 0 ? (
        <div className="bg-card border border-border rounded-lg p-12 text-center">
          <p className="text-muted-foreground mb-4">No components yet. Create your first component to get started.</p>
          <Link
            href="/admin/components/new"
            className="inline-block px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors font-medium"
          >
            Create Your First Component
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {categories.map(category => {
            const categoryComponents = filteredComponents.filter(c => c.category === category)
            if (categoryComponents.length === 0) return null
            
            return (
              <div key={category}>
                <h2 className="text-xl font-semibold text-foreground mb-3 capitalize">{category}</h2>
                <div className="grid gap-4">
                  {categoryComponents.map((component) => (
                    <div
                      key={component.id}
                      className="p-6 bg-card rounded-lg border border-border hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-foreground">{component.name}</h3>
                          <p className="text-sm text-muted-foreground mt-1">{component.description}</p>
                          <div className="mt-3 flex flex-wrap gap-2">
                            <span className="inline-block px-2 py-1 bg-accent text-accent-foreground text-xs rounded">
                              {component.slug}
                            </span>
                            {Object.keys(component.variants).length > 0 && (
                              <span className="inline-block px-2 py-1 bg-muted text-muted-foreground text-xs rounded">
                                {Object.keys(component.variants).length} variant groups
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <Link
                            href={`/admin/components/${component.id}`}
                            className="px-3 py-1 bg-accent text-accent-foreground rounded hover:bg-accent/90 transition-colors text-sm"
                          >
                            Edit
                          </Link>
                          {canDelete && (
                            <button
                              onClick={() => handleDelete(component.id, component.name)}
                              className="px-3 py-1 bg-destructive text-destructive-foreground rounded hover:bg-destructive/90 transition-colors text-sm"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}


