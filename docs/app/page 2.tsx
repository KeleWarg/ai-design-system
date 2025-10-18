import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="border-b border-border">
        <div className="container mx-auto px-6 py-16 max-w-6xl">
          <div className="text-center space-y-4">
            <h1 className="text-5xl font-bold text-foreground">
              Design System CMS
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Build, manage, and scale your design system with AI-powered component generation and dynamic theming.
            </p>
            <div className="flex gap-4 justify-center pt-8">
              <Link
                href="/docs/components"
                className="px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors font-medium"
              >
                Browse Components
              </Link>
              <Link
                href="/admin"
                className="px-6 py-3 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 transition-colors font-medium"
              >
                Admin Panel
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="container mx-auto px-6 py-16 max-w-6xl">
        <h2 className="text-3xl font-bold text-center text-foreground mb-12">
          Features
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-3">
            <div className="text-4xl">🎨</div>
            <h3 className="text-xl font-semibold text-foreground">Dynamic Themes</h3>
            <p className="text-muted-foreground">
              Create and manage themes with full CSS variable support. Switch themes in real-time across all components.
            </p>
          </div>
          
          <div className="space-y-3">
            <div className="text-4xl">🤖</div>
            <h3 className="text-xl font-semibold text-foreground">AI-Powered</h3>
            <p className="text-muted-foreground">
              Generate component code, documentation, and usage prompts automatically with OpenAI integration.
            </p>
          </div>
          
          <div className="space-y-3">
            <div className="text-4xl">⚡</div>
            <h3 className="text-xl font-semibold text-foreground">Real-time Updates</h3>
            <p className="text-muted-foreground">
              All changes sync instantly with Supabase real-time subscriptions. No page refresh needed.
            </p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="border-t border-border">
        <div className="container mx-auto px-6 py-16 max-w-6xl text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Ready to get started?
          </h2>
          <p className="text-muted-foreground mb-8">
            Set up your Supabase database and start building your design system today.
          </p>
          <Link
            href="/admin/login"
            className="inline-block px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors font-medium"
          >
            Access Admin Panel
          </Link>
        </div>
      </div>
    </div>
  )
}
