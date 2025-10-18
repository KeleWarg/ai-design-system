# Admin CMS for Design System - Implementation Plan

## Overview

Build a full-stack CMS admin panel with Supabase database, simple password auth, AI-assisted component/theme generation, and global theme management that affects all components. Follows existing component patterns with capitalized variants and CSS variable usage.

---

## Architecture Overview

Transform the current static design system into a dynamic CMS where users can:
- Create/manage themes globally (stored in Supabase, applied to all components)
- Create/manage components with AI assistance (AI generates code, prompts, and documentation)
- Simple password protection (no complex user accounts)
- All data persisted in Supabase PostgreSQL

---

## Database Schema (Supabase)

### Tables

**themes**
```sql
CREATE TABLE themes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  value TEXT UNIQUE NOT NULL,
  colors JSONB NOT NULL,
  typography JSONB,
  spacing JSONB,
  effects JSONB,
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Only one active theme at a time
CREATE UNIQUE INDEX idx_active_theme ON themes (is_active) WHERE is_active = true;
```

**components**
```sql
CREATE TABLE components (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  code TEXT NOT NULL,
  props JSONB NOT NULL,
  variants JSONB NOT NULL,
  prompts JSONB NOT NULL,
  examples JSONB NOT NULL,
  installation JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_components_category ON components (category);
CREATE INDEX idx_components_slug ON components (slug);
```

**admin_config**
```sql
CREATE TABLE admin_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  password_hash TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Only one config row
CREATE UNIQUE INDEX idx_single_config ON admin_config ((true));
```

### Row Level Security (RLS)

```sql
-- Enable RLS
ALTER TABLE themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE components ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_config ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Public read themes" ON themes FOR SELECT USING (true);
CREATE POLICY "Public read components" ON components FOR SELECT USING (true);

-- Authenticated write access (admin only)
-- Note: In production, implement proper auth. For MVP, we'll handle auth at API level.
```

---

## Implementation Plan

### Phase 1: Supabase Setup

**1.1 Initialize Supabase**
- Install Supabase client: `npm install @supabase/supabase-js bcryptjs`
- Create `.env.local` in docs directory:
  ```env
  NEXT_PUBLIC_SUPABASE_URL=your-project-url
  NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
  SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
  ADMIN_PASSWORD=your-secure-password
  OPENAI_API_KEY=your-openai-key
  ```

**1.2 Create Database Schema**
- Navigate to Supabase dashboard → SQL Editor
- Run SQL migrations above to create tables
- Set up RLS policies
- Insert initial admin password hash

**1.3 Create Supabase Client**
- File: `docs/lib/supabase.ts`
```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Server-side client with service role (for admin operations)
export const supabaseAdmin = createClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

// Types
export type Theme = {
  id: string
  name: string
  value: string
  colors: Record<string, string>
  typography?: Record<string, any>
  spacing?: Record<string, any>
  effects?: Record<string, any>
  is_active: boolean
  created_at: string
  updated_at: string
}

export type Component = {
  id: string
  name: string
  slug: string
  description: string
  category: string
  code: string
  props: Record<string, any>
  variants: Record<string, any>
  prompts: Record<string, any>
  examples: any[]
  installation: Record<string, any>
  created_at: string
  updated_at: string
}
```

---

### Phase 2: Authentication System

**2.1 Auth Utility**
- File: `docs/lib/auth.ts`
```typescript
import bcrypt from 'bcryptjs'
import { supabaseAdmin } from './supabase'

export async function verifyPassword(password: string): Promise<boolean> {
  const { data, error } = await supabaseAdmin
    .from('admin_config')
    .select('password_hash')
    .single()
  
  if (error || !data) return false
  
  return bcrypt.compare(password, data.password_hash)
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}
```

**2.2 Middleware**
- File: `docs/middleware.ts`
```typescript
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Check if accessing admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Skip login page
    if (request.nextUrl.pathname === '/admin/login') {
      return NextResponse.next()
    }
    
    // Check for auth cookie
    const authCookie = request.cookies.get('admin_session')
    
    if (!authCookie) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
    
    // Verify JWT token (implement JWT verification)
    // For MVP, just check cookie exists
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: '/admin/:path*',
}
```

**2.3 Login Page**
- File: `docs/app/admin/login/page.tsx`
```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()
  
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    })
    
    if (res.ok) {
      router.push('/admin')
    } else {
      setError('Invalid password')
    }
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md space-y-8 p-8 bg-card rounded-lg border">
        <div>
          <h2 className="text-3xl font-bold text-center">Admin Login</h2>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="password" className="block text-sm font-medium">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border px-3 py-2"
              required
            />
          </div>
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
          <button
            type="submit"
            className="w-full bg-primary text-primary-foreground py-2 rounded-md hover:bg-primary-hover"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  )
}
```

**2.4 Auth API Routes**
- File: `docs/app/api/auth/login/route.ts`
```typescript
import { NextResponse } from 'next/server'
import { verifyPassword } from '@/lib/auth'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  const { password } = await request.json()
  
  const isValid = await verifyPassword(password)
  
  if (!isValid) {
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
  }
  
  // Set secure HTTP-only cookie
  const cookieStore = await cookies()
  cookieStore.set('admin_session', 'authenticated', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7 // 7 days
  })
  
  return NextResponse.json({ success: true })
}
```

- File: `docs/app/api/auth/logout/route.ts`
```typescript
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST() {
  const cookieStore = await cookies()
  cookieStore.delete('admin_session')
  
  return NextResponse.json({ success: true })
}
```

---

### Phase 3: Admin Panel UI

**3.1 Admin Layout**
- File: `docs/app/admin/layout.tsx`
```typescript
'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  
  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/admin/login')
  }
  
  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: '📊' },
    { name: 'Themes', href: '/admin/themes', icon: '🎨' },
    { name: 'Components', href: '/admin/components', icon: '🧩' },
    { name: 'Settings', href: '/admin/settings', icon: '⚙️' },
  ]
  
  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r">
        <div className="p-6">
          <h1 className="text-2xl font-bold">Admin Panel</h1>
        </div>
        <nav className="space-y-1 px-3">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium ${
                pathname === item.href
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-accent'
              }`}
            >
              <span>{item.icon}</span>
              {item.name}
            </Link>
          ))}
        </nav>
        <div className="absolute bottom-4 left-4">
          <button
            onClick={handleLogout}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Logout
          </button>
        </div>
      </aside>
      
      {/* Main content */}
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  )
}
```

**3.2 Dashboard Page**
- File: `docs/app/admin/page.tsx`
```typescript
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
  
  useEffect(() => {
    async function loadStats() {
      const [themesRes, componentsRes, activeThemeRes] = await Promise.all([
        supabase.from('themes').select('id', { count: 'exact', head: true }),
        supabase.from('components').select('id', { count: 'exact', head: true }),
        supabase.from('themes').select('name').eq('is_active', true).single()
      ])
      
      setStats({
        themes: themesRes.count || 0,
        components: componentsRes.count || 0,
        activeTheme: activeThemeRes.data?.name || null
      })
    }
    
    loadStats()
  }, [])
  
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Manage your design system</p>
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-3 gap-6">
        <div className="p-6 bg-card rounded-lg border">
          <div className="text-2xl font-bold">{stats.themes}</div>
          <div className="text-sm text-muted-foreground">Total Themes</div>
        </div>
        <div className="p-6 bg-card rounded-lg border">
          <div className="text-2xl font-bold">{stats.components}</div>
          <div className="text-sm text-muted-foreground">Total Components</div>
        </div>
        <div className="p-6 bg-card rounded-lg border">
          <div className="text-lg font-semibold">{stats.activeTheme || 'None'}</div>
          <div className="text-sm text-muted-foreground">Active Theme</div>
        </div>
      </div>
      
      {/* Quick Actions */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Quick Actions</h2>
        <div className="flex gap-4">
          <Link
            href="/admin/themes/new"
            className="px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary-hover"
          >
            Create Theme
          </Link>
          <Link
            href="/admin/components/new"
            className="px-6 py-3 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary-hover"
          >
            Create Component
          </Link>
        </div>
      </div>
    </div>
  )
}
```

---

### Phase 4: AI-Assisted Generation

**4.1 AI Prompts Library**
- File: `docs/lib/ai-prompts.ts`

```typescript
export function generateComponentPrompt(spec: {
  name: string
  description: string
  variants: Record<string, string[]>
  props: Array<{ name: string; type: string; required: boolean }>
}) {
  return `Generate a React component following this exact pattern from our design system:

Name: ${spec.name}
Description: ${spec.description}
Variants: ${JSON.stringify(spec.variants, null, 2)}
Props: ${JSON.stringify(spec.props, null, 2)}

CRITICAL Requirements (match existing Button component):
1. Use "use client" directive for Next.js
2. Import: class-variance-authority, cn from "../../lib/utils"
3. Variant names MUST be PascalCase (Type, Size, Icon, State)
4. Variant options MUST be PascalCase (Primary, Secondary, Large, Small)
5. Use CSS variables: var(--button-height-sm), var(--duration-base)
6. Use theme token classes: bg-primary, text-primary-foreground, hover:bg-primary-hover
7. Use semantic HTML element (button, div, etc.)
8. Forward refs: React.forwardRef<HTMLElement, ComponentProps>
9. Export both Component and componentVariants
10. Support native HTML attributes via spread

Example structure:
\`\`\`typescript
"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../../lib/utils"

const ${spec.name.toLowerCase()}Variants = cva(
  "base-classes transition-all duration-[var(--duration-base)]",
  {
    variants: {
      Type: {
        Primary: "bg-primary text-primary-foreground hover:bg-primary-hover active:bg-primary-active",
        Secondary: "bg-secondary text-secondary-foreground hover:bg-secondary-hover active:bg-secondary-active"
      },
      Size: {
        Small: "h-[var(--component-height-sm)] px-3 text-xs",
        Base: "h-[var(--component-height-base)] px-4 text-sm"
      }
    },
    defaultVariants: {
      Type: "Primary",
      Size: "Base"
    }
  }
)

export interface ${spec.name}Props
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof ${spec.name.toLowerCase()}Variants> {}

const ${spec.name} = React.forwardRef<HTMLElement, ${spec.name}Props>(
  ({ className, Type, Size, ...props }, ref) => {
    return (
      <element
        ref={ref}
        className={cn(${spec.name.toLowerCase()}Variants({ Type, Size, className }))}
        {...props}
      />
    )
  }
)
${spec.name}.displayName = "${spec.name}"

export { ${spec.name}, ${spec.name.toLowerCase()}Variants }
\`\`\`

Return ONLY the component code following this exact pattern. No explanations.`
}

export function generatePromptsPrompt(component: {
  name: string
  description: string
  variants: Record<string, string[]>
}) {
  return `Generate AI usage prompts for this component:

Component: ${component.name}
Description: ${component.description}
Variants: ${JSON.stringify(component.variants, null, 2)}

Create prompts in three categories:

1. Basic Prompts (5-10 simple, single-variant requests):
   - "Give me a ${component.name}"
   - "Create a [variant] ${component.name}"

2. Advanced Prompts (5-10 complex, multi-variant requests):
   - "Create a [variant1] [variant2] ${component.name} with [feature]"

3. Use Cases (3-5 real-world scenarios with prompt and expected code output):
   - Scenario: "Hero Section CTA"
   - Prompt: "Create primary and secondary buttons for hero"
   - Output: JSX code example

Return as JSON:
{
  "basic": ["prompt1", "prompt2", ...],
  "advanced": ["prompt1", "prompt2", ...],
  "useCases": [
    {
      "scenario": "...",
      "prompt": "...",
      "output": "..."
    }
  ]
}`
}

export function generateDocsPrompt(component: {
  name: string
  code: string
  variants: Record<string, string[]>
}) {
  return `Generate documentation for this component:

Component Name: ${component.name}
Variants: ${JSON.stringify(component.variants, null, 2)}

Code:
${component.code}

Generate:
1. API Documentation (extract props from code)
2. Installation steps
3. Usage examples (basic + variants)

Return as JSON:
{
  "api": {
    "props": [
      {
        "name": "...",
        "type": "...",
        "required": false,
        "description": "...",
        "default": "..."
      }
    ]
  },
  "installation": {
    "dependencies": ["class-variance-authority", "clsx", "tailwind-merge"],
    "setupSteps": ["...", "...", "..."]
  },
  "examples": [
    {
      "name": "...",
      "code": "..."
    }
  ]
}`
}
```

**4.2 AI API Routes**
- File: `docs/app/api/ai/generate-component/route.ts`
```typescript
import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { generateComponentPrompt } from '@/lib/ai-prompts'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export async function POST(request: Request) {
  try {
    const spec = await request.json()
    
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are an expert React developer. Generate clean, type-safe component code.'
        },
        {
          role: 'user',
          content: generateComponentPrompt(spec)
        }
      ],
      temperature: 0.7,
    })
    
    const code = completion.choices[0].message.content
    
    return NextResponse.json({ code })
  } catch (error) {
    console.error('AI generation error:', error)
    return NextResponse.json({ error: 'Failed to generate component' }, { status: 500 })
  }
}
```

- File: `docs/app/api/ai/generate-prompts/route.ts`
```typescript
import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { generatePromptsPrompt } from '@/lib/ai-prompts'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export async function POST(request: Request) {
  try {
    const component = await request.json()
    
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that generates AI usage prompts. Return valid JSON only.'
        },
        {
          role: 'user',
          content: generatePromptsPrompt(component)
        }
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' }
    })
    
    const prompts = JSON.parse(completion.choices[0].message.content || '{}')
    
    return NextResponse.json(prompts)
  } catch (error) {
    console.error('AI generation error:', error)
    return NextResponse.json({ error: 'Failed to generate prompts' }, { status: 500 })
  }
}
```

- File: `docs/app/api/ai/generate-docs/route.ts`
```typescript
import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { generateDocsPrompt } from '@/lib/ai-prompts'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export async function POST(request: Request) {
  try {
    const component = await request.json()
    
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a technical writer that generates component documentation. Return valid JSON only.'
        },
        {
          role: 'user',
          content: generateDocsPrompt(component)
        }
      ],
      temperature: 0.5,
      response_format: { type: 'json_object' }
    })
    
    const docs = JSON.parse(completion.choices[0].message.content || '{}')
    
    return NextResponse.json(docs)
  } catch (error) {
    console.error('AI generation error:', error)
    return NextResponse.json({ error: 'Failed to generate docs' }, { status: 500 })
  }
}
```

---

### Phase 5: Database CRUD Operations

**5.1 Theme Operations**
- File: `docs/lib/db/themes.ts`
```typescript
import { supabase, supabaseAdmin, type Theme } from '../supabase'

export async function getThemes(): Promise<Theme[]> {
  const { data, error } = await supabase
    .from('themes')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data || []
}

export async function getActiveTheme(): Promise<Theme | null> {
  const { data, error } = await supabase
    .from('themes')
    .select('*')
    .eq('is_active', true)
    .single()
  
  if (error) return null
  return data
}

export async function getTheme(id: string): Promise<Theme | null> {
  const { data, error } = await supabase
    .from('themes')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error) return null
  return data
}

export async function createTheme(theme: Omit<Theme, 'id' | 'created_at' | 'updated_at'>): Promise<Theme> {
  const { data, error } = await supabaseAdmin
    .from('themes')
    .insert(theme)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function updateTheme(id: string, theme: Partial<Theme>): Promise<Theme> {
  const { data, error } = await supabaseAdmin
    .from('themes')
    .update({ ...theme, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function deleteTheme(id: string): Promise<void> {
  const { error } = await supabaseAdmin
    .from('themes')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}

export async function setActiveTheme(id: string): Promise<void> {
  // Deactivate all themes
  await supabaseAdmin
    .from('themes')
    .update({ is_active: false })
    .neq('id', id)
  
  // Activate selected theme
  await supabaseAdmin
    .from('themes')
    .update({ is_active: true })
    .eq('id', id)
}
```

**5.2 Component Operations**
- File: `docs/lib/db/components.ts`
```typescript
import { supabase, supabaseAdmin, type Component } from '../supabase'

export async function getComponents(): Promise<Component[]> {
  const { data, error } = await supabase
    .from('components')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data || []
}

export async function getComponent(slug: string): Promise<Component | null> {
  const { data, error } = await supabase
    .from('components')
    .select('*')
    .eq('slug', slug)
    .single()
  
  if (error) return null
  return data
}

export async function getComponentById(id: string): Promise<Component | null> {
  const { data, error } = await supabase
    .from('components')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error) return null
  return data
}

export async function createComponent(component: Omit<Component, 'id' | 'created_at' | 'updated_at'>): Promise<Component> {
  const { data, error } = await supabaseAdmin
    .from('components')
    .insert(component)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function updateComponent(id: string, component: Partial<Component>): Promise<Component> {
  const { data, error } = await supabaseAdmin
    .from('components')
    .update({ ...component, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function deleteComponent(id: string): Promise<void> {
  const { error } = await supabaseAdmin
    .from('components')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}
```

---

### Phase 6: Admin Theme Management UI

**6.1 Theme List Page**
- File: `docs/app/admin/themes/page.tsx`
```typescript
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getThemes, deleteTheme, setActiveTheme } from '@/lib/db/themes'
import type { Theme } from '@/lib/supabase'

export default function ThemesPage() {
  const [themes, setThemes] = useState<Theme[]>([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    loadThemes()
  }, [])
  
  async function loadThemes() {
    setLoading(true)
    const data = await getThemes()
    setThemes(data)
    setLoading(false)
  }
  
  async function handleDelete(id: string) {
    if (!confirm('Delete this theme?')) return
    await deleteTheme(id)
    loadThemes()
  }
  
  async function handleSetActive(id: string) {
    await setActiveTheme(id)
    loadThemes()
  }
  
  if (loading) return <div>Loading...</div>
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Themes</h1>
        <Link
          href="/admin/themes/new"
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary-hover"
        >
          Create Theme
        </Link>
      </div>
      
      <div className="grid gap-4">
        {themes.map((theme) => (
          <div
            key={theme.id}
            className="p-6 bg-card rounded-lg border flex justify-between items-center"
          >
            <div>
              <h3 className="text-lg font-semibold">{theme.name}</h3>
              <p className="text-sm text-muted-foreground">{theme.value}</p>
              {theme.is_active && (
                <span className="inline-block mt-2 px-2 py-1 bg-success text-success-foreground text-xs rounded">
                  Active
                </span>
              )}
            </div>
            <div className="flex gap-2">
              {!theme.is_active && (
                <button
                  onClick={() => handleSetActive(theme.id)}
                  className="px-3 py-1 bg-secondary text-secondary-foreground rounded hover:bg-secondary-hover"
                >
                  Set Active
                </button>
              )}
              <Link
                href={`/admin/themes/${theme.id}`}
                className="px-3 py-1 bg-accent text-accent-foreground rounded hover:bg-accent/80"
              >
                Edit
              </Link>
              <button
                onClick={() => handleDelete(theme.id)}
                className="px-3 py-1 bg-destructive text-destructive-foreground rounded hover:bg-destructive-hover"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
```

**6.2 Theme Create/Edit Form**
- File: `docs/app/admin/themes/[id]/page.tsx`
- File: `docs/app/admin/themes/new/page.tsx`

Due to length, the complete theme form implementation would include:
- Color picker for all 30+ color tokens
- Optional typography inputs
- Optional spacing inputs
- Optional effects inputs
- Preview panel showing Button in all variants
- Save/Cancel buttons

---

### Phase 7: Admin Component Management UI

**7.1 Component List Page**
- File: `docs/app/admin/components/page.tsx`

Similar to themes list, showing all components with edit/delete actions.

**7.2 Component Create/Edit Form**
- File: `docs/app/admin/components/[id]/page.tsx`
- File: `docs/app/admin/components/new/page.tsx`

Form includes:
- Name, description, category inputs
- Monaco code editor for component code
- Variant builder (add/remove variant groups)
- AI generation buttons
- Props editor
- Prompt editor
- Examples editor
- Preview panel

---

### Phase 8: Dynamic Theme Application

**8.1 Enhanced Theme Provider**
- File: `docs/components/theme-provider.tsx`

Update to load active theme from database on mount and apply using existing `applyTheme()` function.

**8.2 Real-time Theme Updates**

Subscribe to Supabase realtime changes on `themes` table. When active theme changes, automatically update CSS variables.

---

### Phase 9: Dynamic Component Rendering

**9.1 Update Component Pages**
- File: `docs/app/docs/components/[slug]/page.tsx`

Load component from database instead of JSON file. Dynamically render preview.

---

### Phase 10: MCP Server Integration

**10.1 Update MCP Server**
- File: `mcp-server/server.ts`

Replace file reading with Supabase queries. Cache in memory, refresh on database changes.

---

### Phase 11: Migration Script

**11.1 Migrate Existing Data**
- File: `scripts/migrate-to-db.ts`

Script to read existing JSON files and themes, insert into Supabase.

---

## Dependencies

Add to `docs/package.json`:

```json
{
  "dependencies": {
    "@supabase/supabase-js": "^2.39.0",
    "bcryptjs": "^2.4.3",
    "@monaco-editor/react": "^4.6.0",
    "openai": "^4.20.0"
  },
  "devDependencies": {
    "@types/bcryptjs": "^2.4.6"
  }
}
```

---

## Implementation Order

1. ✅ Supabase setup (database, tables)
2. ✅ Auth system (login, middleware)
3. ✅ Admin layout (sidebar, dashboard)
4. ✅ Theme management (CRUD, UI)
5. ✅ Component management (CRUD, UI)
6. ✅ AI integration (OpenAI API)
7. ✅ Dynamic theme application
8. ✅ Dynamic component rendering
9. ✅ MCP server update
10. ✅ Migration script

---

## Testing Checklist

- [ ] Login/logout works
- [ ] Create theme saves to database
- [ ] Active theme applies globally
- [ ] Theme changes update all components in real-time
- [ ] Create component with AI generation
- [ ] Edit component code in Monaco editor
- [ ] AI prompt generation works
- [ ] Component preview shows correct theme
- [ ] Public docs pages load components from database
- [ ] MCP server loads from database
- [ ] Migration script migrates all existing data
- [ ] Real-time updates work across tabs

