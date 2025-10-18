import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

/**
 * Public API: List all components
 *
 * GET /api/public/components
 * Query params:
 *   - category: Filter by category (optional)
 *   - limit: Number of results (optional, default: 100)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const limit = parseInt(searchParams.get('limit') || '100')

    const supabase = await createServerSupabaseClient()
    let query = supabase
      .from('components')
      .select('*')
      .order('name', { ascending: true })
      .limit(limit)

    if (category) {
      query = query.eq('category', category)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching components:', error)
      return NextResponse.json(
        { error: 'Failed to fetch components' },
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

    return NextResponse.json(
      {
        components: data || [],
        count: data?.length || 0
      },
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
