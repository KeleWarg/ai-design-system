# Design System CMS - Complete Setup Guide

This guide will walk you through setting up the Admin CMS from scratch.

## 📋 Prerequisites Checklist

Before starting, ensure you have:
- [ ] Node.js 18+ installed
- [ ] npm or yarn package manager
- [ ] A Supabase account (free tier works)
- [ ] An OpenAI API key
- [ ] A code editor (VS Code recommended)

## Step 1: Supabase Project Setup

### 1.1 Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign in or create an account
4. Click "New Project"
5. Fill in:
   - **Name**: Design System CMS
   - **Database Password**: (save this!)
   - **Region**: Choose closest to you
6. Click "Create new project"
7. Wait ~2 minutes for setup

### 1.2 Run Database Migration

1. In Supabase dashboard, click **SQL Editor** (left sidebar)
2. Click **New Query**
3. Copy the entire contents of `docs/database/schema.sql`
4. Paste into the SQL editor
5. Click **Run** (or Ctrl/Cmd + Enter)
6. You should see: "Success. No rows returned"

Verify tables were created:
1. Click **Table Editor** (left sidebar)
2. You should see tables: `themes`, `components`, `admin_config`

### 1.3 Get API Credentials

1. Click **Settings** (gear icon, left sidebar)
2. Click **API** under "Project Settings"
3. Copy these values:
   - **Project URL** (under "Project URL")
   - **anon public** key (under "Project API keys")
   - **service_role** key (under "Project API keys" - click "Reveal" first)

⚠️ **IMPORTANT**: The `service_role` key is sensitive - never commit it to git!

## Step 2: OpenAI API Setup

### 2.1 Get OpenAI API Key

1. Go to [platform.openai.com](https://platform.openai.com)
2. Sign in or create an account
3. Click your profile → **View API keys**
4. Click **Create new secret key**
5. Name it "Design System CMS"
6. Copy the key (you won't see it again!)

### 2.2 Add Credits (if needed)

- New accounts may need to add payment method
- API usage is pay-as-you-go
- Component generation costs ~$0.01-0.03 per component

## Step 3: Local Project Setup

### 3.1 Navigate to Project

\`\`\`bash
cd "/Users/keleibekwe/Desktop/Design System/docs"
\`\`\`

### 3.2 Create Environment File

Create a new file: `.env.local`

\`\`\`env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Admin Authentication
ADMIN_PASSWORD=your-secure-password-here

# OpenAI API
OPENAI_API_KEY=sk-your-openai-key-here
\`\`\`

Replace the placeholder values with your actual credentials from Steps 1 & 2.

### 3.3 Install Dependencies

\`\`\`bash
npm install
\`\`\`

This will install:
- Next.js framework
- Supabase client
- OpenAI SDK
- Monaco editor
- Tailwind CSS
- And other dependencies

### 3.4 Seed Database with Sample Data

\`\`\`bash
npm run seed
\`\`\`

This creates:
- Light and Dark themes
- Sample Button component
- Admin password hash

You should see:
\`\`\`
🌱 Seeding database...
🔐 Setting admin password...
✅ Admin password set to: your-password
🎨 Creating themes...
✅ Created Light and Dark themes
🧩 Creating sample component...
✅ Created Button component
✨ Seeding complete!
\`\`\`

## Step 4: Start Development Server

\`\`\`bash
npm run dev
\`\`\`

You should see:
\`\`\`
  ▲ Next.js 15.5.6
  - Local:        http://localhost:3000
  - Ready in 2.3s
\`\`\`

## Step 5: Test the System

### 5.1 Test Homepage

1. Open browser to http://localhost:3000
2. You should see the landing page
3. Click "Admin Panel"

### 5.2 Test Admin Login

1. Go to http://localhost:3000/admin/login
2. Enter your password from `.env.local`
3. Click "Login"
4. You should see the admin dashboard

### 5.3 Test Theme Management

1. In admin panel, click **Themes** (left sidebar)
2. You should see "Light Theme" and "Dark Theme"
3. Click **Edit** on Light Theme
4. Change a color (e.g., primary)
5. Click **Save Changes**
6. The admin panel should instantly update with new color!

### 5.4 Test Component Management

1. Click **Components** (left sidebar)
2. You should see "Button" component
3. Click **Edit**
4. You should see the Monaco code editor with button code
5. Try clicking **Regenerate Usage Prompts** (requires OpenAI key)
6. You should see AI-generated prompts

### 5.5 Test Public Component Page

1. Go to http://localhost:3000/docs/components
2. You should see the Button component listed
3. Click on it
4. You should see tabs: Preview, Code, Props, Prompts

## Step 6: Create Your First Theme

### 6.1 Create New Theme

1. In admin panel, go to **Themes** → **Create Theme**
2. Fill in:
   - Name: "Ocean Blue"
   - Value: "ocean"
   - Customize colors:
     - Primary: `#0284c7` (sky blue)
     - Primary Hover: `#0369a1`
     - Background: `#f0f9ff`
     - Foreground: `#0c4a6e`
3. Check "Set as active theme"
4. Click **Create Theme**

### 6.2 Verify Theme Applied

1. The entire admin panel should now use ocean blue colors
2. Go to homepage - it should also use new theme
3. All components inherit theme via CSS variables

## Step 7: Create Your First Component with AI

### 7.1 Create New Component

1. In admin panel, go to **Components** → **Create Component**
2. Fill in:
   - Name: "Card"
   - Description: "A flexible card component for displaying content"
   - Category: "data-display"
3. Add variants:
   - Variant key: "Type"
   - Values: "Default, Elevated, Outlined"
   - Click **Add**
   - Variant key: "Padding"
   - Values: "Small, Base, Large"
   - Click **Add**

### 7.2 Generate with AI

1. Click **🤖 Generate with AI** (under Component Code)
2. Wait 5-10 seconds
3. AI will generate full React component code!
4. Click **Generate Usage Prompts**
5. AI will generate usage examples
6. Click **Generate Documentation**
7. AI will generate props and installation docs
8. Review the generated content
9. Click **Create Component**

### 7.3 View Your Component

1. Go to http://localhost:3000/docs/components
2. You should see your new Card component!
3. Click on it to see documentation

## 🎉 Success!

You now have a fully functional design system CMS!

## Next Steps

### Customize Your System

1. **Create More Themes**
   - Brand colors
   - Dark/light modes
   - Seasonal themes

2. **Add More Components**
   - Inputs (TextField, Checkbox, Select)
   - Navigation (Navbar, Tabs, Breadcrumbs)
   - Feedback (Alert, Toast, Dialog)
   - Layout (Container, Grid, Stack)

3. **Customize Theme Colors**
   - Add success/warning/info colors
   - Add gradient colors
   - Add custom CSS variables

### Production Deployment

When ready for production:

1. **Change Admin Password**
   - Go to Admin → Settings
   - Change to a strong password

2. **Deploy to Vercel**
   - Push code to GitHub
   - Import to Vercel
   - Add environment variables
   - Deploy!

3. **Enable Production Security**
   - Use strong passwords
   - Enable HTTPS only
   - Consider implementing proper JWT auth
   - Set up RLS policies in Supabase

## Common Issues

### Issue: "Missing Supabase environment variables"

**Solution:**
- Ensure `.env.local` exists in `docs` directory
- Check all three Supabase variables are set
- Restart dev server: `npm run dev`

### Issue: "Invalid password" on login

**Solution:**
- Check `ADMIN_PASSWORD` in `.env.local` matches what you're entering
- If you ran `npm run seed`, default password is shown in output
- Re-run seed: `npm run seed`

### Issue: Theme not applying

**Solution:**
- Set theme as "active" in theme list
- Check browser console for errors
- Verify Supabase real-time is enabled (Settings → API → Realtime)
- Hard refresh browser: Ctrl/Cmd + Shift + R

### Issue: AI generation fails

**Solution:**
- Verify `OPENAI_API_KEY` is correct
- Check OpenAI account has credits
- Check browser console for specific error
- Try a simpler component first

### Issue: Monaco editor not loading

**Solution:**
- Check browser console for errors
- Disable ad blockers
- Try different browser
- Clear browser cache

## Getting Help

If you run into issues:

1. Check browser console for errors
2. Check terminal for server errors
3. Review Supabase logs (Supabase dashboard → Logs)
4. Check this guide's troubleshooting section
5. Review the main README.md

## 🚀 You're Ready!

Your Design System CMS is now set up and ready to use. Start creating themes and components!


