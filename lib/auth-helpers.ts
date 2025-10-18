import { getCurrentUser, UserRole } from './supabase'
import { redirect } from 'next/navigation'

export async function requireAuth() {
  const user = await getCurrentUser()
  if (!user) {
    redirect('/admin/login')
  }
  return user
}

export async function requireRole(role: UserRole) {
  const user = await getCurrentUser()
  
  if (!user) {
    throw new Error('Unauthorized')
  }
  
  if (role === 'admin' && user.role !== 'admin') {
    throw new Error('Forbidden: Admin access required')
  }
  
  return user
}

export async function canDelete() {
  const user = await getCurrentUser()
  return user?.role === 'admin'
}

export async function canEdit() {
  const user = await getCurrentUser()
  return !!user
}

export async function canCreate() {
  const user = await getCurrentUser()
  return !!user
}

