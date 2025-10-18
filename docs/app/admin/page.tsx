'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    themes: 0,
    components: 0,
    activeTheme: null as string | null
  })
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    async function loadStats() {
      try {
        const [themesRes, componentsRes, activeThemeRes] = await Promise.all([
          supabase.from('themes').select('id', { count: 'exact', head: true }),
          supabase.from('components').select('id', { count: 'exact', head: true }),
          supabase.from('themes').select('name').eq('is_active', true).maybeSingle()
        ])
        
        setStats({
          themes: themesRes.count || 0,
          components: componentsRes.count || 0,
          activeTheme: activeThemeRes.data?.name || null
        })
      } catch (error) {
        console.error('Error loading stats:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadStats()
  }, [])
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }
  
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Manage your design system</p>
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-card rounded-lg border border-border">
          <div className="text-3xl font-bold text-foreground">{stats.themes}</div>
          <div className="text-sm text-muted-foreground mt-1">Total Themes</div>
        </div>
        <div className="p-6 bg-card rounded-lg border border-border">
          <div className="text-3xl font-bold text-foreground">{stats.components}</div>
          <div className="text-sm text-muted-foreground mt-1">Total Components</div>
        </div>
        <div className="p-6 bg-card rounded-lg border border-border">
          <div className="text-lg font-semibold text-foreground">
            {stats.activeTheme || 'None'}
          </div>
          <div className="text-sm text-muted-foreground mt-1">Active Theme</div>
        </div>
      </div>
      
      {/* Quick Actions */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">Quick Actions</h2>
        <div className="flex flex-wrap gap-4">
          <Link
            href="/admin/themes/new"
            className="px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors font-medium"
          >
            ➕ Create Theme
          </Link>
          <Link
            href="/admin/components/new"
            className="px-6 py-3 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 transition-colors font-medium"
          >
            ➕ Create Component
          </Link>
          <Link
            href="/admin/themes"
            className="px-6 py-3 bg-accent text-accent-foreground rounded-md hover:bg-accent/90 transition-colors font-medium"
          >
            🎨 View All Themes
          </Link>
          <Link
            href="/admin/components"
            className="px-6 py-3 bg-accent text-accent-foreground rounded-md hover:bg-accent/90 transition-colors font-medium"
          >
            🧩 View All Components
          </Link>
        </div>
      </div>
      
      {/* Recent Activity */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">Getting Started</h2>
        <div className="bg-card border border-border rounded-lg p-6 space-y-4">
          <div className="space-y-2">
            <h3 className="font-semibold text-foreground">📝 Setup Instructions</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
              <li>Configure your Supabase credentials in <code className="bg-muted px-1 py-0.5 rounded">.env.local</code></li>
              <li>Run the database schema in your Supabase SQL editor</li>
              <li>Create your first theme to define your design system colors</li>
              <li>Add components using the AI-assisted generator</li>
              <li>Set an active theme to apply it globally</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
}


