-- Project Schema
-- Defines the core project management tables and security policies

CREATE TABLE IF NOT EXISTS project_projects (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR NOT NULL,
  description TEXT ,
  manager_id VARCHAR,
  start_date DATE,
  end_date DATE,
  customer_id BIGINT,
  customer_name VARCHAR,
  sales_order_id UUID REFERENCES sales_orders(id),
  status VARCHAR DEFAULT 'active',
  progress INTEGER DEFAULT 0,
  budget NUMERIC DEFAULT 0,
  tasks_count INTEGER DEFAULT 0,
  completed_tasks_count INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS project_tasks (
  id BIGSERIAL PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES project_projects(id),
  name VARCHAR NOT NULL,
  description TEXT,
  assigned_to VARCHAR,
  deadline DATE,
  estimated_hours NUMERIC,
  actual_hours NUMERIC,
  stage VARCHAR DEFAULT 'todo',
  priority VARCHAR DEFAULT 'medium',
  quantity INTEGER DEFAULT 1,
  progress INTEGER DEFAULT 0,
  order_index INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_project_projects_status ON project_projects(status);
CREATE INDEX IF NOT EXISTS idx_project_tasks_project_id ON project_tasks(project_id);

-- RLS Policies
ALTER TABLE project_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read active projects"
ON project_projects FOR SELECT USING (active = true);

CREATE POLICY "Allow authenticated insert projects"
ON project_projects FOR INSERT WITH CHECK (auth.role() IN ('authenticated', 'anon'));

CREATE POLICY "Allow authenticated update projects"
ON project_projects FOR UPDATE USING (auth.role() IN ('authenticated', 'anon')) WITH CHECK (auth.role() IN ('authenticated', 'anon'));

CREATE POLICY "Allow authenticated delete projects"
ON project_projects FOR DELETE USING (auth.role() IN ('authenticated', 'anon'));

CREATE POLICY "Allow public read tasks of active projects"
ON project_tasks FOR SELECT USING (EXISTS (SELECT 1 FROM project_projects p WHERE p.id = project_tasks.project_id AND p.active = true));

CREATE POLICY "Allow authenticated insert tasks"
ON project_tasks FOR INSERT WITH CHECK (auth.role() IN ('authenticated', 'anon'));

CREATE POLICY "Allow authenticated update tasks"
ON project_tasks FOR UPDATE USING (auth.role() IN ('authenticated', 'anon')) WITH CHECK (auth.role() IN ('authenticated', 'anon'));

CREATE POLICY "Allow authenticated delete tasks"
ON project_tasks FOR DELETE USING (auth.role() IN ('authenticated', 'anon'));

-- Table Permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON project_projects TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON project_tasks TO anon, authenticated;
