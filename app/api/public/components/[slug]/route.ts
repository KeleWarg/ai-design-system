import { NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'

/**
 * Public API: Get component by slug
 *
 * GET /api/public/components/[slug]
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    const supabase = getSupabase()
    const { data, error } = await supabase
      .from('components')
      .select('*')
      .eq('slug', slug)
      .single()

    if (error || !data) {
      return NextResponse.json(
        { error: 'Component not found' },
        {
          status: 404,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
          }
        }
      )
    }

    return NextResponse.json(
      data,
      {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        }
      }
    )
  } catch (error: unknown) {
    console.error('API error:', error)
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json(
      { error: message },
      {
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        }
      }
    )
  }
}

// Handle CORS preflight
export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    }
  )
}
