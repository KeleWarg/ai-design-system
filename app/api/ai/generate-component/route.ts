import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { generateComponentPrompt } from '@/lib/ai-prompts'
import { getCurrentUser } from '@/lib/supabase'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
})

export async function POST(request: Request) {
  try {
    // Require authentication for AI generation
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const spec = await request.json()

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'Anthropic API key not configured' },
        { status: 500 }
      )
    }

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 8192,
      temperature: 0.7,
      system: 'You are an expert React developer. Generate clean, type-safe component code following the exact pattern provided.',
      messages: [
        {
          role: 'user',
          content: generateComponentPrompt(spec)
        }
      ]
    })

    const code = message.content[0].type === 'text' ? message.content[0].text : ''

    return NextResponse.json({ code })
  } catch (error: unknown) {
    console.error('AI generation error:', error)
    const message = error instanceof Error ? error.message : 'Failed to generate component'
    return NextResponse.json(
      { error: message },
      { status: 500 }
    )
  }
}


