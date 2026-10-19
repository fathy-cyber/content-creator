-- Invoice Schema for Accounting Module
-- Ensures production-grade persistence for financial records

CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES sales_orders(id) ON DELETE SET NULL,
  project_id BIGINT REFERENCES project_projects(id) ON DELETE SET NULL,
  client_id BIGINT REFERENCES crm_contacts(id) ON DELETE SET NULL,
  customer_name VARCHAR NOT NULL,
  invoice_number VARCHAR(50) UNIQUE NOT NULL,
  type VARCHAR DEFAULT 'standard' CHECK (type IN ('standard', 'proforma', 'credit_note', 'recurring')),
  status VARCHAR DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'unpaid', 'partial', 'paid', 'overdue', 'cancelled')),
  issue_date DATE DEFAULT CURRENT_DATE,
  due_date DATE DEFAULT (CURRENT_DATE + INTERVAL '30 days'),
  subtotal NUMERIC(12,2) DEFAULT 0,
  tax_amount NUMERIC(12,2) DEFAULT 0,
  total NUMERIC(12,2) DEFAULT 0,
  amount_paid NUMERIC(12,2) DEFAULT 0,
  amount_due NUMERIC(12,2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS invoice_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity NUMERIC(12,2) DEFAULT 1,
  unit_price NUMERIC(12,2) DEFAULT 0,
  total NUMERIC(12,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_invoices_client_id ON invoices(client_id);
CREATE INDEX IF NOT EXISTS idx_invoices_order_id ON invoices(order_id);
CREATE INDEX IF NOT EXISTS idx_invoices_project_id ON invoices(project_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice_id ON invoice_items(invoice_id);

-- RLS Policies
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read invoices" ON invoices FOR SELECT USING (true);
CREATE POLICY "Allow authenticated manage invoices" ON invoices FOR ALL USING (auth.role() IN ('authenticated', 'anon'));

CREATE POLICY "Allow public read invoice items" ON invoice_items FOR SELECT USING (true);
CREATE POLICY "Allow authenticated manage invoice items" ON invoice_items FOR ALL USING (auth.role() IN ('authenticated', 'anon'));
