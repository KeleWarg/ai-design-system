# Design System CMS

An AI-powered, full-stack CMS for managing design systems with dynamic themes and components, built with Next.js, Supabase, and Claude 4.5 Sonnet.

## ✨ Features

- 🎨 **Dynamic Theme Management** - Create and manage themes with real-time CSS variable updates
- 🤖 **AI-Assisted Component Generation** - Generate component code, documentation, and usage prompts with Claude 4.5 Sonnet
- 🔐 **Simple Authentication** - Password-protected admin panel
- 💾 **Supabase Backend** - PostgreSQL database with real-time subscriptions
- 🎯 **Type-Safe** - Full TypeScript support
- 🚀 **Real-time Updates** - Changes sync instantly across all clients
- 📝 **Monaco Code Editor** - Professional code editing experience
- 🎭 **Variant System** - Class-variance-authority for consistent component variants
- 🌐 **Public REST API** - HTTP endpoints for external access to components and themes
- 🔌 **MCP Integration** - Model Context Protocol support for AI coding assistants (Claude Desktop, Cursor)

## 🚀 Quick Start

### 1. Prerequisites

- Node.js 18+ and npm
- Supabase account ([create one free](https://supabase.com))
- Anthropic API key ([get one here](https://console.anthropic.com/settings/keys))

### 2. Supabase Setup

1. Create a new project on [Supabase](https://supabase.com)
2. Go to **SQL Editor** in your Supabase dashboard
3. Copy and run the SQL from `database/schema.sql`
4. Get your credentials:
   - Project URL: Settings → API → Project URL
   - Anon Key: Settings → API → Project API keys → anon public
   - Service Role Key: Settings → API → Project API keys → service_role (keep this secret!)

### 3. Environment Setup

Create a `.env.local` file in the `docs` directory:

\`\`\`env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Admin
ADMIN_PASSWORD=your-secure-password

# Anthropic (Claude API)
ANTHROPIC_API_KEY=your-anthropic-api-key
\`\`\`

### 4. Install Dependencies

\`\`\`bash
cd docs
npm install
\`\`\`

### 5. Seed Database (Optional)

Create sample data including themes and a button component:

\`\`\`bash
npm run seed
\`\`\`

### 6. Run Development Server

\`\`\`bash
npm run dev
\`\`\`

Visit:
- **Homepage**: http://localhost:3000
- **Admin Panel**: http://localhost:3000/admin/login
- **Components**: http://localhost:3000/docs/components

Default login: Use the password from your `.env.local` (default: `admin123`)

## 📁 Project Structure

\`\`\`
docs/
├── app/
│   ├── admin/              # Admin panel pages
│   │   ├── components/     # Component management
│   │   ├── themes/         # Theme management
│   │   ├── settings/       # Settings page
│   │   └── login/          # Login page
│   ├── api/
│   │   ├── auth/           # Authentication endpoints
│   │   ├── ai/             # AI generation endpoints
│   │   └── admin/          # Admin API routes
│   └── docs/
│       └── components/     # Public component showcase
├── components/
│   └── theme-provider.tsx  # Dynamic theme provider
├── lib/
│   ├── supabase.ts         # Supabase client & types
│   ├── auth.ts             # Authentication utilities
│   ├── utils.ts            # Utility functions
│   ├── ai-prompts.ts       # AI prompt templates
│   └── db/                 # Database operations
│       ├── themes.ts       # Theme CRUD
│       └── components.ts   # Component CRUD
├── scripts/
│   ├── migrate-to-db.ts    # Migration script
│   └── seed-database.ts    # Database seeding
└── database/
    └── schema.sql          # Database schema
\`\`\`

## 🎨 Creating Your First Theme

1. Log into the admin panel
2. Navigate to **Themes** → **Create Theme**
3. Set theme name and value (e.g., "Dark Mode", "dark")
4. Customize colors using the color picker
5. Click **Set as active theme** to apply globally
6. Save!

All components will instantly update to use the new theme colors via CSS variables.

## 🧩 Creating Components

### Manual Creation

1. Go to **Components** → **Create Component**
2. Fill in:
   - Name (e.g., "Button")
   - Description
   - Category
   - Variants (e.g., Type: Primary, Secondary, Large)
3. Write or paste component code
4. Save!

### AI-Assisted Creation

1. Fill in name, description, and variants
2. Click **Generate with AI** to create component code
3. Click **Generate Usage Prompts** for AI prompts
4. Click **Generate Documentation** for props and examples
5. Review and save!

## 🔧 Migration from Existing System

If you have existing JSON-based themes/components:

\`\`\`bash
npm run migrate -- --themes ./path/to/themes --components ./path/to/components
\`\`\`

Or create sample data:

\`\`\`bash
npm run migrate -- --samples
\`\`\`

## 🗄️ Database Schema

### Tables

- **themes** - Theme configurations with colors, typography, spacing, effects
- **components** - Component code, variants, props, documentation
- **admin_config** - Admin password hash

All tables have Row Level Security (RLS) enabled:
- Public read access for themes and components
- Write access requires service role key

## 🔐 Security Notes

1. **Change the default admin password** in production
2. Keep `SUPABASE_SERVICE_ROLE_KEY` secret (server-side only)
3. Use environment variables, never commit secrets
4. In production, implement JWT-based authentication instead of simple password

## 🤖 AI Generation

The system uses **Claude 4.5 Sonnet** (Anthropic) to generate:

1. **Component Code** - Full React component with TypeScript, CVA variants
2. **Usage Prompts** - Basic and advanced prompts for AI-assisted development
3. **Documentation** - Props, installation steps, and examples

AI follows your design system patterns:
- Class-variance-authority for variants
- CSS variables for theming
- PascalCase variant names
- Tailwind CSS classes

## 🎯 Component Patterns

All generated components follow this pattern:

\`\`\`typescript
"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../../lib/utils"

const componentVariants = cva(
  "base-classes",
  {
    variants: {
      Type: {
        Primary: "bg-primary text-primary-foreground hover:bg-primary-hover",
        Secondary: "bg-secondary text-secondary-foreground hover:bg-secondary-hover"
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

export interface ComponentProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof componentVariants> {}

const Component = React.forwardRef<HTMLElement, ComponentProps>(
  ({ className, Type, Size, ...props }, ref) => {
    return (
      <element
        ref={ref}
        className={cn(componentVariants({ Type, Size, className }))}
        {...props}
      />
    )
  }
)
Component.displayName = "Component"

export { Component, componentVariants }
\`\`\`

## 🚀 Deployment

### Vercel Deployment

1. Push your code to GitHub
2. Import to Vercel
3. Add environment variables
4. Deploy!

### Environment Variables

Ensure all environment variables are set in your deployment platform:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ADMIN_PASSWORD`
- `ANTHROPIC_API_KEY`

## 🌐 External Access & Integration

Your design system is accessible to external tools and AI assistants via **public REST API** and **MCP (Model Context Protocol)**.

### Public REST API

All components and themes are accessible via HTTP endpoints:

```bash
# List all components
GET /api/public/components

# Get specific component
GET /api/public/components/button

# Search components
GET /api/public/search?q=input

# List themes
GET /api/public/themes

# Get specific theme
GET /api/public/themes/light
```

**See [docs/API.md](docs/API.md) for full documentation.**

### MCP Integration (AI Assistants)

Connect Claude Desktop, Cursor, and other MCP-compatible AI tools to your design system:

**Available Tools:**
- `list_components` - Browse all components
- `get_component` - Get component code and docs
- `search_components` - Search by keyword
- `list_themes` - View available themes
- `get_theme` - Get theme colors

**Setup:**
```bash
# Run MCP server
npm run mcp
```

**See [docs/MCP.md](docs/MCP.md) for setup instructions.**

---

## 📚 API Routes

### Authentication
- `POST /api/auth/login` - Admin login
- `POST /api/auth/logout` - Admin logout

### AI Generation
- `POST /api/ai/generate-component` - Generate component code
- `POST /api/ai/generate-prompts` - Generate usage prompts
- `POST /api/ai/generate-docs` - Generate documentation

### Public API (External Access)
- `GET /api/public/components` - List components
- `GET /api/public/components/[slug]` - Get component
- `GET /api/public/search` - Search components
- `GET /api/public/themes` - List themes
- `GET /api/public/themes/[value]` - Get theme

### Admin
- `POST /api/admin/change-password` - Change admin password

## 🛠️ Development

### Run Development Server
\`\`\`bash
npm run dev
\`\`\`

### Build for Production
\`\`\`bash
npm run build
\`\`\`

### Run Linter
\`\`\`bash
npm run lint
\`\`\`

## 🐛 Troubleshooting

### "Missing Supabase environment variables"
- Ensure `.env.local` exists with all required variables
- Restart dev server after adding variables

### "Invalid password" on login
- Check `ADMIN_PASSWORD` in `.env.local`
- If you seeded the database, default is `admin123`

### Theme not applying
- Check browser console for errors
- Ensure theme is set as active in admin panel
- Verify Supabase real-time is enabled in your project

### AI generation fails
- Verify `ANTHROPIC_API_KEY` is valid
- Check Anthropic account has credits
- Review console for specific error messages

## 📝 License

MIT

## 🙏 Credits

Built with:
- [Next.js](https://nextjs.org)
- [Supabase](https://supabase.com)
- [Anthropic Claude](https://anthropic.com)
- [Tailwind CSS](https://tailwindcss.com)
- [class-variance-authority](https://cva.style)
- [Monaco Editor](https://microsoft.github.io/monaco-editor/)
- [Model Context Protocol](https://modelcontextprotocol.io)
