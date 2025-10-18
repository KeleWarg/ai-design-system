/**
 * Security Test Suite
 * 
 * Run this to verify all authentication and authorization checks are working
 * 
 * Usage: npm run test-security
 */

import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.join(process.cwd(), '.env.local') })

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

interface TestResult {
  name: string
  passed: boolean
  expected: string
  actual: string
  details?: string
}

const results: TestResult[] = []

async function testEndpoint(
  name: string,
  url: string,
  options: RequestInit,
  expectedStatus: number,
  expectedResponse?: { hasError?: boolean; errorMessage?: string }
) {
  try {
    const response = await fetch(url, options)
    const data = await response.json().catch(() => null)
    
    const statusMatch = response.status === expectedStatus
    let responseMatch = true
    let details = ''
    
    if (expectedResponse) {
      if (expectedResponse.hasError !== undefined) {
        responseMatch = responseMatch && (data?.error !== undefined) === expectedResponse.hasError
        details += data?.error ? ` Error: "${data.error}"` : ''
      }
      if (expectedResponse.errorMessage) {
        responseMatch = responseMatch && data?.error?.includes(expectedResponse.errorMessage)
      }
    }
    
    const passed = statusMatch && responseMatch
    
    results.push({
      name,
      passed,
      expected: `Status ${expectedStatus}${expectedResponse ? `, error: ${expectedResponse.hasError}` : ''}`,
      actual: `Status ${response.status}${data?.error ? `, error: "${data.error}"` : ''}`,
      details
    })
    
    return passed
  } catch (error) {
    results.push({
      name,
      passed: false,
      expected: `Status ${expectedStatus}`,
      actual: `Request failed: ${error}`,
      details: error instanceof Error ? error.message : String(error)
    })
    return false
  }
}

async function runSecurityTests() {
  console.log('🔒 Running Security Test Suite...\n')
  console.log(`Testing against: ${BASE_URL}\n`)
  console.log('=' .repeat(80))
  
  // Test 1: Public routes should be accessible
  console.log('\n📂 Testing Public Routes (Should Allow Access)\n')
  
  await testEndpoint(
    'Public API - List Themes',
    `${BASE_URL}/api/public/themes`,
    { method: 'GET' },
    200
  )
  
  await testEndpoint(
    'Public API - List Components',
    `${BASE_URL}/api/public/components`,
    { method: 'GET' },
    200
  )
  
  // Test 2: Admin routes without auth should redirect/block
  console.log('\n🚫 Testing Admin Routes Without Auth (Should Block)\n')
  
  // Note: We can't easily test middleware redirects in this script
  // because fetch follows redirects. But we can test API routes.
  console.log('⚠️  Middleware protection (/admin routes) requires browser testing')
  console.log('   Try: Open http://localhost:3000/admin in private browsing\n')
  
  // Test 3: AI endpoints without auth should return 401
  console.log('🤖 Testing AI Endpoints Without Auth (Should Return 401)\n')
  
  await testEndpoint(
    'AI Generate Component (Unauthenticated)',
    `${BASE_URL}/api/ai/generate-component`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'TestButton' })
    },
    401,
    { hasError: true }
  )
  
  await testEndpoint(
    'AI Generate Prompts (Unauthenticated)',
    `${BASE_URL}/api/ai/generate-prompts`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'TestButton' })
    },
    401,
    { hasError: true }
  )
  
  await testEndpoint(
    'AI Generate Docs (Unauthenticated)',
    `${BASE_URL}/api/ai/generate-docs`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'TestButton' })
    },
    401,
    { hasError: true }
  )
  
  // Test 4: Delete endpoints without auth should return 401
  console.log('\n🗑️  Testing Delete Endpoints Without Auth (Should Return 401)\n')
  
  await testEndpoint(
    'Delete Theme (Unauthenticated)',
    `${BASE_URL}/api/admin/themes/fake-id`,
    { method: 'DELETE' },
    401,
    { hasError: true }
  )
  
  await testEndpoint(
    'Delete Component (Unauthenticated)',
    `${BASE_URL}/api/admin/components/fake-id`,
    { method: 'DELETE' },
    401,
    { hasError: true }
  )
  
  // Print results
  console.log('\n' + '='.repeat(80))
  console.log('\n📊 Test Results:\n')
  
  const passed = results.filter(r => r.passed).length
  const failed = results.filter(r => !r.passed).length
  
  results.forEach(result => {
    const icon = result.passed ? '✅' : '❌'
    console.log(`${icon} ${result.name}`)
    if (!result.passed) {
      console.log(`   Expected: ${result.expected}`)
      console.log(`   Actual:   ${result.actual}`)
      if (result.details) {
        console.log(`   Details:  ${result.details}`)
      }
    }
  })
  
  console.log('\n' + '='.repeat(80))
  console.log(`\n✅ Passed: ${passed}/${results.length}`)
  console.log(`❌ Failed: ${failed}/${results.length}`)
  
  if (failed === 0) {
    console.log('\n🎉 All security tests passed!')
  } else {
    console.log('\n⚠️  Some tests failed. Review the results above.')
  }
  
  console.log('\n📝 Additional Manual Tests Required:')
  console.log('   1. Open http://localhost:3000/admin in private browsing')
  console.log('      → Should redirect to /admin/login')
  console.log('   2. Login as editor and try to delete a theme/component')
  console.log('      → Delete button should not appear in UI')
  console.log('      → API should return 403 Forbidden if attempted')
  console.log('   3. Login as admin and try to delete a theme/component')
  console.log('      → Should work successfully')
  console.log('\n')
  
  // Exit with error code if tests failed
  process.exit(failed > 0 ? 1 : 0)
}

// Run tests
runSecurityTests().catch(error => {
  console.error('❌ Test suite failed:', error)
  process.exit(1)
})

