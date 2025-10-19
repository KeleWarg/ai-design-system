# Comprehensive UX & AI Integration Plan

Combining [shadcn/ui's proven UX](https://ui.shadcn.com/docs/components) with your AI-powered spec sheet workflow.

---

## 🎯 Vision

**shadcn/ui + AI Generation + Admin CMS + Spec Sheet Upload**

Build a platform where:
1. ✅ Users browse components (like shadcn/ui)
2. ✅ Admins upload spec sheets to generate new components
3. ✅ AI tools can discover and install your components
4. ✅ AI prompts are automatically generated
5. ✅ Everything works with v0, Claude, Cursor, etc.

---

## 📊 Phase 1: Core UX Improvements (Week 1-2)

### **1.1 Sidebar Navigation**

**Structure** (matching [shadcn/ui](https://ui.shadcn.com/docs/components)):

```typescript
// app/docs/layout.tsx
<aside className="w-64 border-r sticky top-0 h-screen">
  <nav>
    {/* Logo & Search */}
    <div className="p-6 border-b">
      <Link href="/">Design System</Link>
      <button onClick={openSearch}>
        Search... <kbd>⌘K</kbd>
      </button>
    </div>
    
    {/* Navigation Sections */}
    <div className="p-6 space-y-6">
      {/* Get Started */}
      <section>
        <h3 className="font-semibold text-sm mb-2">Get Started</h3>
        <ul className="space-y-1 text-sm text-muted-foreground">
          <li><Link href="/docs">Introduction</Link></li>
          <li><Link href="/docs/installation">Installation</Link></li>
          <li><Link href="/docs/theming">Theming</Link></li>
          <li><Link href="/docs/dark-mode">Dark Mode</Link></li>
          <li><Link href="/docs/ai-integration">AI Integration</Link></li>
          <li><Link href="/docs/spec-sheets">Spec Sheets</Link></li>
        </ul>
      </section>
      
      {/* Components (Dynamic from DB) */}
      <section>
        <h3 className="font-semibold text-sm mb-2">Components</h3>
        <ScrollArea className="h-[400px]">
          <ul className="space-y-1 text-sm text-muted-foreground">
            {components.map(c => (
              <li key={c.slug}>
                <Link 
                  href={`/docs/components/${c.slug}`}
                  className={cn(
                    "block px-2 py-1 rounded-md hover:bg-accent",
                    isActive && "bg-accent text-accent-foreground"
                  )}
                >
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </ScrollArea>
      </section>
      
      {/* AI Tools (New!) */}
      <section>
        <h3 className="font-semibold text-sm mb-2">AI Tools</h3>
        <ul className="space-y-1 text-sm text-muted-foreground">
          <li><Link href="/docs/ai/prompts">Prompt Library</Link></li>
          <li><Link href="/docs/ai/mcp">MCP Server</Link></li>
          <li><Link href="/docs/ai/v0">v0 Integration</Link></li>
          <li><Link href="/docs/ai/claude">Claude Integration</Link></li>
        </ul>
      </section>
      
      {/* Admin (Protected) */}
      <section>
        <h3 className="font-semibold text-sm mb-2">Admin</h3>
        <ul className="space-y-1 text-sm text-muted-foreground">
          <li><Link href="/admin">Dashboard</Link></li>
          <li><Link href="/admin/components/new">Upload Spec</Link></li>
          <li><Link href="/admin/themes">Themes</Link></li>
        </ul>
      </section>
    </div>
  </nav>
</aside>
```

**Features:**
- ✅ Sticky sidebar (always visible)
- ✅ Scroll area for long component lists
- ✅ Active state highlighting
- ✅ Organized sections with headers
- ✅ Quick access to admin tools

---

### **1.2 Top Header with Actions**

```typescript
// components/docs-header.tsx
<header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
  <div className="flex items-center justify-between h-14 px-6">
    {/* Left: Logo (only on mobile) */}
    <div className="md:hidden">
      <Link href="/">Design System</Link>
    </div>
    
    {/* Center: Main Nav */}
    <nav className="hidden md:flex gap-6 text-sm">
      <Link href="/docs">Documentation</Link>
      <Link href="/docs/components">Components</Link>
      <Link href="/docs/ai">AI Tools</Link>
      <Link href="/admin">Admin</Link>
    </nav>
    
    {/* Right: Actions */}
    <div className="flex items-center gap-2">
      {/* Search */}
      <button
        onClick={openSearch}
        className="px-3 py-1.5 text-sm border rounded-md hover:bg-accent"
      >
        Search... <kbd className="ml-2">⌘K</kbd>
      </button>
      
      {/* GitHub Stars */}
      <a href="https://github.com/your-repo" className="flex items-center gap-1">
        <Star className="h-4 w-4" />
        <span className="text-sm">1.2k</span>
      </a>
      
      {/* Theme Toggle */}
      <ThemeToggle />
      
      {/* User Menu (if logged in) */}
      {user && (
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Avatar />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>
              <Link href="/admin">Admin Panel</Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={logout}>
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  </div>
</header>
```

---

### **1.3 Component Grid View**

**Current:** List view
**Target:** Grid view like [shadcn/ui](https://ui.shadcn.com/docs/components)

```typescript
// app/docs/components/page.tsx
export default async function ComponentsPage() {
  const components = await getComponents()
  
  return (
    <div className="space-y-8">
      {/* Hero */}
      <div>
        <h1 className="text-4xl font-bold mb-2">Components</h1>
        <p className="text-lg text-muted-foreground">
          Beautifully designed components generated from spec sheets. 
          Copy, paste, and customize.
        </p>
      </div>
      
      {/* Stats */}
      <div className="flex gap-6 text-sm">
        <div>
          <span className="text-2xl font-bold">{components.length}</span>
          <span className="text-muted-foreground ml-2">Components</span>
        </div>
        <div>
          <span className="text-2xl font-bold">{themes.length}</span>
          <span className="text-muted-foreground ml-2">Themes</span>
        </div>
        <div>
          <span className="text-2xl font-bold">AI</span>
          <span className="text-muted-foreground ml-2">Generated</span>
        </div>
      </div>
      
      {/* Component Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {components.map(component => (
          <Link
            key={component.id}
            href={`/docs/components/${component.slug}`}
            className="group block p-6 border rounded-lg hover:border-primary transition-colors"
          >
            {/* Preview Thumbnail */}
            <div className="aspect-video bg-muted rounded-md mb-4 flex items-center justify-center overflow-hidden">
              <ComponentThumbnail component={component} />
            </div>
            
            {/* Info */}
            <div>
              <h3 className="font-semibold group-hover:text-primary transition-colors">
                {component.name}
              </h3>
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {component.description}
              </p>
            </div>
            
            {/* Badges */}
            <div className="flex flex-wrap gap-1 mt-3">
              {component.category && (
                <Badge variant="secondary" className="text-xs">
                  {component.category}
                </Badge>
              )}
              {Object.keys(component.variants).map(variant => (
                <Badge key={variant} variant="outline" className="text-xs">
                  {Object.keys(component.variants[variant]).length} {variant}s
                </Badge>
              ))}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
```

**Component Thumbnail** (mini preview):
```typescript
// components/component-thumbnail.tsx
'use client'

export function ComponentThumbnail({ component }: { component: Component }) {
  // Render a small preview based on component type
  const firstVariant = Object.keys(component.variants)[0]
  const firstOption = component.variants[firstVariant]?.[0]
  
  return (
    <div className="p-4 flex items-center justify-center">
      {/* Render based on category */}
      {component.category === 'buttons' && (
        <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm">
          {component.name}
        </button>
      )}
      
      {component.category === 'inputs' && (
        <input 
          type="text" 
          placeholder={component.name}
          className="px-3 py-2 border rounded-md text-sm"
        />
      )}
      
      {/* Add more category-specific previews */}
    </div>
  )
}
```

---

## 📊 Phase 2: Command Menu (⌘K Search)

### **2.1 Global Search**

Inspired by shadcn/ui's `⌘K` menu:

```bash
npm install cmdk
```

```typescript
// components/command-menu.tsx
'use client'

import { useEffect, useState } from 'react'
import { Command } from 'cmdk'
import { useRouter } from 'next/navigation'

export function CommandMenu() {
  const [open, setOpen] = useState(false)
  const [components, setComponents] = useState([])
  const router = useRouter()
  
  // Toggle with Cmd+K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen(true)
      }
    }
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])
  
  // Load components
  useEffect(() => {
    if (open) {
      fetch('/api/public/components')
        .then(r => r.json())
        .then(setComponents)
    }
  }, [open])
  
  return (
    <Command.Dialog open={open} onOpenChange={setOpen}>
      <Command.Input placeholder="Search components..." />
      <Command.List>
        <Command.Empty>No results found.</Command.Empty>
        
        {/* Components */}
        <Command.Group heading="Components">
          {components.map(c => (
            <Command.Item
              key={c.id}
              onSelect={() => {
                router.push(`/docs/components/${c.slug}`)
                setOpen(false)
              }}
            >
              {c.name}
              <span className="text-muted-foreground ml-2">{c.category}</span>
            </Command.Item>
          ))}
        </Command.Group>
        
        {/* Quick Actions */}
        <Command.Group heading="Quick Actions">
          <Command.Item onSelect={() => router.push('/admin/components/new')}>
            📸 Upload Spec Sheet
          </Command.Item>
          <Command.Item onSelect={() => router.push('/docs/ai')}>
            🤖 AI Integration Guide
          </Command.Item>
          <Command.Item onSelect={() => router.push('/admin/themes')}>
            🎨 Manage Themes
          </Command.Item>
        </Command.Group>
        
        {/* Themes */}
        <Command.Group heading="Switch Theme">
          {themes.map(theme => (
            <Command.Item
              key={theme.id}
              onSelect={() => applyTheme(theme.id)}
            >
              {theme.name}
            </Command.Item>
          ))}
        </Command.Group>
      </Command.List>
    </Command.Dialog>
  )
}
```

**Features:**
- ✅ ⌘K to open from anywhere
- ✅ Search all components
- ✅ Quick actions (upload spec, admin)
- ✅ Theme switcher
- ✅ Keyboard navigation

---

## 📊 Phase 3: Enhanced Component Pages

### **3.1 Component Detail Layout**

```typescript
// app/docs/components/[slug]/page.tsx
export default async function ComponentPage({ params }: { params: { slug: string } }) {
  const component = await getComponent(params.slug)
  
  return (
    <div className="max-w-5xl mx-auto space-y-12">
      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbItem>
          <Link href="/docs">Docs</Link>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <Link href="/docs/components">Components</Link>
        </BreadcrumbItem>
        <BreadcrumbItem>{component.name}</BreadcrumbItem>
      </Breadcrumb>
      
      {/* Hero */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold">{component.name}</h1>
        <p className="text-xl text-muted-foreground">{component.description}</p>
        
        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          <Badge>{component.category}</Badge>
          <Badge variant="outline">AI Generated</Badge>
          {component.theme && (
            <Badge variant="secondary">{component.theme.name} Theme</Badge>
          )}
        </div>
      </div>
      
      {/* Tabs */}
      <Tabs defaultValue="preview">
        <TabsList>
          <TabsTrigger value="preview">Preview</TabsTrigger>
          <TabsTrigger value="code">Code</TabsTrigger>
          <TabsTrigger value="api">API</TabsTrigger>
          <TabsTrigger value="prompts">AI Prompts</TabsTrigger>
          <TabsTrigger value="install">Installation</TabsTrigger>
        </TabsList>
        
        {/* Preview Tab */}
        <TabsContent value="preview" className="space-y-8">
          <ComponentPreview component={component} />
        </TabsContent>
        
        {/* Code Tab */}
        <TabsContent value="code" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Component Code</h2>
            <CopyButton text={component.code} />
          </div>
          <CodeBlock code={component.code} language="typescript" />
        </TabsContent>
        
        {/* API Tab */}
        <TabsContent value="api" className="space-y-4">
          <h2 className="text-2xl font-semibold">API Reference</h2>
          <PropsTable props={component.props} />
          <VariantsTable variants={component.variants} />
        </TabsContent>
        
        {/* AI Prompts Tab (NEW!) */}
        <TabsContent value="prompts" className="space-y-4">
          <h2 className="text-2xl font-semibold">AI Prompts</h2>
          <p className="text-muted-foreground">
            Use these prompts with v0, Claude, or Cursor to generate this component
          </p>
          <PromptLibrary component={component} />
        </TabsContent>
        
        {/* Installation Tab */}
        <TabsContent value="install" className="space-y-4">
          <h2 className="text-2xl font-semibold">Installation</h2>
          <InstallationGuide component={component} />
        </TabsContent>
      </Tabs>
      
      {/* AI Integration Section (NEW!) */}
      <div className="p-6 bg-gradient-to-r from-primary/10 to-purple-500/10 border rounded-lg space-y-4">
        <h3 className="text-xl font-semibold">🤖 Use with AI Tools</h3>
        <p className="text-muted-foreground">
          This component can be installed and used by AI tools like v0, Claude, and Cursor
        </p>
        
        <div className="grid md:grid-cols-2 gap-4">
          {/* v0.dev */}
          <div className="p-4 border rounded-md">
            <h4 className="font-semibold mb-2">v0.dev</h4>
            <CodeBlock
              code={`Prompt: "Use the ${component.name} component from my design system"`}
              language="text"
            />
          </div>
          
          {/* Claude */}
          <div className="p-4 border rounded-md">
            <h4 className="font-semibold mb-2">Claude</h4>
            <CodeBlock
              code={`Add to MCP: your-design-system.com/mcp`}
              language="text"
            />
          </div>
          
          {/* Cursor */}
          <div className="p-4 border rounded-md">
            <h4 className="font-semibold mb-2">Cursor</h4>
            <CodeBlock
              code={`@docs your-design-system.com/docs/components/${component.slug}`}
              language="text"
            />
          </div>
          
          {/* API */}
          <div className="p-4 border rounded-md">
            <h4 className="font-semibold mb-2">API</h4>
            <CodeBlock
              code={`GET /api/registry/${component.slug}`}
              language="bash"
            />
          </div>
        </div>
      </div>
      
      {/* Related Components */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Related Components</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {relatedComponents.map(c => (
            <ComponentCard key={c.id} component={c} />
          ))}
        </div>
      </div>
    </div>
  )
}
```

---

## 📊 Phase 4: AI Integration Layer

### **4.1 MCP Server** (Model Context Protocol)

shadcn/ui has an [MCP Server](https://ui.shadcn.com/docs/components) - you need one too!

```typescript
// app/api/mcp/route.ts
import { NextResponse } from 'next/server'

export async function GET() {
  const components = await getComponents()
  
  return NextResponse.json({
    schema_version: "1.0",
    name: "Your Design System",
    description: "AI-generated components from spec sheets",
    registry_url: "https://your-site.com/api/registry",
    components: components.map(c => ({
      name: c.name,
      slug: c.slug,
      description: c.description,
      category: c.category,
      variants: c.variants,
      prompts: c.prompts,
      code_url: `https://your-site.com/api/registry/${c.slug}`,
      docs_url: `https://your-site.com/docs/components/${c.slug}`,
      preview_url: `https://your-site.com/api/preview/${c.slug}`,
    })),
  })
}
```

**AI tools can then:**
```bash
# Claude MCP
{
  "mcpServers": {
    "your-design-system": {
      "url": "https://your-site.com/api/mcp"
    }
  }
}

# Now Claude can:
- List your components
- Get component code
- Read documentation
- Install components
```

---

### **4.2 Component Registry API**

```typescript
// app/api/registry/[slug]/route.ts
export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  const component = await getComponent(params.slug)
  
  return NextResponse.json({
    name: component.name,
    slug: component.slug,
    description: component.description,
    category: component.category,
    
    // Full code
    code: component.code,
    
    // Variants
    variants: component.variants,
    
    // Props
    props: component.props,
    
    // Dependencies
    dependencies: component.installation.dependencies,
    
    // AI Prompts
    prompts: {
      basic: component.prompts.basic,
      advanced: component.prompts.advanced,
      useCases: component.prompts.useCases,
    },
    
    // Theme requirements
    theme: {
      colors: Object.keys(component.theme?.colors || {}),
      tokens: extractThemeTokens(component.code),
    },
    
    // Usage examples
    examples: [
      {
        name: "Basic Usage",
        code: generateBasicExample(component),
      },
      {
        name: "With Variants",
        code: generateVariantExample(component),
      },
    ],
    
    // Meta
    created_at: component.created_at,
    updated_at: component.updated_at,
    version: "1.0.0",
  })
}
```

**AI tools can now:**
```typescript
// v0.dev
fetch('your-site.com/api/registry/button')
  .then(r => r.json())
  .then(component => {
    // v0 has full component info
    // Can generate variations
    // Can install automatically
  })
```

---

### **4.3 llms.txt File**

shadcn/ui has `llms.txt` for AI discovery:

```typescript
// app/llms.txt/route.ts
export async function GET() {
  const components = await getComponents()
  
  const content = `
# Your Design System - AI-Generated Components

## About
A component library generated from spec sheets using AI (Claude).
Components are shadcn/ui compatible and theme-aware.

## Registry
Registry URL: https://your-site.com/api/registry
MCP Server: https://your-site.com/api/mcp
Documentation: https://your-site.com/docs

## Available Components
${components.map(c => `
### ${c.name}
- Slug: ${c.slug}
- Category: ${c.category}
- Variants: ${Object.keys(c.variants).join(', ')}
- API: https://your-site.com/api/registry/${c.slug}
- Docs: https://your-site.com/docs/components/${c.slug}
`).join('\n')}

## Usage with AI Tools

### v0.dev
Prompt: "Use the [component] from my design system"
The system will fetch from our registry automatically.

### Claude (with MCP)
Add to your MCP config:
{
  "mcpServers": {
    "your-design-system": {
      "url": "https://your-site.com/api/mcp"
    }
  }
}

### Cursor
Use @docs context:
@docs https://your-site.com/docs/components/[slug]

## Features
- 🤖 AI-generated from spec sheets
- 🎨 Theme-aware (adapts to your colors)
- 📦 shadcn/ui compatible
- 🔧 Fully customizable
- 📝 Auto-generated prompts
- 🚀 Ready for AI tools

## Admin
Upload new spec sheets: https://your-site.com/admin/components/new
Components are generated automatically with AI.
`
  
  return new Response(content, {
    headers: {
      'Content-Type': 'text/plain',
    },
  })
}
```

---

### **4.4 Prompt Library Page**

```typescript
// app/docs/ai/prompts/page.tsx
export default async function PromptsPage() {
  const components = await getComponents()
  
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-2">AI Prompt Library</h1>
        <p className="text-lg text-muted-foreground">
          Copy these prompts to use with v0, Claude, Cursor, or any AI tool
        </p>
      </div>
      
      {/* Quick Copy Prompts */}
      <div className="grid md:grid-cols-2 gap-4">
        {components.map(component => (
          <div key={component.id} className="p-4 border rounded-lg space-y-3">
            <div>
              <h3 className="font-semibold">{component.name}</h3>
              <p className="text-sm text-muted-foreground">{component.description}</p>
            </div>
            
            {/* Basic Prompts */}
            <div className="space-y-2">
              <p className="text-sm font-medium">Basic Prompts:</p>
              {component.prompts.basic.slice(0, 2).map((prompt, i) => (
                <div key={i} className="flex items-center gap-2">
                  <code className="flex-1 p-2 bg-muted rounded text-xs">
                    {prompt}
                  </code>
                  <CopyButton text={prompt} />
                </div>
              ))}
            </div>
            
            <Link
              href={`/docs/components/${component.slug}?tab=prompts`}
              className="text-sm text-primary hover:underline"
            >
              View all prompts →
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}
```

---

## 📊 Phase 5: Admin Workflow Integration

### **5.1 Enhanced Spec Sheet Upload**

Keep your existing upload flow but add:

```typescript
// app/admin/components/new/page.tsx (enhanced)
<div className="space-y-8">
  {/* Upload Section (existing) */}
  <SpecSheetUpload />
  
  {/* NEW: AI Status */}
  {extractedData && (
    <div className="p-6 bg-card border rounded-lg space-y-4">
      <div className="flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-primary" />
        <h3 className="font-semibold">AI Extraction Complete</h3>
      </div>
      
      {/* Show what AI found */}
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <p className="text-sm font-medium mb-2">Detected Variants:</p>
          <ul className="text-sm text-muted-foreground">
            {Object.entries(extractedData.variants).map(([name, values]) => (
              <li key={name}>
                {name}: {values.join(', ')}
              </li>
            ))}
          </ul>
        </div>
        
        <div>
          <p className="text-sm font-medium mb-2">Theme Mapping:</p>
          <ul className="text-sm text-muted-foreground">
            {Object.entries(extractedData.colorMapping).map(([spec, token]) => (
              <li key={spec}>
                {spec} → {token}
              </li>
            ))}
          </ul>
        </div>
      </div>
      
      {/* NEW: Test with AI Tool */}
      <div className="flex gap-2">
        <button
          onClick={generateAIPrompt}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
        >
          Generate AI Prompts
        </button>
        <button
          onClick={testWithV0}
          className="px-4 py-2 border rounded-md"
        >
          Test with v0
        </button>
      </div>
    </div>
  )}
  
  {/* Component Preview (existing) */}
  <ComponentPreview />
  
  {/* NEW: AI Integration Preview */}
  {generatedCode && (
    <div className="p-6 bg-card border rounded-lg space-y-4">
      <h3 className="font-semibold">AI Tool Preview</h3>
      <p className="text-sm text-muted-foreground">
        How this component will appear to AI tools:
      </p>
      
      <Tabs defaultValue="registry">
        <TabsList>
          <TabsTrigger value="registry">Registry JSON</TabsTrigger>
          <TabsTrigger value="mcp">MCP Response</TabsTrigger>
          <TabsTrigger value="llms">llms.txt Entry</TabsTrigger>
        </TabsList>
        
        <TabsContent value="registry">
          <CodeBlock
            code={JSON.stringify(generateRegistryJSON(component), null, 2)}
            language="json"
          />
        </TabsContent>
        
        <TabsContent value="mcp">
          <CodeBlock
            code={JSON.stringify(generateMCPResponse(component), null, 2)}
            language="json"
          />
        </TabsContent>
        
        <TabsContent value="llms">
          <CodeBlock
            code={generateLLMSTxtEntry(component)}
            language="text"
          />
        </TabsContent>
      </Tabs>
    </div>
  )}
</div>
```

---

## 📊 Phase 6: Copy Buttons & DX Improvements

### **6.1 Universal Copy Button**

```typescript
// components/copy-button.tsx
'use client'

import { Check, Copy } from 'lucide-react'
import { useState } from 'react'

export function CopyButton({ 
  text, 
  label = "Copy" 
}: { 
  text: string
  label?: string 
}) {
  const [copied, setCopied] = useState(false)
  
  const handleCopy = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  
  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center gap-2 px-3 py-1.5 text-sm border rounded-md hover:bg-accent transition-colors"
    >
      {copied ? (
        <>
          <Check className="h-4 w-4" />
          Copied!
        </>
      ) : (
        <>
          <Copy className="h-4 w-4" />
          {label}
        </>
      )}
    </button>
  )
}
```

**Add to:**
- Every code block
- Installation commands
- API endpoints
- Prompts
- Examples

---

### **6.2 Enhanced Code Block**

```typescript
// components/code-block.tsx
'use client'

import { CopyButton } from './copy-button'
import { highlight } from 'sugar-high'

export function CodeBlock({ 
  code, 
  language,
  filename,
  showLineNumbers = false 
}: {
  code: string
  language: string
  filename?: string
  showLineNumbers?: boolean
}) {
  const highlighted = highlight(code)
  
  return (
    <div className="relative group">
      {/* Header */}
      {filename && (
        <div className="flex items-center justify-between px-4 py-2 bg-muted/50 border-b rounded-t-lg">
          <span className="text-xs font-mono">{filename}</span>
          <CopyButton text={code} label="Copy code" />
        </div>
      )}
      
      {/* Code */}
      <pre className={`p-4 bg-muted overflow-x-auto ${filename ? 'rounded-b-lg' : 'rounded-lg'}`}>
        <code 
          className={`language-${language}`}
          dangerouslySetInnerHTML={{ __html: highlighted }}
        />
      </pre>
      
      {/* Floating Copy Button (when no filename) */}
      {!filename && (
        <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <CopyButton text={code} label="" />
        </div>
      )}
    </div>
  )
}
```

---

## 📊 Phase 7: Theme System Improvements

### **7.1 HSL Color Migration**

```typescript
// lib/theme-converter.ts
export function hexToHSL(hex: string): string {
  // Convert #0066cc to "222.2 100% 40%"
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result) return "0 0% 0%"
  
  let r = parseInt(result[1], 16) / 255
  let g = parseInt(result[2], 16) / 255
  let b = parseInt(result[3], 16) / 255
  
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0, s = 0, l = (max + min) / 2
  
  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
      case g: h = ((b - r) / d + 2) / 6; break
      case b: h = ((r - g) / d + 4) / 6; break
    }
  }
  
  h = Math.round(h * 360)
  s = Math.round(s * 100)
  l = Math.round(l * 100)
  
  return `${h} ${s}% ${l}%`
}

// Migration script
export async function migrateThemesToHSL() {
  const themes = await getThemes()
  
  for (const theme of themes) {
    const hslColors = {}
    for (const [key, hex] of Object.entries(theme.colors)) {
      hslColors[key] = hexToHSL(hex)
    }
    
    await updateTheme(theme.id, { colors: hslColors })
  }
}
```

---

### **7.2 Theme Switcher Component**

```typescript
// components/theme-switcher.tsx
'use client'

import { useTheme } from '@/components/theme-provider'

export function ThemeSwitcher() {
  const { themes, activeTheme, setActiveTheme } = useTheme()
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="px-3 py-1.5 text-sm border rounded-md hover:bg-accent">
          <Palette className="h-4 w-4 inline mr-2" />
          {activeTheme?.name || 'Theme'}
        </button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Choose Theme</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {themes.map(theme => (
          <DropdownMenuItem
            key={theme.id}
            onClick={() => setActiveTheme(theme.id)}
            className="flex items-center gap-2"
          >
            <div className="flex gap-1">
              {Object.entries(theme.colors).slice(0, 3).map(([key, value]) => (
                <div
                  key={key}
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: `hsl(${value})` }}
                />
              ))}
            </div>
            <span>{theme.name}</span>
            {activeTheme?.id === theme.id && <Check className="ml-auto h-4 w-4" />}
          </DropdownMenuItem>
        ))}
        
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => window.location.href = '/admin/themes'}>
          Manage Themes
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
```

---

## 📊 Implementation Timeline

### **Week 1-2: Foundation**
- ✅ Sidebar navigation
- ✅ Top header with actions
- ✅ Command menu (⌘K)
- ✅ Theme toggle
- ✅ Component grid view

### **Week 3-4: Component Pages**
- ✅ Enhanced detail layout
- ✅ Tabs (Preview, Code, API, Prompts, Install)
- ✅ Copy buttons everywhere
- ✅ Component thumbnails

### **Week 5-6: AI Integration**
- ✅ MCP Server endpoint
- ✅ Component Registry API
- ✅ llms.txt file
- ✅ Prompt library page
- ✅ AI integration docs

### **Week 7-8: Admin & DX**
- ✅ Enhanced spec upload with AI preview
- ✅ Registry preview in admin
- ✅ HSL color migration
- ✅ Theme switcher component
- ✅ Installation guides

---

## 📊 Success Metrics

**User Experience:**
- ⏱️ Time to find component: < 5 seconds (with ⌘K)
- 📋 Copy success rate: > 95%
- 🎨 Theme switching: Instant
- 📱 Mobile navigation: Smooth

**AI Integration:**
- 🤖 v0.dev can discover all components
- 🤖 Claude MCP works seamlessly
- 🤖 Cursor @docs integration works
- 📊 API response time: < 200ms

**Admin Efficiency:**
- ⏱️ Spec upload to live component: < 2 minutes
- 🤖 AI extraction accuracy: > 90%
- 📊 Component generation success: > 95%
- 🎨 Theme mapping accuracy: > 85%

---

## ✅ Summary

**What You'll Have:**

1. **shadcn/ui-level UX**
   - Sidebar navigation
   - ⌘K search
   - Component grid
   - Theme switcher
   - Copy buttons everywhere

2. **Your Unique Features**
   - 📸 Spec sheet upload
   - 🤖 AI component generation
   - 🎨 Theme-aware generation
   - 📝 Auto-generated prompts
   - 🔒 Admin CMS

3. **AI Tool Integration**
   - 🔌 MCP Server (Claude)
   - 📦 Component Registry (v0)
   - 📄 llms.txt (AI discovery)
   - 🎯 Prompt library
   - 🚀 One-click install

**Result:** A professional component library that matches shadcn/ui's UX while keeping your AI-powered spec sheet workflow, plus seamless integration with all major AI tools! 🚀

---

**Ready to start? Which phase should we tackle first?**

