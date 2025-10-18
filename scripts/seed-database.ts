/**
 * Database Seeding Script
 * 
 * Creates sample themes and components for testing
 * 
 * Usage:
 *   npm run seed
 */

import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'
import * as dotenv from 'dotenv'
import * as path from 'path'

// Load environment variables from .env.local
dotenv.config({ path: path.join(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const adminPassword = process.env.ADMIN_PASSWORD || 'admin123'

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function seed() {
  console.log('🌱 Seeding database...\n')
  
  // 1. Set admin password
  console.log('🔐 Setting admin password...')
  const passwordHash = await bcrypt.hash(adminPassword, 10)

  // Check if admin config exists
  const { data: existing } = await supabase.from('admin_config').select('id').single()

  if (existing) {
    // Update existing
    await supabase.from('admin_config').update({ password_hash: passwordHash }).eq('id', existing.id)
  } else {
    // Insert new
    await supabase.from('admin_config').insert({ password_hash: passwordHash })
  }

  console.log(`✅ Admin password set to: ${adminPassword}\n`)
  
  // 2. Create themes
  console.log('🎨 Creating themes...')
  
  const lightTheme = {
    name: 'Light Theme',
    value: 'light',
    colors: {
      background: '#ffffff',
      foreground: '#0a0a0a',
      card: '#ffffff',
      'card-foreground': '#0a0a0a',
      popover: '#ffffff',
      'popover-foreground': '#0a0a0a',
      primary: '#2563eb',
      'primary-foreground': '#f8fafc',
      'primary-hover': '#1d4ed8',
      'primary-active': '#1e40af',
      secondary: '#f1f5f9',
      'secondary-foreground': '#0f172a',
      'secondary-hover': '#e2e8f0',
      'secondary-active': '#cbd5e1',
      muted: '#f1f5f9',
      'muted-foreground': '#64748b',
      accent: '#f1f5f9',
      'accent-foreground': '#0f172a',
      destructive: '#ef4444',
      'destructive-foreground': '#f8fafc',
      'destructive-hover': '#dc2626',
      success: '#10b981',
      'success-foreground': '#f8fafc',
      border: '#e2e8f0',
      input: '#e2e8f0',
      ring: '#2563eb'
    },
    is_active: true
  }
  
  const darkTheme = {
    name: 'Dark Theme',
    value: 'dark',
    colors: {
      background: '#0a0a0a',
      foreground: '#fafafa',
      card: '#171717',
      'card-foreground': '#fafafa',
      popover: '#171717',
      'popover-foreground': '#fafafa',
      primary: '#3b82f6',
      'primary-foreground': '#0a0a0a',
      'primary-hover': '#2563eb',
      'primary-active': '#1d4ed8',
      secondary: '#262626',
      'secondary-foreground': '#fafafa',
      'secondary-hover': '#404040',
      'secondary-active': '#525252',
      muted: '#262626',
      'muted-foreground': '#a3a3a3',
      accent: '#262626',
      'accent-foreground': '#fafafa',
      destructive: '#ef4444',
      'destructive-foreground': '#fafafa',
      'destructive-hover': '#dc2626',
      success: '#10b981',
      'success-foreground': '#0a0a0a',
      border: '#262626',
      input: '#262626',
      ring: '#3b82f6'
    },
    is_active: false
  }
  
  await supabase.from('themes').insert([lightTheme, darkTheme])
  console.log('✅ Created Light and Dark themes\n')
  
  // 3. Create sample component
  console.log('🧩 Creating sample component...')
  
  const buttonComponent = {
    name: 'Button',
    slug: 'button',
    description: 'A customizable button component with multiple variants for different use cases.',
    category: 'buttons',
    code: `"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../../lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      Type: {
        Primary: "bg-primary text-primary-foreground hover:bg-primary-hover active:bg-primary-active",
        Secondary: "bg-secondary text-secondary-foreground hover:bg-secondary-hover active:bg-secondary-active",
        Destructive: "bg-destructive text-destructive-foreground hover:bg-destructive-hover",
        Ghost: "hover:bg-accent hover:text-accent-foreground",
        Link: "text-primary underline-offset-4 hover:underline",
      },
      Size: {
        Small: "h-9 px-3",
        Base: "h-10 px-4 py-2",
        Large: "h-11 px-8",
        Icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      Type: "Primary",
      Size: "Base",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, Type, Size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ Type, Size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }`,
    props: [
      { name: 'Type', type: '"Primary" | "Secondary" | "Destructive" | "Ghost" | "Link"', required: false, description: 'The visual style variant', default: 'Primary' },
      { name: 'Size', type: '"Small" | "Base" | "Large" | "Icon"', required: false, description: 'The size of the button', default: 'Base' },
      { name: 'disabled', type: 'boolean', required: false, description: 'Whether the button is disabled', default: 'false' }
    ],
    variants: {
      Type: ['Primary', 'Secondary', 'Destructive', 'Ghost', 'Link'],
      Size: ['Small', 'Base', 'Large', 'Icon']
    },
    prompts: {
      basic: [
        'Give me a button',
        'Create a primary button',
        'Make a secondary button',
        'Show me a destructive button',
        'Generate a ghost button'
      ],
      advanced: [
        'Create a large primary button for hero sections',
        'Make a small secondary button for forms',
        'Generate a destructive button with icon for delete actions',
        'Create a link-style button for navigation'
      ],
      useCases: [
        {
          scenario: 'Form Submit Button',
          prompt: 'Create a primary button for form submission',
          output: '<Button Type="Primary" Size="Base">Submit</Button>'
        },
        {
          scenario: 'Cancel Action',
          prompt: 'Make a secondary button for canceling',
          output: '<Button Type="Secondary" Size="Base">Cancel</Button>'
        },
        {
          scenario: 'Delete Confirmation',
          prompt: 'Create a destructive button for delete action',
          output: '<Button Type="Destructive" Size="Base">Delete</Button>'
        }
      ]
    },
    examples: [
      {
        name: 'Primary Button',
        code: '<Button Type="Primary">Click me</Button>'
      },
      {
        name: 'Secondary Button',
        code: '<Button Type="Secondary">Cancel</Button>'
      },
      {
        name: 'Large Button',
        code: '<Button Size="Large">Get Started</Button>'
      }
    ],
    installation: {
      dependencies: ['class-variance-authority', 'clsx', 'tailwind-merge'],
      setupSteps: [
        'Install dependencies: npm install class-variance-authority clsx tailwind-merge',
        'Copy the button component code to your components directory',
        'Import and use: import { Button } from "@/components/ui/button"'
      ]
    }
  }
  
  await supabase.from('components').insert([buttonComponent])
  console.log('✅ Created Button component\n')
  
  console.log('✨ Seeding complete!')
  console.log('\nYou can now:')
  console.log('1. Visit http://localhost:3000/admin/login')
  console.log(`2. Login with password: ${adminPassword}`)
  console.log('3. Explore themes and components')
}

seed().catch(console.error)

