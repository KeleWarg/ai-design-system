import { NextResponse } from 'next/server'
import { verifyPassword, hashPassword } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  try {
    // Check authentication
    const cookieStore = await cookies()
    const authCookie = cookieStore.get('admin_session')
    
    if (!authCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { currentPassword, newPassword } = await request.json()
    
    // Verify current password
    const isValid = await verifyPassword(currentPassword)
    if (!isValid) {
      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 401 })
    }
    
    // Hash new password
    const newHash = await hashPassword(newPassword)
    
    // Update password in database
    const { error } = await supabaseAdmin
      .from('admin_config')
      .update({ 
        password_hash: newHash,
        updated_at: new Date().toISOString()
      })
      .eq('id', (await supabaseAdmin.from('admin_config').select('id').single()).data?.id)
    
    if (error) throw error
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Password change error:', error)
    return NextResponse.json({ error: 'Failed to change password' }, { status: 500 })
  }
}


