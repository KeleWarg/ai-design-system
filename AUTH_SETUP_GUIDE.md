# Supabase Authentication & RBAC Setup Guide

This guide will help you set up the Supabase authentication system with role-based access control (Admin and Editor roles).

## Step 1: Run Database Migration

1. Open your Supabase project dashboard
2. Navigate to **SQL Editor** in the left sidebar
3. Click **"New Query"**
4. Copy the entire contents of `database/schema.sql` from this project
5. Paste it into the SQL Editor
6. Click **"Run"** to execute the migration

This will create:
- `users` table with role enum
- Updated RLS policies for role-based permissions
- Automatic trigger to create user records on signup

## Step 2: Create Admin User

### Option A: First User Becomes Admin (Recommended)

The system is configured so that the **first user to sign up automatically becomes an admin**. All subsequent users will be editors.

1. Go to your Supabase dashboard
2. Navigate to **Authentication** > **Users**
3. Click **"Add user"** > **"Create new user"**
4. Enter your admin email and password
5. **Uncheck** "Auto Confirm User" if you want to confirm via email
6. Click **"Create user"**

This first user will automatically be assigned the **admin** role.

### Option B: Manually Set Admin Role

If you've already created users, you can manually set someone as admin:

1. In Supabase dashboard, go to **SQL Editor**
2. Run this query (replace with actual email):
   ```sql
   UPDATE users 
   SET role = 'admin' 
   WHERE email = 'your-admin@example.com';
   ```

## Step 3: Create Editor User (Optional)

To create additional users with editor permissions:

1. Go to **Authentication** > **Users**
2. Click **"Add user"** > **"Create new user"**
3. Enter the editor's email and password
4. Click **"Create user"**

This user will automatically have the **editor** role (can create/update but not delete).

## Step 4: Test the Authentication

### Local Testing

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to `http://localhost:3001/admin/login`

3. **Test Admin User**:
   - Log in with your admin credentials
   - Verify you can see the **👑 Admin** badge in the sidebar
   - Verify you can see **Delete** buttons on themes and components

4. **Test Editor User** (if created):
   - Log out
   - Log in with editor credentials
   - Verify you see the **✏️ Editor** badge
   - Verify **Delete** buttons are hidden
   - Try to delete via API (should get 403 Forbidden error)

## Step 5: Verify RLS Policies

Test that the database-level security is working:

1. In Supabase SQL Editor, run:
   ```sql
   -- Check users table
   SELECT * FROM users;
   
   -- Check RLS policies
   SELECT schemaname, tablename, policyname 
   FROM pg_policies 
   WHERE schemaname = 'public';
   ```

2. Verify you see policies like:
   - "Only admins can delete themes"
   - "Only admins can delete components"
   - "Authenticated users can insert/update"

## Permissions Summary

### Admin Role (👑)
- ✅ Create themes and components
- ✅ Update themes and components
- ✅ Delete themes and components
- ✅ Set active theme
- ✅ Full access to all features

### Editor Role (✏️)
- ✅ Create themes and components
- ✅ Update themes and components
- ❌ Delete themes and components
- ✅ Set active theme
- ✅ View all content

## Security Features

### Database Level (RLS Policies)
- **Enforced at database**: Even if someone bypasses the UI, they can't delete without admin role
- **Automatic**: No code changes needed, policies enforce rules

### Application Level
- **Middleware**: Checks authentication before accessing admin routes
- **API Routes**: Verify admin role before allowing deletions
- **UI**: Conditionally shows/hides features based on permissions

### Session Management
- **HTTP-only cookies**: Prevent XSS attacks
- **Server-side verification**: Sessions validated on server
- **Auto-refresh**: Tokens refresh automatically

## Troubleshooting

### "Authentication required" error
- Make sure you're logged in
- Check that `.env.local` has correct Supabase credentials
- Restart your dev server

### "Only admins can delete" error
- Verify user's role in Supabase dashboard
- Check users table: `SELECT * FROM users;`
- Ensure RLS policies are applied

### User not created in users table
- Check if trigger is created: Look for `handle_new_user()` function
- Manually insert: 
  ```sql
  INSERT INTO users (id, email, role)
  VALUES ('user-uuid', 'email@example.com', 'admin');
  ```

### Delete buttons showing when they shouldn't
- Clear browser cache
- Check `usePermissions()` hook is properly fetching user role
- Verify you're logged in as the correct user

## Next Steps

1. **Push to Production**:
   - Commit and push changes to GitHub
   - Deploy to Vercel
   - Verify environment variables are set in Vercel

2. **Configure Email**:
   - Set up email templates in Supabase dashboard
   - Enable email confirmations
   - Customize email branding

3. **Add More Users**:
   - Create accounts for your team
   - Assign appropriate roles
   - Set up password reset flows

## Support

If you encounter issues:
1. Check Supabase logs in dashboard
2. Check browser console for errors
3. Verify RLS policies are enabled
4. Check server logs for API errors

---

**Remember**: The first user automatically becomes admin. All subsequent users are editors by default.

