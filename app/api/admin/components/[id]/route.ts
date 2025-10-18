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
    
    const { error } = await supabase
      .from('components')
      .delete()
      .eq('id', id)
    
    if (error) {
      console.error('Error deleting component:', error)
      return NextResponse.json(
        { error: 'Failed to delete component' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    const err = error as Error
    if (err.message === 'Forbidden: Admin access required') {
      return NextResponse.json(
        { error: 'Only admins can delete components' },
        { status: 403 }
      )
    }
    if (err.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    console.error('Delete component error:', error)
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    )
  }
}

