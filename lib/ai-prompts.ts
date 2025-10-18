export function generateComponentPrompt(spec: {
  name: string
  description: string
  variants: Record<string, string[]>
  props: Array<{ name: string; type: string; required: boolean }>
}) {
  return `Generate a React component following this exact pattern from our design system:

Name: ${spec.name}
Description: ${spec.description}
Variants: ${JSON.stringify(spec.variants, null, 2)}
Props: ${JSON.stringify(spec.props, null, 2)}

CRITICAL Requirements (match existing Button component):
1. Use "use client" directive for Next.js
2. Import: class-variance-authority, cn from "../../lib/utils"
3. Variant names MUST be PascalCase (Type, Size, Icon, State)
4. Variant options MUST be PascalCase (Primary, Secondary, Large, Small)
5. Use CSS variables: var(--button-height-sm), var(--duration-base)
6. Use theme token classes: bg-primary, text-primary-foreground, hover:bg-primary-hover
7. Use semantic HTML element (button, div, etc.)
8. Forward refs: React.forwardRef<HTMLElement, ComponentProps>
9. Export both Component and componentVariants
10. Support native HTML attributes via spread

Example structure:
\`\`\`typescript
"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../../lib/utils"

const ${spec.name.toLowerCase()}Variants = cva(
  "base-classes transition-all duration-[var(--duration-base)]",
  {
    variants: {
      Type: {
        Primary: "bg-primary text-primary-foreground hover:bg-primary-hover active:bg-primary-active",
        Secondary: "bg-secondary text-secondary-foreground hover:bg-secondary-hover active:bg-secondary-active"
      },
      Size: {
        Small: "h-[var(--component-height-sm)] px-3 text-xs",
        Base: "h-[var(--component-height-base)] px-4 text-sm"
      }
    },
    defaultVariants: {
      Type: "Primary",
      Size: "Base"
    }
  }
)

export interface ${spec.name}Props
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof ${spec.name.toLowerCase()}Variants> {}

const ${spec.name} = React.forwardRef<HTMLElement, ${spec.name}Props>(
  ({ className, Type, Size, ...props }, ref) => {
    return (
      <element
        ref={ref}
        className={cn(${spec.name.toLowerCase()}Variants({ Type, Size, className }))}
        {...props}
      />
    )
  }
)
${spec.name}.displayName = "${spec.name}"

export { ${spec.name}, ${spec.name.toLowerCase()}Variants }
\`\`\`

Return ONLY the component code following this exact pattern. No explanations.`
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


