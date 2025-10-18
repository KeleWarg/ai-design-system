import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { getCurrentUser } from '@/lib/supabase'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
})

export async function POST(request: Request) {
  try {
    // Require authentication
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('image') as File
    const themeJson = formData.get('theme') as string
    
    if (!file) {
      return NextResponse.json(
        { error: 'No image file provided' },
        { status: 400 }
      )
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'Anthropic API key not configured' },
        { status: 500 }
      )
    }

    // Parse theme data
    let theme = null
    try {
      theme = themeJson ? JSON.parse(themeJson) : null
    } catch (e) {
      console.error('Error parsing theme:', e)
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64Image = buffer.toString('base64')
    
    // Determine media type
    const mediaType = file.type || 'image/png'

    // Send to Claude with vision
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mediaType,
                data: base64Image,
              },
            },
            {
              type: 'text',
              text: `Analyze this component specification image and extract following information in shadcn/ui JSON format:

{
  "name": "Component name (e.g., Button, Card, Badge)",
  "description": "What the component does",
  "category": "Category (one of: buttons, inputs, layout, navigation, feedback, data-display, overlays, other)",
  "variants": {
    "variant": ["default", "secondary", "outline", "ghost"],
    "size": ["default", "sm", "lg"]
  },
  "colorMapping": {
    "specColor1": "themeToken",
    "specColor2": "themeToken"
  },
  "notes": "Any additional notes or requirements you see in the spec"
}

${theme ? `
THEME CONTEXT (${theme.name}):
Available color tokens: ${Object.entries(theme.colors).map(([key, value]) => `${key}: ${value}`).join(', ')}
${theme.typography ? `Typography: ${JSON.stringify(theme.typography, null, 2)}` : ''}
${theme.spacing ? `Spacing: ${JSON.stringify(theme.spacing, null, 2)}` : ''}

IMPORTANT: Map all colors you see in the spec to the closest theme token:
- Look at the actual hex/RGB values of colors in the spec
- Match them to the theme's color tokens
- Return the mapping in "colorMapping" as { "specColorName": "themeTokenName" }
- For example: { "Primary Button": "primary", "Secondary Background": "secondary", "Text Color": "foreground" }
- The generated component will use CSS variables (var(--primary), var(--secondary), etc.) instead of hardcoded colors
` : ''}

CRITICAL shadcn/ui Rules:
1. Extract all visible variants and their options
2. Variant names MUST be lowercase: variant, size, icon, state (NOT Type, Size, Icon, State!)
3. Variant values MUST be lowercase: default, primary, secondary, sm, lg (NOT Default, Primary, Secondary, Small, Large!)
4. Common variant patterns:
   - variant: default, secondary, ghost, outline, destructive, link
   - size: default, sm, lg, xl, icon
   - state: enabled, hover, disabled, focused, pressed
5. If you see colors, extract them AND map them to theme tokens in "colorMapping"
6. If you see sizes, extract them as a "size" variant (lowercase!)
7. Look for states like hover, active, disabled - add as "state" variant (lowercase!)
8. If category is unclear, use "other"
9. Include all text, measurements, and specifications you can see
${theme ? '10. CRITICAL: Provide accurate color mappings from spec colors to theme tokens' : ''}

Example Output:
{
  "name": "Button",
  "description": "A clickable button component",
  "category": "buttons",
  "variants": {
    "variant": ["default", "secondary", "ghost", "outline"],
    "size": ["default", "sm", "lg"]
  },
  "colorMapping": {
    "Primary": "primary",
    "Secondary": "secondary"
  }
}

Return ONLY valid JSON, no explanations or markdown.`
            }
          ]
        }
      ]
    })

    // Extract JSON from response
    let content = message.content[0].type === 'text' ? message.content[0].text : '{}'
    
    // Strip markdown code blocks if present
    content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    
    const spec = JSON.parse(content)

    return NextResponse.json(spec)
  } catch (error: unknown) {
    console.error('Image extraction error:', error)
    const message = error instanceof Error ? error.message : 'Failed to extract spec from image'
    return NextResponse.json(
      { error: message },
      { status: 500 }
    )
  }
}

