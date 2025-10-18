# 🎨 Component Creation Guide

## How to Create Components (No Upload Needed!)

You **fill out a form** in the admin panel - no file upload required! Here's exactly what you'll see:

---

## 📋 The Component Creation Form

When you go to **`/admin/components/new`**, you'll see this interface:

### **Section 1: Basic Information**

```
┌─────────────────────────────────────────────────────────┐
│ Basic Information                                        │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ Component Name *                  Slug *                 │
│ ┌─────────────────────┐          ┌─────────────────┐    │
│ │ Button              │          │ button          │    │
│ └─────────────────────┘          └─────────────────┘    │
│                                                          │
│ Description *                                            │
│ ┌───────────────────────────────────────────────────┐   │
│ │ A clickable button component with variants       │   │
│ │ for different styles and sizes                   │   │
│ └───────────────────────────────────────────────────┘   │
│                                                          │
│ Category *                                               │
│ ┌───────────────────────────────────────────────────┐   │
│ │ buttons ▼                                         │   │
│ └───────────────────────────────────────────────────┘   │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

### **Section 2: Variants (Appearance Options)**

```
┌─────────────────────────────────────────────────────────┐
│ Variants                                                 │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ Add variants to define different styles:                │
│                                                          │
│ Variant Key             Values (comma-separated)        │
│ ┌────────────┐         ┌────────────────────────┐       │
│ │ Type       │         │ Primary, Secondary     │ [Add] │
│ └────────────┘         └────────────────────────┘       │
│                                                          │
│ Added Variants:                                          │
│ ┌───────────────────────────────────────────[Remove]┐   │
│ │ Type: Primary, Secondary, Outlined             │   │
│ └────────────────────────────────────────────────────┘   │
│ ┌───────────────────────────────────────────[Remove]┐   │
│ │ Size: Small, Base, Large                       │   │
│ └────────────────────────────────────────────────────┘   │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

**How to add variants:**
1. Type variant name in "Variant Key" (e.g., `Type`, `Size`, `Shadow`)
2. Type values in second field, separated by commas (e.g., `Primary, Secondary, Outlined`)
3. Click **Add**
4. Repeat for each variant you want

---

### **Section 3: Component Code** (AI Generated!)

```
┌─────────────────────────────────────────────────────────┐
│ Component Code                    [🤖 Generate with AI] │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  1  "use client"                                        │
│  2                                                      │
│  3  import * as React from "react"                     │
│  4  import { cva, type VariantProps } from "class-...  │
│  5  import { cn } from "../../lib/utils"               │
│  6                                                      │
│  7  const buttonVariants = cva(                        │
│  8    "inline-flex items-center justify-center...",   │
│  9    {                                                │
│ 10      variants: {                                    │
│ 11        Type: {                                      │
│ 12          Primary: "bg-primary text-primary-...",   │
│ 13          Secondary: "bg-secondary text-...",       │
│ 14        },                                           │
│                                                          │
│ [Monaco Code Editor - Full TypeScript support]          │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

**What happens when you click "🤖 Generate with AI":**
- Takes your component name, description, and variants
- Sends to Claude AI
- Returns complete TypeScript/React code
- Code appears in the Monaco editor
- You can edit it manually if needed!

---

### **Section 4: AI Generation** (Extra Magic!)

```
┌─────────────────────────────────────────────────────────┐
│ AI Generation                                            │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ [Generate Usage Prompts]  [Generate Documentation]      │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

**Additional AI features:**

| Button | What It Does |
|--------|--------------|
| **Generate Usage Prompts** | Creates prompts for OTHER AI tools to use your component |
| **Generate Documentation** | Extracts props, creates examples, installation steps |

---

## 🎯 Step-by-Step Workflow

### **Step 1: Fill Out Basic Info** ✏️

```
Name: Card
Description: A container for content with optional header and footer
Category: layout
```

### **Step 2: Add Variants** 🎨

```
Type: Primary, Secondary, Outlined
Size: Small, Base, Large
Shadow: None, Small, Medium, Large
```

### **Step 3: Generate Code** 🤖

Click **"🤖 Generate with AI"** → Complete component code appears in editor!

### **Step 4: (Optional) Generate Extras** 📚

- Click **"Generate Usage Prompts"** → AI creates prompt examples
- Click **"Generate Documentation"** → AI extracts props and creates docs

### **Step 5: Save** 💾

Click **"Create Component"** at the bottom → Saved to database!

---

## 📝 Example: Creating a Badge Component

Let's walk through creating a Badge component:

### **1. Basic Information**
```
Name: Badge
Description: Small label for status indicators, counts, and categories
Category: data-display
```

### **2. Add Variants**

**Variant 1:**
```
Key: Type
Values: success, warning, error, info, neutral
```

**Variant 2:**
```
Key: Size
Values: sm, md, lg
```

**Variant 3:**
```
Key: Shape
Values: rounded, pill, square
```

After adding, you'll see:
```
✓ Type: success, warning, error, info, neutral
✓ Size: sm, md, lg
✓ Shape: rounded, pill, square
```

### **3. Generate Code**

Click **"🤖 Generate with AI"** 

AI generates:
```typescript
"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../../lib/utils"

const badgeVariants = cva(
  "inline-flex items-center font-medium transition-colors",
  {
    variants: {
      Type: {
        success: "bg-green-100 text-green-800 border-green-200",
        warning: "bg-yellow-100 text-yellow-800 border-yellow-200",
        error: "bg-red-100 text-red-800 border-red-200",
        info: "bg-blue-100 text-blue-800 border-blue-200",
        neutral: "bg-gray-100 text-gray-800 border-gray-200"
      },
      Size: {
        sm: "px-2 py-0.5 text-xs",
        md: "px-2.5 py-1 text-sm",
        lg: "px-3 py-1.5 text-base"
      },
      Shape: {
        rounded: "rounded",
        pill: "rounded-full",
        square: "rounded-none"
      }
    },
    defaultVariants: {
      Type: "neutral",
      Size: "md",
      Shape: "rounded"
    }
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, Type, Size, Shape, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(badgeVariants({ Type, Size, Shape, className }))}
        {...props}
      />
    )
  }
)
Badge.displayName = "Badge"

export { Badge, badgeVariants }
```

### **4. Review & Edit**

- Code appears in Monaco editor
- You can manually edit anything
- Syntax highlighting and IntelliSense work!

### **5. Generate Extras** (Optional)

**Click "Generate Usage Prompts":**
```json
{
  "basic": [
    "Give me a Badge",
    "Create a success badge",
    "Make an error badge with large size"
  ],
  "advanced": [
    "Create a warning badge with pill shape for notification count",
    "Make a small success badge with rounded corners for status indicator"
  ],
  "useCases": [...]
}
```

**Click "Generate Documentation":**
```json
{
  "api": {
    "props": [
      {
        "name": "Type",
        "type": "'success' | 'warning' | 'error' | 'info' | 'neutral'",
        "default": "neutral",
        "description": "Visual style of the badge"
      },
      // ... more props
    ]
  },
  "installation": {...},
  "examples": [...]
}
```

### **6. Save**

Click **"Create Component"** → Done! ✅

---

## 🎬 What You'll Actually See

When you visit `/admin/components/new`, you'll see:

1. **Top**: "Create Component" heading
2. **Section 1**: Text inputs for Name, Slug, Description, Category dropdown
3. **Section 2**: Variant builder (add/remove variants)
4. **Section 3**: Monaco code editor with AI generate button
5. **Section 4**: Buttons for generating prompts and docs
6. **Bottom**: "Create Component" button to save

---

## 💡 Tips

- **Start simple**: Create a basic button first to understand the flow
- **Use AI generation**: Let Claude write the code, you just define the spec!
- **Edit freely**: The Monaco editor lets you tweak the generated code
- **Test locally**: Use the seed script to create sample components first
- **Variants are optional**: You can create components without variants

---

## 🚀 Quick Start

1. Go to: `http://localhost:3000/admin/components/new`
2. Fill in: Name, Description, Category
3. Add variants: Type, Size, etc.
4. Click: "🤖 Generate with AI"
5. Review: Check the generated code
6. Save: Click "Create Component"

**That's it! No file upload needed - everything is done in the browser!** 🎉

---

## ❓ Common Questions

**Q: Can I upload a JSON file instead?**
A: No, but you could manually paste JSON data into the code editor if you have existing component definitions.

**Q: Can I skip the AI generation?**
A: Yes! You can manually type/paste code in the Monaco editor.

**Q: Do I need to define all variants upfront?**
A: No, you can add them one at a time or edit the component later.

**Q: What if AI generates bad code?**
A: Just edit it in the Monaco editor! You have full control.

---

**Ready to create your first component?** 🎨

