export function generateComponentPrompt(spec: {
  name: string
  description: string
  variants: Record<string, string[]>
  props: Array<{ name: string; type: string; required: boolean }>
  theme?: {
    name: string
    colors: Record<string, string>
    typography?: Record<string, unknown>
    spacing?: Record<string, unknown>
  }
  colorMapping?: Record<string, string>
}) {
  return `Generate a React component following the EXACT shadcn/ui pattern:

Name: ${spec.name}
Description: ${spec.description}
Variants: ${JSON.stringify(spec.variants, null, 2)}
Props: ${JSON.stringify(spec.props, null, 2)}

${spec.theme ? `
THEME: ${spec.theme.name}
Available color tokens: ${Object.keys(spec.theme.colors).join(', ')}
${spec.colorMapping ? `Color Mapping: ${JSON.stringify(spec.colorMapping, null, 2)}` : ''}

🎨 CRITICAL COLOR RULES:
- NEVER use hardcoded colors (no #hex, no rgb())
- ALWAYS use Tailwind classes with theme tokens: bg-primary, text-foreground, border-border
- For hover states: hover:bg-primary-hover, hover:text-primary-foreground
- For active states: active:bg-primary-active
- For disabled: disabled:opacity-50, disabled:cursor-not-allowed
- Follow the color mapping provided above
` : ''}

CRITICAL Requirements (shadcn/ui pattern ONLY):
1. Variant names MUST be lowercase: variant, size, icon, state (NOT Type, Size!)
2. Variant values MUST be lowercase: default, primary, secondary, sm, lg (NOT Primary, Small!)
3. Use Slot from @radix-ui/react-slot for composition
4. Support asChild prop for component composition
5. Use theme token classes: bg-primary, text-primary-foreground, hover:bg-primary-hover
6. NEVER hardcode colors - use theme tokens only

REQUIRED Imports:
\`\`\`typescript
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
\`\`\`

Example (match this EXACTLY):
\`\`\`typescript
"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const ${spec.name.toLowerCase()}Variants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary-hover",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary-hover",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        outline: "border border-input bg-background hover:bg-accent",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3",
        lg: "h-11 px-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ${spec.name}Props
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof ${spec.name.toLowerCase()}Variants> {
  asChild?: boolean
}

const ${spec.name} = React.forwardRef<HTMLButtonElement, ${spec.name}Props>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(${spec.name.toLowerCase()}Variants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
${spec.name}.displayName = "${spec.name}"

export { ${spec.name}, ${spec.name.toLowerCase()}Variants }
\`\`\`

CRITICAL: 
- Use lowercase variant names: variant, size (NOT Type, Size)
- Use lowercase variant values: default, primary, sm, lg (NOT Default, Primary, Small, Large)
- Include Slot support with asChild prop
- Match the exact structure above

Return ONLY the component code following this pattern. No explanations.`
}

export function generatePromptsPrompt(component: {
  name: string
  description: string
  variants: Record<string, string[]>
}) {
  return `Generate AI usage prompts for this component:

Component: ${component.name}
Description: ${component.description}
Variants: ${JSON.stringify(component.variants, null, 2)}

Create prompts in three categories:

1. Basic Prompts (5-10 simple, single-variant requests):
   - "Give me a ${component.name}"
   - "Create a [variant] ${component.name}"

2. Advanced Prompts (5-10 complex, multi-variant requests):
   - "Create a [variant1] [variant2] ${component.name} with [feature]"

3. Use Cases (3-5 real-world scenarios with prompt and expected code output):
   - Scenario: "Hero Section CTA"
   - Prompt: "Create primary and secondary buttons for hero"
   - Output: JSX code example

Return as JSON:
{
  "basic": ["prompt1", "prompt2", ...],
  "advanced": ["prompt1", "prompt2", ...],
  "useCases": [
    {
      "scenario": "...",
      "prompt": "...",
      "output": "..."
    }
  ]
}`
}

export function generateDocsPrompt(component: {
  name: string
  code: string
  variants: Record<string, string[]>
}) {
  return `Generate documentation for this component:

Component Name: ${component.name}
Variants: ${JSON.stringify(component.variants, null, 2)}

Code:
${component.code}

Generate:
1. API Documentation (extract props from code)
2. Installation steps
3. Usage examples (basic + variants)

Return as JSON:
{
  "api": {
    "props": [
      {
        "name": "...",
        "type": "...",
        "required": false,
        "description": "...",
        "default": "..."
      }
    ]
  },
  "installation": {
    "dependencies": ["class-variance-authority", "clsx", "tailwind-merge"],
    "setupSteps": ["...", "...", "..."]
  },
  "examples": [
    {
      "name": "...",
      "code": "..."
    }
  ]
}`
}


