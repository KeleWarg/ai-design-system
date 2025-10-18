'use client'

import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'

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
  
  // Don't show layout on login page
  if (pathname === '/admin/login') {
    return <>{children}</>
  }
  
  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: '📊' },
    { name: 'Themes', href: '/admin/themes', icon: '🎨' },
    { name: 'Components', href: '/admin/components', icon: '🧩' },
    { name: 'Settings', href: '/admin/settings', icon: '⚙️' },
  ]
  
  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r border-border flex flex-col">
        <div className="p-6 border-b border-border">
          <h1 className="text-2xl font-bold text-foreground">Admin Panel</h1>
          <p className="text-xs text-muted-foreground mt-1">Design System CMS</p>
        </div>
        <nav className="flex-1 space-y-1 px-3 py-4">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-foreground hover:bg-accent hover:text-accent-foreground'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                {item.name}
              </Link>
            )
          })}
        </nav>
        <div className="p-4 border-t border-border">
          <button
            onClick={handleLogout}
            className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors py-2 px-3 rounded-md hover:bg-accent"
          >
            🚪 Logout
          </button>
        </div>
      </aside>
      
      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  )
}


