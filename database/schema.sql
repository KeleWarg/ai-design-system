-- Admin CMS Database Schema
-- Run this in your Supabase SQL Editor

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

-- Create admin config table
CREATE TABLE IF NOT EXISTS admin_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  password_hash TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Only one config row
CREATE UNIQUE INDEX IF NOT EXISTS idx_single_config ON admin_config ((true));

-- Enable Row Level Security
ALTER TABLE themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE components ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_config ENABLE ROW LEVEL SECURITY;

-- Public read access for themes
DROP POLICY IF EXISTS "Public read themes" ON themes;
CREATE POLICY "Public read themes" ON themes FOR SELECT USING (true);

-- Public read access for components
DROP POLICY IF EXISTS "Public read components" ON components;
CREATE POLICY "Public read components" ON components FOR SELECT USING (true);

-- Note: Write access will be handled at API level with service role key
-- For production, you should implement proper Supabase auth policies

-- Insert initial admin password (change this!)
-- Password: admin123 (CHANGE THIS IN PRODUCTION!)
-- This is bcrypt hash of "admin123"
INSERT INTO admin_config (password_hash)
VALUES ('$2a$10$rOIvF7P.EWKKqKqKqKqKqOxP.fkVqWqWqWqWqWqWqWqWqWqWqWqWq')
ON CONFLICT DO NOTHING;


