import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { generatePromptsPrompt } from '@/lib/ai-prompts'
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

    const component = await request.json()

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
      system: 'You are a helpful assistant that generates AI usage prompts. Return valid JSON only.',
      messages: [
        {
          role: 'user',
          content: generatePromptsPrompt(component)
        }
      ]
    })

    let content = message.content[0].type === 'text' ? message.content[0].text : '{}'

    // Strip markdown code blocks if present
    content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()

    const prompts = JSON.parse(content)

    return NextResponse.json(prompts)
  } catch (error: unknown) {
    console.error('AI generation error:', error)
    const message = error instanceof Error ? error.message : 'Failed to generate prompts'
    return NextResponse.json(
      { error: message },
      { status: 500 }
    )
  }
}


