import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Palette, Sparkles, Zap } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="border-b">
        <div className="container mx-auto px-6 py-20 max-w-6xl">
          <div className="text-center space-y-6">
            <h1 className="text-6xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              Design System CMS
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Build, manage, and scale your design system with AI-powered component generation and dynamic theming.
            </p>
            <div className="flex gap-4 justify-center pt-4">
              <Button size="lg" asChild>
                <Link href="/docs/components">
                  Browse Components
                </Link>
              </Button>
              <Button size="lg" variant="secondary" asChild>
                <Link href="/admin">
                  Admin Panel
                </Link>
              </Button>
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
          <Card>
            <CardHeader>
              <Palette className="w-10 h-10 mb-2 text-primary" />
              <CardTitle>Dynamic Themes</CardTitle>
              <CardDescription>
                Create and manage themes with full CSS variable support. Switch themes in real-time across all components.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Sparkles className="w-10 h-10 mb-2 text-primary" />
              <CardTitle>AI-Powered</CardTitle>
              <CardDescription>
                Generate component code, documentation, and usage prompts automatically with OpenAI integration.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Zap className="w-10 h-10 mb-2 text-primary" />
              <CardTitle>Real-time Updates</CardTitle>
              <CardDescription>
                All changes sync instantly with Supabase real-time subscriptions. No page refresh needed.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>

      {/* CTA */}
      <div className="border-t">
        <div className="container mx-auto px-6 py-16 max-w-6xl text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Ready to get started?
          </h2>
          <p className="text-muted-foreground mb-8">
            Set up your Supabase database and start building your design system today.
          </p>
          <Button size="lg" asChild>
            <Link href="/admin/login">
              Access Admin Panel
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
