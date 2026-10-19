-- Supabase SQL Schema for Ayech AI Modularity

-- 1. Users table (Extending Supabase Auth)
CREATE TABLE users (
  id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  org_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own profile" ON public.users
  FOR ALL
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 2. Workspaces table
CREATE TABLE workspaces (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  owner_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners can manage their own workspaces" ON public.workspaces
  FOR ALL
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

-- 3. System Apps (Registry of available modules)
CREATE TABLE system_apps (
  id TEXT PRIMARY KEY, -- e.g., 'content-studio'
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT, -- Lucide icon name
  version TEXT DEFAULT '1.0.0',
  is_core BOOLEAN DEFAULT FALSE,
  required_tier TEXT DEFAULT 'free' CHECK (required_tier IN ('free', 'pro', 'enterprise')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. Workspace Apps (Junction table for installations)
CREATE TABLE workspace_apps (
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE NOT NULL,
  app_id TEXT REFERENCES system_apps(id) ON DELETE CASCADE NOT NULL,
  installed_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  PRIMARY KEY (workspace_id, app_id)
);

-- RLS Policies (Example)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own profile" ON users FOR SELECT USING (auth.uid() = id);

ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners can view their workspaces" ON workspaces FOR SELECT USING (auth.uid() = owner_id);

ALTER TABLE workspace_apps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Workspace members can view installed apps" ON workspace_apps 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM workspaces 
      WHERE workspaces.id = workspace_apps.workspace_id 
      AND workspaces.owner_id = auth.uid()
    )
  );

-- Initial Data
INSERT INTO system_apps (id, name, description, icon, is_core) VALUES
('core-chat', 'Ask Ayech', 'Core AI Chat assistant for business queries.', 'MessageSquare', true),
('content-studio', 'Content Studio', 'AI-powered social media post generator.', 'PenTool', false),
('business-advisory', 'Business Advisory', 'Financial planning and profit calculation tools.', 'TrendingUp', false);
