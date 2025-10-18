/**
 * Migration Script: Migrate existing JSON-based data to Supabase
 * 
 * This script helps you migrate:
 * - Theme files to the themes table
 * - Component files to the components table
 * 
 * Usage:
 *   npm run migrate -- --themes ./data/themes --components ./data/components
 */

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'
import bcrypt from 'bcryptjs'
import * as dotenv from 'dotenv'

// Load environment variables from .env.local
dotenv.config({ path: path.join(process.cwd(), '.env.local') })

// Environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const adminPassword = process.env.ADMIN_PASSWORD || 'admin123'

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables')
  console.error('Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function migrateThemes(themesDir: string) {
  console.log('\n📦 Migrating themes...')
  
  if (!fs.existsSync(themesDir)) {
    console.log('⚠️  Themes directory not found, skipping')
    return
  }
  
  const files = fs.readdirSync(themesDir).filter(f => f.endsWith('.json'))
  
  for (const file of files) {
    const filePath = path.join(themesDir, file)
    const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
    
    try {
      const { data, error } = await supabase
        .from('themes')
        .upsert({
          name: content.name,
          value: content.value,
          colors: content.colors,
          typography: content.typography || {},
          spacing: content.spacing || {},
          effects: content.effects || {},
          is_active: content.is_active || false
        })
        .select()
      
      if (error) throw error
      console.log(`✅ Migrated theme: ${content.name}`)
    } catch (error: any) {
      console.error(`❌ Failed to migrate ${file}:`, error.message)
    }
  }
}

async function migrateComponents(componentsDir: string) {
  console.log('\n📦 Migrating components...')
  
  if (!fs.existsSync(componentsDir)) {
    console.log('⚠️  Components directory not found, skipping')
    return
  }
  
  const files = fs.readdirSync(componentsDir).filter(f => f.endsWith('.json'))
  
  for (const file of files) {
    const filePath = path.join(componentsDir, file)
    const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
    
    try {
      const { data, error } = await supabase
        .from('components')
        .upsert({
          name: content.name,
          slug: content.slug,
          description: content.description,
          category: content.category,
          code: content.code,
          props: content.props || {},
          variants: content.variants || {},
          prompts: content.prompts || { basic: [], advanced: [], useCases: [] },
          examples: content.examples || [],
          installation: content.installation || { dependencies: [], setupSteps: [] }
        })
        .select()
      
      if (error) throw error
      console.log(`✅ Migrated component: ${content.name}`)
    } catch (error: any) {
      console.error(`❌ Failed to migrate ${file}:`, error.message)
    }
  }
}

async function initializeAdminPassword() {
  console.log('\n🔐 Setting up admin password...')
  
  try {
    const passwordHash = await bcrypt.hash(adminPassword, 10)
    
    const { error } = await supabase
      .from('admin_config')
      .upsert({
        password_hash: passwordHash
      })
    
    if (error) throw error
    console.log('✅ Admin password configured')
    console.log(`   Password: ${adminPassword}`)
    console.log('   ⚠️  IMPORTANT: Change this password in production!')
  } catch (error: any) {
    console.error('❌ Failed to set admin password:', error.message)
  }
}

async function createSampleData() {
  console.log('\n🎨 Creating sample data...')
  
  // Sample theme
  try {
    const { error } = await supabase
      .from('themes')
      .upsert({
        name: 'Default Light',
        value: 'light',
        colors: {
          background: '#ffffff',
          foreground: '#000000',
          card: '#ffffff',
          'card-foreground': '#000000',
          popover: '#ffffff',
          'popover-foreground': '#000000',
          primary: '#0070f3',
          'primary-foreground': '#ffffff',
          'primary-hover': '#0060df',
          'primary-active': '#0050c5',
          secondary: '#f4f4f5',
          'secondary-foreground': '#18181b',
          'secondary-hover': '#e4e4e7',
          'secondary-active': '#d4d4d8',
          muted: '#f4f4f5',
          'muted-foreground': '#71717a',
          accent: '#f4f4f5',
          'accent-foreground': '#18181b',
          destructive: '#ef4444',
          'destructive-foreground': '#ffffff',
          'destructive-hover': '#dc2626',
          success: '#10b981',
          'success-foreground': '#ffffff',
          border: '#e4e4e7',
          input: '#e4e4e7',
          ring: '#0070f3'
        },
        is_active: true
      })
    
    if (error) throw error
    console.log('✅ Created sample theme: Default Light')
  } catch (error: any) {
    console.error('❌ Failed to create sample theme:', error.message)
  }
}

async function main() {
  console.log('🚀 Starting migration...\n')
  
  const args = process.argv.slice(2)
  const themesDir = args[args.indexOf('--themes') + 1]
  const componentsDir = args[args.indexOf('--components') + 1]
  const createSamples = args.includes('--samples')
  
  // Initialize admin password
  await initializeAdminPassword()
  
  // Migrate existing data if paths provided
  if (themesDir) {
    await migrateThemes(themesDir)
  }
  
  if (componentsDir) {
    await migrateComponents(componentsDir)
  }
  
  // Create sample data if requested
  if (createSamples || (!themesDir && !componentsDir)) {
    await createSampleData()
  }
  
  console.log('\n✨ Migration complete!')
  console.log('\nNext steps:')
  console.log('1. Visit http://localhost:3000/admin/login')
  console.log('2. Log in with your admin password')
  console.log('3. Start creating themes and components')
}

main().catch(console.error)

