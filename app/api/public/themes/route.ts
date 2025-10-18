import { NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'

/**
 * Public API: List all themes
 *
 * GET /api/public/themes
 */
export async function GET() {
  try {
    const supabase = getSupabase()
    const { data, error } = await supabase
      .from('themes')
      .select('*')
      .order('name', { ascending: true })

    if (error) {
      console.error('Error fetching themes:', error)
      return NextResponse.json(
        { error: 'Failed to fetch themes' },
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
        themes: data || [],
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
