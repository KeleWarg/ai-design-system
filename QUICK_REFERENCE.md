# Design System CMS - Quick Reference

## 🚀 Quick Start Commands

\`\`\`bash
# Install dependencies
cd docs && npm install

# Seed database with sample data
npm run seed

# Run development server
npm run dev

# Migrate existing data
npm run migrate -- --themes ./path --components ./path
\`\`\`

## 🔑 Default Access

- **URL**: http://localhost:3000/admin/login
- **Password**: Check `.env.local` → `ADMIN_PASSWORD` (default: admin123)

## 📁 Key Files

| File | Purpose |
|------|---------|
| `.env.local` | Environment variables (create this first!) |
| `database/schema.sql` | Run this in Supabase SQL Editor |
| `scripts/seed-database.ts` | Creates sample data |
| `lib/supabase.ts` | Database client & types |
| `components/theme-provider.tsx` | Theme system |

## 🎨 Admin Panel Routes

- `/admin` - Dashboard
- `/admin/themes` - Manage themes
- `/admin/themes/new` - Create theme
- `/admin/themes/[id]` - Edit theme
- `/admin/components` - Manage components
- `/admin/components/new` - Create component
- `/admin/components/[id]` - Edit component
- `/admin/settings` - Change password

## 🌐 Public Routes

- `/` - Homepage
- `/docs/components` - Component list
- `/docs/components/[slug]` - Component detail

## 🔧 Environment Variables

\`\`\`env
# Required
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx
SUPABASE_SERVICE_ROLE_KEY=eyJxxx
ADMIN_PASSWORD=your-password
OPENAI_API_KEY=sk-xxx
\`\`\`

## 📊 Database Tables

### themes
- `id` - UUID primary key
- `name` - Display name
- `value` - Unique identifier (slug)
- `colors` - JSONB color tokens
- `typography` - JSONB (optional)
- `spacing` - JSONB (optional)
- `effects` - JSONB (optional)
- `is_active` - Boolean (only one active at a time)

### components
- `id` - UUID primary key
- `name` - Component name
- `slug` - Unique identifier
- `description` - Component description
- `category` - Category (buttons, inputs, etc.)
- `code` - Component source code
- `props` - JSONB props documentation
- `variants` - JSONB variant definitions
- `prompts` - JSONB AI usage prompts
- `examples` - JSONB code examples
- `installation` - JSONB setup instructions

### admin_config
- `id` - UUID primary key
- `password_hash` - Bcrypt hash

## 🎨 Theme Colors Structure

\`\`\`typescript
{
  background: '#ffffff',
  foreground: '#000000',
  card: '#ffffff',
  'card-foreground': '#000000',
  primary: '#0070f3',
  'primary-foreground': '#ffffff',
  'primary-hover': '#0060df',
  'primary-active': '#0050c5',
  secondary: '#f4f4f5',
  'secondary-foreground': '#18181b',
  'secondary-hover': '#e4e4e7',
  'secondary-active': '#d4d4d8',
  // ... more colors
}
\`\`\`

## 🧩 Component Variant Pattern

\`\`\`typescript
const componentVariants = cva(
  "base-classes",
  {
    variants: {
      Type: {
        Primary: "bg-primary text-primary-foreground",
        Secondary: "bg-secondary text-secondary-foreground"
      },
      Size: {
        Small: "h-9 px-3",
        Base: "h-10 px-4"
      }
    },
    defaultVariants: {
      Type: "Primary",
      Size: "Base"
    }
  }
)
\`\`\`

## 🤖 AI API Endpoints

| Endpoint | Purpose | Input |
|----------|---------|-------|
| `/api/ai/generate-component` | Generate component code | name, description, variants, props |
| `/api/ai/generate-prompts` | Generate usage prompts | name, description, variants |
| `/api/ai/generate-docs` | Generate documentation | name, code, variants |

## 🔐 Auth API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/auth/login` | POST | Admin login |
| `/api/auth/logout` | POST | Admin logout |
| `/api/admin/change-password` | POST | Change admin password |

## 🎯 Component Categories

- `buttons` - Button, IconButton, ButtonGroup
- `inputs` - TextField, Checkbox, Radio, Select
- `layout` - Container, Grid, Stack, Divider
- `navigation` - Navbar, Tabs, Breadcrumbs, Menu
- `feedback` - Alert, Toast, Dialog, Progress
- `data-display` - Card, Table, List, Badge
- `overlays` - Modal, Tooltip, Popover
- `other` - Custom components

## 📝 TypeScript Types

\`\`\`typescript
type Theme = {
  id: string
  name: string
  value: string
  colors: Record<string, string>
  typography?: Record<string, any>
  spacing?: Record<string, any>
  effects?: Record<string, any>
  is_active: boolean
  created_at: string
  updated_at: string
}

type Component = {
  id: string
  name: string
  slug: string
  description: string
  category: string
  code: string
  props: Record<string, any>
  variants: Record<string, any>
  prompts: Record<string, any>
  examples: any[]
  installation: Record<string, any>
  created_at: string
  updated_at: string
}
\`\`\`

## 🐛 Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| "Missing env variables" | Create `.env.local` with all required vars |
| "Invalid password" | Check `ADMIN_PASSWORD` in `.env.local` |
| Theme not applying | Set theme as active, check console |
| AI generation fails | Verify OpenAI API key and credits |
| Monaco not loading | Check console, disable ad blocker |

## 🚀 Deployment Checklist

- [ ] Change admin password to strong password
- [ ] Set all environment variables on hosting platform
- [ ] Verify Supabase production URL and keys
- [ ] Test theme switching
- [ ] Test component creation
- [ ] Test AI generation
- [ ] Enable HTTPS only
- [ ] Review Supabase RLS policies
- [ ] Set up error monitoring
- [ ] Add analytics (optional)

## 📚 Useful Links

- **Supabase Dashboard**: https://app.supabase.com
- **OpenAI Platform**: https://platform.openai.com
- **CVA Docs**: https://cva.style
- **Tailwind CSS**: https://tailwindcss.com
- **Next.js Docs**: https://nextjs.org/docs

## 💡 Tips & Tricks

1. **Theme Preview**: Open two browser windows - one on admin panel, one on public site - to see theme changes in real-time

2. **Component Testing**: After creating a component, visit `/docs/components/[slug]` to see how it will appear to users

3. **Batch Operations**: Create multiple components at once by duplicating and modifying existing ones

4. **AI Prompts**: The more detailed your component description and variants, the better AI-generated code

5. **Color Consistency**: Use semantic color names (primary, secondary, etc.) so components automatically adapt to themes

6. **Keyboard Shortcuts**: 
   - Monaco Editor: Ctrl/Cmd + S to trigger save intent
   - Admin Panel: Use tab navigation
   
7. **Database Backups**: Regularly backup your Supabase database from the dashboard

8. **Version Control**: Commit changes regularly, especially before major updates

## 🎓 Learning Path

1. ✅ Complete setup guide
2. ✅ Create your first theme
3. ✅ Create component manually
4. ✅ Create component with AI
5. ⏭️ Build complete design system (10-20 components)
6. ⏭️ Deploy to production
7. ⏭️ Integrate with your app
8. ⏭️ Train team on usage

---

**Need help?** Check README.md or SETUP_GUIDE.md for detailed information.

