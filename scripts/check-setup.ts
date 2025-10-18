/**
 * Setup Checker
 * Verifies that all environment variables are set and Supabase is accessible
 */

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'
import * as dotenv from 'dotenv'

// Load environment variables from .env.local
dotenv.config({ path: path.join(process.cwd(), '.env.local') })

console.log('🔍 Checking Design System CMS Setup...\n')

// Check if .env.local exists
const envPath = path.join(process.cwd(), '.env.local')
const envExists = fs.existsSync(envPath)

if (!envExists) {
  console.log('❌ .env.local file not found')
  console.log('📝 Create a .env.local file with these variables:')
  console.log(`
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
ADMIN_PASSWORD=your-password
OPENAI_API_KEY=your-openai-key
  `)
  process.exit(1)
}

console.log('✅ .env.local file found\n')

// Check environment variables
const checks = [
  { name: 'NEXT_PUBLIC_SUPABASE_URL', value: process.env.NEXT_PUBLIC_SUPABASE_URL },
  { name: 'NEXT_PUBLIC_SUPABASE_ANON_KEY', value: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY },
  { name: 'SUPABASE_SERVICE_ROLE_KEY', value: process.env.SUPABASE_SERVICE_ROLE_KEY },
  { name: 'ADMIN_PASSWORD', value: process.env.ADMIN_PASSWORD },
  { name: 'OPENAI_API_KEY', value: process.env.OPENAI_API_KEY, optional: true },
]

let allValid = true

console.log('📋 Environment Variables:')
for (const check of checks) {
  if (!check.value) {
    if (check.optional) {
      console.log(`⚠️  ${check.name}: Not set (optional - needed for AI features)`)
    } else {
      console.log(`❌ ${check.name}: Missing`)
      allValid = false
    }
  } else {
    const masked = check.value.substring(0, 10) + '...' + check.value.substring(check.value.length - 4)
    console.log(`✅ ${check.name}: ${masked}`)
  }
}

if (!allValid) {
  console.log('\n❌ Some required environment variables are missing')
  process.exit(1)
}

async function checkConnection() {
  console.log('\n🔌 Testing Supabase Connection...')

  // Test Supabase connection
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  try {
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    // Test connection by checking tables
    const { data: themes, error: themesError } = await supabase.from('themes').select('count')
    const { data: components, error: componentsError } = await supabase.from('components').select('count')
    const { data: config, error: configError } = await supabase.from('admin_config').select('count')
    
    if (themesError || componentsError || configError) {
      console.log('❌ Database tables not found')
      console.log('\n📝 Next steps:')
      console.log('1. Go to your Supabase dashboard')
      console.log('2. Click "SQL Editor" in the left sidebar')
      console.log('3. Click "New Query"')
      console.log('4. Copy and paste the contents of database/schema.sql')
      console.log('5. Click "Run" (or press Ctrl/Cmd + Enter)')
      console.log('6. Run this script again: npm run check-setup')
      process.exit(1)
    }
    
    console.log('✅ Supabase connection successful')
    console.log('✅ All database tables exist')
    
    // Check if data exists
    const { count: themeCount } = await supabase.from('themes').select('*', { count: 'exact', head: true })
    const { count: componentCount } = await supabase.from('components').select('*', { count: 'exact', head: true })
    
    console.log(`\n📊 Database Status:`)
    console.log(`   Themes: ${themeCount || 0}`)
    console.log(`   Components: ${componentCount || 0}`)
    
    if ((themeCount || 0) === 0 && (componentCount || 0) === 0) {
      console.log('\n💡 Tip: Run "npm run seed" to create sample data')
    }
    
    console.log('\n✨ Setup complete! You can now run:')
    console.log('   npm run dev     - Start development server')
    console.log('   npm run seed    - Create sample data (if needed)')
    console.log('\n🎉 Your Design System CMS is ready!')
    
  } catch (error: any) {
    console.log('❌ Supabase connection failed')
    console.log('Error:', error.message)
    console.log('\n📝 Double-check your Supabase credentials in .env.local')
    process.exit(1)
  }
}

checkConnection()

