# 👁️ Component Preview Features

This document explains how admins can preview components in the Admin CMS.

---

## 🎯 Overview

Admins can now preview components at **3 different stages**:

1. **During Creation** - See variants and code before saving
2. **While Editing** - View current component configuration
3. **From Component List** - Quick access to live preview

---

## 📍 Preview Locations

### 1. **Create Component Page** (`/admin/components/new`)

After AI generates a component, you'll see:

```
┌────────────────────────────────────────────┐
│ 🎨 Component Preview                       │
│ Live preview with [Theme Name] theme       │
├────────────────────────────────────────────┤
│                                            │
│ Detected Variants:                         │
│ ┌─────────┐  ┌─────────┐                  │
│ │  Type   │  │  Size   │                  │
│ │ Primary │  │ Small   │                  │
│ │Secondary│  │ Base    │                  │
│ │ Ghost   │  │ Large   │                  │
│ └─────────┘  └─────────┘                  │
│                                            │
│ Generated Code:                            │
│ ┌────────────────────────────────────────┐ │
│ │ "use client"                           │ │
│ │ import { cva } from "class-variance..."│ │
│ │ ...                                    │ │
│ └────────────────────────────────────────┘ │
│                                            │
│ 🎨 Theme-Aware Design:                    │
│ This component uses theme tokens           │
│ [bg-primary] [text-foreground] [...]      │
│                                            │
│ 📝 Next Steps:                            │
│ 1. Review component name and code         │
│ 2. Click "Save Component"                 │
│ 3. View live at /docs/components/button   │
│ 4. Test all variants interactively        │
└────────────────────────────────────────────┘

[💾 Save Component]
```

**What You See:**
- ✅ All extracted variants with options
- ✅ Generated component code
- ✅ Theme tokens used
- ✅ Color preview of selected theme
- ✅ Next steps guidance

---

### 2. **Edit Component Page** (`/admin/components/[id]`)

When editing an existing component:

```
┌────────────────────────────────────────────┐
│ 🎨 Component Preview                       │
│ Current component configuration            │
├────────────────────────────────────────────┤
│                                            │
│ Active Variants:                           │
│ [Shows current variant configuration]      │
│                                            │
│ 👁️ View Live Component:                   │
│ See this component rendered with all       │
│ variants on the public docs page           │
│                                            │
│ [Open Live Preview →]                      │
└────────────────────────────────────────────┘

[Save Changes] [Cancel] [👁️ Preview]
```

**What You See:**
- ✅ Current variant configuration
- ✅ Link to live preview page
- ✅ Preview button in actions bar

---

### 3. **Component List** (`/admin/components`)

Every component card now has a Preview button:

```
┌────────────────────────────────────────────┐
│ Button                                     │
│ A versatile button component...           │
│ button | 3 variant groups                 │
│                                            │
│     [👁️ Preview] [Edit] [Delete]         │
└────────────────────────────────────────────┘
```

**Quick Actions:**
- **👁️ Preview** - Opens live docs page in new tab
- **Edit** - Go to edit page
- **Delete** - Remove component (admin only)

---

## 🎨 What's Shown in Preview

### **Variant Grid**
Shows all variant groups and their options:

```
┌─────────────────────┐  ┌─────────────────────┐
│ Type                │  │ Size                │
│ • Primary           │  │ • Small             │
│ • Secondary         │  │ • Base              │
│ • Ghost             │  │ • Large             │
│ • White             │  │                     │
└─────────────────────┘  └─────────────────────┘

┌─────────────────────┐  ┌─────────────────────┐
│ Icon                │  │ State               │
│ • None              │  │ • Enabled           │
│ • Left              │  │ • Hover             │
│ • Right             │  │ • Focused           │
│                     │  │ • Pressed           │
│                     │  │ • Disabled          │
└─────────────────────┘  └─────────────────────┘
```

### **Generated Code**
Scrollable code block showing the full component:

```typescript
"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../../lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center...",
  {
    variants: {
      Type: {
        Primary: "bg-primary text-primary-foreground hover:bg-primary-hover",
        Secondary: "bg-secondary text-secondary-foreground hover:bg-secondary-hover",
        // ...
      }
    }
  }
)

export { Button, buttonVariants }
```

### **Theme Tokens**
Shows which CSS variables the component uses:

```
🎨 Theme-Aware Design:
This component uses theme tokens instead of hardcoded colors.
When you change themes, this component will automatically adapt!

[bg-primary] [text-foreground] [border-border] [hover:bg-primary-hover]
```

---

## 🔄 Live Preview Experience

When you click "Open Live Preview" or "👁️ Preview", you're taken to:

```
/docs/components/[slug]
```

This is the **public documentation page** where you'll see:

### **Interactive Preview**
- ✅ Real rendered component
- ✅ Toggle between variants
- ✅ See hover states
- ✅ Test interactions
- ✅ Applied with current active theme

### **Full Documentation**
- ✅ Installation instructions
- ✅ Usage examples
- ✅ Props API reference
- ✅ AI usage prompts
- ✅ Use case examples

---

## 💡 Why Preview is Important

### **Before Preview Feature:**
```
❌ Upload spec → Generate → Save → Hope it's correct
❌ No way to verify before saving
❌ Have to manually check code
❌ No visual confirmation of theme mapping
```

### **After Preview Feature:**
```
✅ Upload spec → Generate → Preview → Verify → Save
✅ See variants before saving
✅ Verify code is correct
✅ Confirm theme tokens are used
✅ Check if variants match spec
✅ Test live before committing
```

---

## 🎯 Preview Workflow

### **New Component Creation:**

```
1. Upload spec sheet
   ↓
2. Select theme
   ↓
3. Click "Generate Component"
   ↓
4. AI processes (~30-40 seconds)
   ↓
5. 🎨 PREVIEW APPEARS
   ├─ Variant grid (verify correctness)
   ├─ Code preview (check implementation)
   └─ Theme tokens (confirm no hardcoded colors)
   ↓
6. Review component name
   ↓
7. Click "Save Component"
   ↓
8. View live preview at /docs/components/[slug]
   ↓
9. Test all variants interactively
```

### **Editing Existing Component:**

```
1. Go to /admin/components
   ↓
2. Click "👁️ Preview" (quick check)
   OR
   Click "Edit" (detailed editing)
   ↓
3. If editing:
   ├─ Modify code/variants
   ├─ See preview at bottom
   └─ Click "👁️ Preview" button
   ↓
4. Verify changes in live preview
   ↓
5. Save if satisfied
```

---

## 📊 Preview Components

### **1. Variant Preview Cards**
```typescript
<div className="p-4 bg-muted rounded-lg">
  <p className="text-sm font-semibold">{variantName}</p>
  <div className="flex flex-wrap gap-2">
    {options.map(option => (
      <span className="px-3 py-1 bg-background border rounded">
        {option}
      </span>
    ))}
  </div>
</div>
```

**Purpose:** Show all available options for each variant group

### **2. Code Preview Block**
```typescript
<div className="bg-muted rounded-lg p-4 max-h-64 overflow-y-auto">
  <pre className="text-xs font-mono">
    <code>{generatedCode}</code>
  </pre>
</div>
```

**Purpose:** Let admin verify generated code before saving

### **3. Theme Token Badges**
```typescript
<code className="px-2 py-1 bg-background rounded text-primary">
  bg-primary
</code>
```

**Purpose:** Highlight that component uses theme tokens

### **4. Live Preview Link**
```typescript
<a
  href={`/docs/components/${slug}`}
  target="_blank"
  className="inline-flex items-center gap-2 px-4 py-2 bg-primary..."
>
  Open Live Preview →
</a>
```

**Purpose:** Quick access to interactive component testing

---

## 🧪 Testing Preview

### **Manual Test:**

1. **Go to** `/admin/components/new`
2. **Upload** your Button spec sheet
3. **Select** a theme
4. **Click** "Generate Component"
5. **Wait** for AI to finish
6. **Verify Preview Shows:**
   - ✅ Variant grid with Type, Icon, State, Size
   - ✅ Code using `bg-primary`, not `bg-green-500`
   - ✅ Theme token badges
   - ✅ Next steps guidance
7. **Click** "Save Component"
8. **Check** you're redirected to `/admin/components`
9. **Click** "👁️ Preview" button
10. **Verify** live preview opens in new tab
11. **Test** toggling variants on docs page

---

## 📝 Summary

### **Preview Locations:**
1. ✅ New component page - after generation
2. ✅ Edit component page - while editing
3. ✅ Component list - quick access

### **What's Previewed:**
1. ✅ Variant configuration (all groups & options)
2. ✅ Generated component code
3. ✅ Theme tokens used
4. ✅ Selected theme colors
5. ✅ Link to live interactive preview

### **Benefits:**
1. ✅ Verify before saving
2. ✅ Catch AI generation errors
3. ✅ Confirm theme mapping
4. ✅ Test variants live
5. ✅ Professional admin experience

### **Future Enhancements:**
- 🔮 Embedded live render (using iframe or sandboxed eval)
- 🔮 Side-by-side spec vs component comparison
- 🔮 Variant interaction simulator
- 🔮 A11y checker
- 🔮 Performance metrics

---

**Component Preview is now LIVE!** 🎉

Admins can confidently create and verify components before publishing to the docs.

