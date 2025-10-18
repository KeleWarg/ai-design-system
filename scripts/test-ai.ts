/**
 * Test script to verify Claude API integration
 *
 * Usage:
 *   tsx scripts/test-ai.ts
 */

async function testAI() {
  console.log('🧪 Testing Claude 4.5 Sonnet API Integration\n')

  const baseUrl = 'http://localhost:3000'

  // Test 1: Generate Component Code
  console.log('1️⃣ Testing /api/ai/generate-component...')
  try {
    const res = await fetch(`${baseUrl}/api/ai/generate-component`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'TestButton',
        description: 'A simple test button component',
        variants: {
          Type: ['Primary', 'Secondary'],
          Size: ['Small', 'Large']
        },
        props: []
      })
    })

    const data = await res.json()

    if (res.ok && data.code) {
      console.log('✅ Component generation successful')
      console.log(`   Generated ${data.code.length} characters of code`)
      console.log(`   Preview: ${data.code.substring(0, 100)}...\n`)
    } else {
      console.log('❌ Component generation failed')
      console.log(`   Error: ${data.error}\n`)
    }
  } catch (error: any) {
    console.log('❌ Component generation failed')
    console.log(`   Error: ${error.message}\n`)
  }

  // Test 2: Generate Prompts
  console.log('2️⃣ Testing /api/ai/generate-prompts...')
  try {
    const res = await fetch(`${baseUrl}/api/ai/generate-prompts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'TestButton',
        description: 'A simple test button component',
        variants: {
          Type: ['Primary', 'Secondary']
        }
      })
    })

    const data = await res.json()

    if (res.ok && (data.basic || data.advanced || data.useCases)) {
      console.log('✅ Prompt generation successful')
      console.log(`   Basic prompts: ${data.basic?.length || 0}`)
      console.log(`   Advanced prompts: ${data.advanced?.length || 0}`)
      console.log(`   Use cases: ${data.useCases?.length || 0}\n`)
    } else {
      console.log('❌ Prompt generation failed')
      console.log(`   Error: ${data.error}\n`)
    }
  } catch (error: any) {
    console.log('❌ Prompt generation failed')
    console.log(`   Error: ${error.message}\n`)
  }

  // Test 3: Generate Documentation
  console.log('3️⃣ Testing /api/ai/generate-docs...')
  try {
    const res = await fetch(`${baseUrl}/api/ai/generate-docs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'TestButton',
        code: 'export const Button = () => <button>Click me</button>',
        variants: {
          Type: ['Primary', 'Secondary']
        }
      })
    })

    const data = await res.json()

    if (res.ok && (data.api || data.installation || data.examples)) {
      console.log('✅ Documentation generation successful')
      console.log(`   Props: ${data.api?.props ? Object.keys(data.api.props).length : 0}`)
      console.log(`   Dependencies: ${data.installation?.dependencies?.length || 0}`)
      console.log(`   Examples: ${data.examples?.length || 0}\n`)
    } else {
      console.log('❌ Documentation generation failed')
      console.log(`   Error: ${data.error}\n`)
    }
  } catch (error: any) {
    console.log('❌ Documentation generation failed')
    console.log(`   Error: ${error.message}\n`)
  }

  console.log('✨ Test complete!')
}

testAI().catch(console.error)
