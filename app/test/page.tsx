export default function TestPage() {
  return (
    <div style={{ padding: '20px' }}>
      <h1>Test Page</h1>
      <p>If you can see this, Next.js is working!</p>
      <p>NEXT_PUBLIC_SUPABASE_URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? '✓ Set' : '✗ Not set'}</p>
      <p>NEXT_PUBLIC_SUPABASE_ANON_KEY: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✓ Set' : '✗ Not set'}</p>
    </div>
  )
}

