# AI Design System CMS

A comprehensive Content Management System for design systems, built with Next.js, Supabase, and AI-powered content generation.

## 🚀 Features

- **Theme Management**: Create, edit, and manage design system themes
- **Component Library**: Build and maintain reusable components
- **AI Integration**: Generate components, prompts, and documentation with OpenAI
- **Real-time Updates**: Live theme switching and component updates
- **Admin Dashboard**: Secure admin interface for content management
- **Public Documentation**: Auto-generated component documentation

## 🛠 Tech Stack

- **Frontend**: Next.js 15 (App Router), React, TypeScript
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **Styling**: Tailwind CSS v4, CSS Variables
- **AI**: OpenAI API for content generation
- **Editor**: Monaco Editor for code editing
- **Authentication**: Custom admin authentication

## 📁 Project Structure

```
├── docs/                    # Next.js application
│   ├── app/                # App Router pages
│   │   ├── admin/          # Admin dashboard
│   │   ├── api/            # API routes
│   │   └── docs/           # Public documentation
│   ├── components/         # React components
│   ├── lib/               # Utilities and database functions
│   ├── scripts/           # Database migration and seeding
│   └── database/          # SQL schema
├── ADMIN_CMS_PLAN.md      # Implementation plan
├── SETUP_GUIDE.md         # Setup instructions
├── QUICK_REFERENCE.md     # Quick reference
└── IMPLEMENTATION_SUMMARY.md # Project overview
```

## 🚀 Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/KeleWarg/ai-design-system.git
   cd ai-design-system
   ```

2. **Set up Supabase**
   - Create a new Supabase project
   - Copy the database schema from `docs/database/schema.sql`
   - Get your project URL and API keys

3. **Install dependencies**
   ```bash
   cd docs
   npm install
   ```

4. **Configure environment**
   ```bash
   cp .env.example .env.local
   # Add your Supabase credentials and OpenAI API key
   ```

5. **Run the application**
   ```bash
   npm run dev
   ```

## 📚 Documentation

- [Setup Guide](SETUP_GUIDE.md) - Detailed setup instructions
- [Quick Reference](QUICK_REFERENCE.md) - Common tasks and commands
- [Implementation Summary](IMPLEMENTATION_SUMMARY.md) - Project overview

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run migrate` - Run database migrations
- `npm run seed` - Seed database with sample data
- `npm run check-setup` - Verify environment setup

## 🌟 Key Features

### Admin Dashboard
- Secure authentication system
- Theme management with live preview
- Component library with code editor
- AI-assisted content generation

### Public Documentation
- Auto-generated component docs
- Live theme switching
- Responsive design
- SEO optimized

### AI Integration
- Component generation with OpenAI
- Smart prompt suggestions
- Documentation auto-generation
- Code optimization suggestions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🔗 Links

- [Live Demo](https://your-demo-url.com) (coming soon)
- [Documentation](https://your-docs-url.com) (coming soon)
- [Issues](https://github.com/KeleWarg/ai-design-system/issues)

---

Built with ❤️ using Next.js, Supabase, and OpenAI
