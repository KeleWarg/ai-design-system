import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Check if accessing admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Skip login page
    if (request.nextUrl.pathname === '/admin/login') {
      return NextResponse.next()
    }
    
    // Check for auth cookie
    const authCookie = request.cookies.get('admin_session')
    
    if (!authCookie) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
    
    // For MVP, just check cookie exists
    // In production, verify JWT token
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: '/admin/:path*',
}


