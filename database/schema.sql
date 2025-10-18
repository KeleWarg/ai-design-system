-- Admin CMS Database Schema with Supabase Auth & RBAC
-- Run this in your Supabase SQL Editor

-- Create enum for user roles
CREATE TYPE user_role AS ENUM ('admin', 'editor');

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  role user_role NOT NULL DEFAULT 'editor',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Create themes table
CREATE TABLE IF NOT EXISTS themes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  value TEXT UNIQUE NOT NULL,
  colors JSONB NOT NULL,
  typography JSONB,
  spacing JSONB,
  effects JSONB,
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Only one active theme at a time
CREATE UNIQUE INDEX IF NOT EXISTS idx_active_theme ON themes (is_active) WHERE is_active = true;

-- Create components table
CREATE TABLE IF NOT EXISTS components (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  code TEXT NOT NULL,
  props JSONB NOT NULL,
  variants JSONB NOT NULL,
  prompts JSONB NOT NULL,
  examples JSONB NOT NULL,
  installation JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_components_category ON components (category);
CREATE INDEX IF NOT EXISTS idx_components_slug ON components (slug);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE components ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Users Table
DROP POLICY IF EXISTS "Users can read their own data" ON users;
CREATE POLICY "Users can read their own data"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can read all users" ON users;
CREATE POLICY "Admins can read all users"
  ON users FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- RLS Policies for Themes Table
DROP POLICY IF EXISTS "Anyone can read themes" ON themes;
CREATE POLICY "Anyone can read themes"
  ON themes FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert themes" ON themes;
CREATE POLICY "Authenticated users can insert themes"
  ON themes FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can update themes" ON themes;
CREATE POLICY "Authenticated users can update themes"
  ON themes FOR UPDATE
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Only admins can delete themes" ON themes;
CREATE POLICY "Only admins can delete themes"
  ON themes FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- RLS Policies for Components Table
DROP POLICY IF EXISTS "Anyone can read components" ON components;
CREATE POLICY "Anyone can read components"
  ON components FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert components" ON components;
CREATE POLICY "Authenticated users can insert components"
  ON components FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can update components" ON components;
CREATE POLICY "Authenticated users can update components"
  ON components FOR UPDATE
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Only admins can delete components" ON components;
CREATE POLICY "Only admins can delete components"
  ON components FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Create trigger function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, role)
  VALUES (
    NEW.id,
    NEW.email,
    -- First user becomes admin, subsequent users are editors
    -- You can customize this logic based on email domain or other criteria
    CASE
      WHEN NOT EXISTS (SELECT 1 FROM public.users) THEN 'admin'::user_role
      ELSE 'editor'::user_role
    END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create user record on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
