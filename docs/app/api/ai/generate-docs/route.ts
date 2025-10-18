import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { generateDocsPrompt } from '@/lib/ai-prompts'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
})

export async function POST(request: Request) {
  try {
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
      temperature: 0.5,
      system: 'You are a technical writer that generates component documentation. Return valid JSON only.',
      messages: [
        {
          role: 'user',
          content: generateDocsPrompt(component)
        }
      ]
    })

    let content = message.content[0].type === 'text' ? message.content[0].text : '{}'

    // Strip markdown code blocks if present
    content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()

    const docs = JSON.parse(content)

    return NextResponse.json(docs)
  } catch (error: any) {
    console.error('AI generation error:', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to generate docs' },
      { status: 500 }
    )
  }
}


