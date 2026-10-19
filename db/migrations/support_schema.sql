-- Support Module Database Schema

CREATE TABLE IF NOT EXISTS support_tickets (
  id BIGSERIAL PRIMARY KEY,
  ticket_number VARCHAR(50) UNIQUE NOT NULL,
  client_id BIGINT NOT NULL REFERENCES crm_contacts(id) ON DELETE CASCADE,
  project_id BIGINT REFERENCES project_projects(id) ON DELETE SET NULL,
  subject VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  status VARCHAR(32) DEFAULT 'open' CHECK (status IN ('open', 'in-progress', 'resolved', 'closed')),
  priority VARCHAR(32) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  category VARCHAR(32) DEFAULT 'question' CHECK (category IN ('bug', 'feature', 'question', 'complaint')),
  assigned_to VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  resolved_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS support_messages (
  id BIGSERIAL PRIMARY KEY,
  ticket_id BIGINT NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
  sender_id VARCHAR(255) NOT NULL,
  sender_type VARCHAR(32) CHECK (sender_type IN ('client', 'agent', 'system')),
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_support_tickets_client ON support_tickets(client_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_project ON support_tickets(project_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_messages_ticket ON support_messages(ticket_id);

-- RLS
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read tickets" ON support_tickets FOR SELECT USING (true);
CREATE POLICY "Allow authenticated manage tickets" ON support_tickets FOR ALL USING (auth.role() IN ('authenticated', 'anon'));

CREATE POLICY "Allow public read messages" ON support_messages FOR SELECT USING (true);
CREATE POLICY "Allow authenticated manage messages" ON support_messages FOR ALL USING (auth.role() IN ('authenticated', 'anon'));
