import { NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth-helpers'
import { createServerSupabaseClient } from '@/lib/supabase'

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Require admin role for deletion
    await requireRole('admin')
    
    const { id } = await params
    const supabase = await createServerSupabaseClient()
    
    // Check if theme is active
    const { data: theme } = await supabase
      .from('themes')
      .select('is_active')
      .eq('id', id)
      .single()
    
    if (theme?.is_active) {
      return NextResponse.json(
        { error: 'Cannot delete active theme' },
        { status: 400 }
      )
    }
    
    const { error } = await supabase
      .from('themes')
      .delete()
      .eq('id', id)
    
    if (error) {
      console.error('Error deleting theme:', error)
      return NextResponse.json(
        { error: 'Failed to delete theme' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    const err = error as Error
    if (err.message === 'Forbidden: Admin access required') {
      return NextResponse.json(
        { error: 'Only admins can delete themes' },
        { status: 403 }
      )
    }
    if (err.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    console.error('Delete theme error:', error)
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    )
  }
}

