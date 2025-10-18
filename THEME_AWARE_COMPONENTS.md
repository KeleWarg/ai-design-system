# 🎨 Theme-Aware Component Generation

This document explains how the Admin CMS ensures all generated components use theme tokens instead of hardcoded colors.

---

## 🌟 Overview

When creating a new component from a spec sheet, the system:
1. Asks which theme to apply
2. AI extracts colors from the spec image
3. AI maps spec colors to theme tokens
4. Generated code uses CSS variables (`var(--primary)`) and Tailwind classes (`bg-primary`)
5. Components automatically adapt when themes change

---

## 🔄 Workflow

### 1. Upload Spec Sheet
```
Admin uploads PNG of Button spec showing:
- Primary button: green (#22c55e)
- Secondary button: gray (#6b7280)
- Text: white (#ffffff)
```

### 2. Select Theme
```
Available themes:
- ✅ Modern Dark (active)
- Nature Light
- Ocean Blue

Admin selects: Modern Dark
```

### 3. AI Color Mapping
```json
{
  "colorMapping": {
    "Primary Button": "primary",     // #22c55e → var(--primary)
    "Secondary Button": "secondary", // #6b7280 → var(--secondary)
    "Text Color": "foreground",      // #ffffff → var(--foreground)
    "Border": "border"               // → var(--border)
  }
}
```

### 4. Generated Code
```typescript
const buttonVariants = cva(
  "base-classes",
  {
    variants: {
      Type: {
        // ✅ Uses theme tokens, NOT hardcoded colors
        Primary: "bg-primary text-primary-foreground hover:bg-primary-hover",
        Secondary: "bg-secondary text-secondary-foreground hover:bg-secondary-hover"
      }
    }
  }
)
```

---

## 🎯 Benefits

| Before (Hardcoded) | After (Theme-Aware) |
|-------------------|---------------------|
| `bg-green-500` | `bg-primary` |
| `text-white` | `text-foreground` |
| `border-gray-300` | `border-border` |
| ❌ Fixed colors | ✅ Adapts to theme |
| ❌ Manual updates | ✅ Global changes |
| ❌ Inconsistent | ✅ Design system |

---

## 🔧 Technical Implementation

### Frontend (`app/admin/components/new/page.tsx`)
```typescript
// 1. Load themes on mount
useEffect(() => {
  const supabase = createClient()
  const { data } = await supabase.from('themes').select('*')
  setThemes(data)
  setSelectedTheme(data.find(t => t.is_active))
}, [])

// 2. Pass theme to AI
await fetch('/api/ai/extract-spec', {
  method: 'POST',
  body: formData.append('theme', JSON.stringify(selectedTheme))
})

// 3. Use color mapping in component generation
await fetch('/api/ai/generate-component', {
  method: 'POST',
  body: JSON.stringify({
    name, description, variants,
    theme: selectedTheme,
    colorMapping: extractedData.colorMapping
  })
})
```

### Backend (`app/api/ai/extract-spec/route.ts`)
```typescript
// Parse theme from request
const theme = JSON.parse(formData.get('theme'))

// Include theme context in AI prompt
const prompt = `
THEME CONTEXT (${theme.name}):
Available color tokens: primary, secondary, accent, foreground...

IMPORTANT: Map all colors you see in the spec to the closest theme token:
- Primary button color → "primary"
- Secondary bg → "secondary"
- Text → "foreground"

Return mapping in JSON: { "specColor": "themeToken" }
`
```

### AI Prompt (`lib/ai-prompts.ts`)
```typescript
export function generateComponentPrompt(spec) {
  return `
🎨 CRITICAL COLOR RULES:
- NEVER use hardcoded colors (#hex, rgb())
- ALWAYS use theme tokens: bg-primary, text-foreground
- For hover: hover:bg-primary-hover
- For disabled: disabled:opacity-50
- Follow color mapping: ${spec.colorMapping}
  `
}
```

---

## 🎨 Theme Structure

### Database Schema
```sql
CREATE TABLE themes (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  value TEXT UNIQUE,
  colors JSONB NOT NULL,  -- { primary, secondary, accent, etc. }
  typography JSONB,        -- { fontFamily, fontSize, etc. }
  spacing JSONB,           -- { xs, sm, md, lg, etc. }
  is_active BOOLEAN
);
```

### Theme Object
```typescript
{
  name: "Modern Dark",
  colors: {
    primary: "#22c55e",
    "primary-hover": "#16a34a",
    "primary-active": "#15803d",
    secondary: "#6b7280",
    foreground: "#ffffff",
    background: "#0a0a0a",
    border: "#27272a"
  },
  typography: {
    fontFamily: "Inter, sans-serif",
    fontSize: {
      xs: "0.75rem",
      sm: "0.875rem",
      base: "1rem"
    }
  },
  spacing: {
    xs: "0.25rem",
    sm: "0.5rem",
    md: "1rem"
  }
}
```

---

## 📊 Color Mapping Examples

### Button Component
```
Spec Color          → Theme Token      → CSS Variable
---------------------------------------------------
Green button        → primary          → var(--primary)
Gray button         → secondary        → var(--secondary)
White text          → foreground       → var(--foreground)
Light gray border   → border           → var(--border)
```

### Card Component
```
Spec Color          → Theme Token      → CSS Variable
---------------------------------------------------
White background    → card             → var(--card)
Black text          → card-foreground  → var(--card-foreground)
Shadow              → (use Tailwind shadow classes)
```

---

## ✅ Validation Rules

The AI enforces these rules when generating code:

1. **NO hardcoded colors**: No `#hex`, `rgb()`, or `hsl()`
2. **USE theme classes**: `bg-primary`, `text-foreground`, `border-border`
3. **INCLUDE states**: `:hover`, `:active`, `:disabled`, `:focus`
4. **FOLLOW mapping**: Use the colorMapping provided by extract-spec
5. **CONSISTENT naming**: PascalCase variants, theme token keys

---

## 🔄 Theme Switching

When a user changes the active theme:

```typescript
// 1. Update theme in database
await supabase.from('themes').update({ is_active: true }).eq('id', themeId)

// 2. CSS variables update automatically (via ThemeProvider)
document.documentElement.style.setProperty('--primary', newColor)

// 3. ALL components re-render with new colors
// No code changes needed! 🎉
```

---

## 🧪 Testing

### Manual Test:
1. Upload the Button spec sheet
2. Select "Modern Dark" theme
3. Click "Generate Component"
4. Verify generated code uses `bg-primary`, not `bg-green-500`
5. Change active theme to "Nature Light"
6. Visit `/docs/components/button`
7. Verify button colors changed to match new theme

### Expected Output:
```typescript
// ✅ GOOD - Uses theme tokens
Primary: "bg-primary text-primary-foreground hover:bg-primary-hover"

// ❌ BAD - Hardcoded colors
Primary: "bg-green-500 text-white hover:bg-green-600"
```

---

## 📝 Summary

**Before this feature:**
- Components had hardcoded colors
- Changing design system colors required manual code updates
- Inconsistent color usage across components

**After this feature:**
- All components use theme tokens
- One-click theme switching updates all components
- Enforced design system consistency
- Professional, scalable design system architecture

**Key Innovation:**
AI-powered color mapping from visual specs to semantic theme tokens! 🚀

