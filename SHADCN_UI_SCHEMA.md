# shadcn/ui Schema Migration

## 🎯 What Changed

The system now generates components following the **shadcn/ui** pattern, which is the industry standard used by:
- **v0.dev** (Vercel's AI UI generator)
- **Claude Artifacts**
- **Copilot** 
- **shadcn/ui** library
- Most modern component libraries

---

## 📊 Schema Comparison

### ❌ Old Pattern (Custom, PascalCase)

```typescript
// AI Extraction
{
  "variants": {
    "Type": ["Primary", "Secondary", "Ghost"],
    "Size": ["Small", "Base", "Large"]
  }
}

// Generated Code
const buttonVariants = cva(..., {
  variants: {
    Type: {
      Primary: "bg-primary...",
      Secondary: "bg-secondary..."
    },
    Size: {
      Small: "px-3 text-xs",
      Large: "px-8 text-base"
    }
  }
})

// Usage
<Button Type="Primary" Size="Large">Click</Button>
```

**Problems:**
- ❌ Incompatible with v0, Claude Artifacts, shadcn/ui
- ❌ Doesn't work with existing shadcn/ui components
- ❌ Non-standard naming convention
- ❌ Breaks copy/paste from AI generators

---

### ✅ New Pattern (shadcn/ui, lowercase)

```typescript
// AI Extraction
{
  "variants": {
    "variant": ["default", "secondary", "ghost", "outline"],
    "size": ["default", "sm", "lg"]
  }
}

// Generated Code
const buttonVariants = cva(..., {
  variants: {
    variant: {
      default: "bg-primary...",
      secondary: "bg-secondary...",
      ghost: "hover:bg-accent...",
      outline: "border border-input..."
    },
    size: {
      default: "h-10 px-4 py-2",
      sm: "h-9 px-3",
      lg: "h-11 px-8"
    }
  }
})

// Usage
<Button variant="default" size="lg">Click</Button>
```

**Benefits:**
- ✅ Compatible with v0, Claude Artifacts, and all AI generators
- ✅ Works with shadcn/ui components out of the box
- ✅ Industry standard naming
- ✅ Copy/paste from AI tools works perfectly
- ✅ Supports @radix-ui/react-slot for composition
- ✅ Includes `asChild` prop for flexibility

---

## 🔧 What Was Updated

### 1. **AI Extraction** (`/api/ai/extract-spec`)
```typescript
// Now extracts lowercase variants
{
  "variants": {
    "variant": ["default", "secondary", "ghost"],
    "size": ["default", "sm", "lg"]
  }
}
```

### 2. **AI Generation** (`lib/ai-prompts.ts`)
```typescript
// Now generates shadcn/ui pattern with:
- Lowercase variant names: variant, size, icon, state
- Lowercase variant values: default, primary, sm, lg
- Slot support from @radix-ui/react-slot
- asChild prop for composition
```

### 3. **Component Preview** (`/docs/components/[slug]`)
```typescript
// Handles BOTH formats for backward compatibility
component.variants.variant || component.variants.Type  // ✅ Works with old and new
component.variants.size || component.variants.Size      // ✅ Works with old and new
```

---

## 🎨 Standard Variant Names

### Common variant names:
| Variant Name | Usage | Values |
|--------------|-------|--------|
| `variant` | Component style/type | `default`, `secondary`, `ghost`, `outline`, `destructive`, `link` |
| `size` | Component size | `default`, `sm`, `lg`, `xl`, `icon` |
| `state` | Component state | `enabled`, `hover`, `disabled`, `focused`, `pressed` |
| `icon` | Icon position | `left`, `right`, `none` |

### Standard variant values:
- **variant**: `default`, `primary`, `secondary`, `ghost`, `outline`, `destructive`, `link`
- **size**: `default`, `sm`, `lg`, `xl`, `icon`
- **Other**: Always lowercase, no spaces

---

## 🔄 Backward Compatibility

**Old components still work!** The preview system handles both formats:

```typescript
// Old format (PascalCase) ✅ Still works
<Button Type="Primary" Size="Large">

// New format (lowercase) ✅ Also works
<Button variant="default" size="lg">
```

**Existing components will:**
- ✅ Still render correctly in preview
- ✅ Show variants in both old and new format
- ✅ Work in admin panel
- ✅ Not break any existing functionality

---

## 🚀 Migration Path

### For New Components:
1. Upload spec sheet as usual
2. AI automatically extracts **lowercase variants**
3. Generated code follows **shadcn/ui pattern**
4. Copy/paste works with v0, Claude, etc.

### For Existing Components:
1. Old components work as-is (no migration needed)
2. Preview handles both formats automatically
3. Optional: Regenerate with new spec for shadcn/ui format

---

## 💡 Example: Button Component

### Spec Sheet Upload:
```
┌────────────────────────────┐
│ Variant: Default, Secondary│
│ Variant: Ghost, Outline    │
│ Size: sm, default, lg      │
└────────────────────────────┘
```

### AI Extracts:
```json
{
  "name": "Button",
  "variants": {
    "variant": ["default", "secondary", "ghost", "outline"],
    "size": ["sm", "default", "lg"]
  }
}
```

### Generated Code:
```typescript
"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors",
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

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
```

### Usage:
```typescript
// In your app
<Button variant="default" size="lg">Click me</Button>
<Button variant="secondary" size="sm">Small</Button>
<Button variant="ghost">Ghost Button</Button>

// With asChild for composition
<Button asChild>
  <a href="/login">Login</a>
</Button>
```

### Works with AI Generators:
```bash
# In v0.dev or Claude
"Create a button with variant='outline' and size='lg'"

# Output matches our components exactly! ✨
```

---

## ✅ Why This Matters

1. **AI Compatibility**: v0, Claude, Copilot all use this exact pattern
2. **Copy/Paste Works**: Code from AI tools drops right in
3. **Community Standard**: shadcn/ui has 70k+ GitHub stars
4. **Better DX**: Lowercase is easier to type, more intuitive
5. **Composition**: `asChild` prop enables advanced patterns
6. **Future-Proof**: Industry standard, widely adopted

---

## 📦 Required Dependency

Make sure `@radix-ui/react-slot` is installed:

```bash
npm install @radix-ui/react-slot
```

This enables the `asChild` composition pattern used by shadcn/ui.

---

## 🎯 Next Steps

1. ✅ **New components automatically use shadcn/ui pattern**
2. ✅ **Old components still work (backward compatible)**
3. ✅ **Preview handles both formats**
4. 🔄 **Optional: Regenerate old components for consistency**

**Result:** Your design system now speaks the same language as v0, Claude, and the entire AI ecosystem! 🚀

