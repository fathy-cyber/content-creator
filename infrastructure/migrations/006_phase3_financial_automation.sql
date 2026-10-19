-- infrastructure/migrations/006_phase3_financial_automation.sql
-- Phase 3: Financial Automation & CRM Sync

BEGIN;

-- 1. Create Enums for Payment Status
DO $$ BEGIN
    CREATE TYPE order_payment_status AS ENUM ('pending', 'partial', 'paid', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE project_payment_status AS ENUM ('not_started', 'pending', 'partial', 'paid', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Extend Sales Orders
ALTER TABLE sales_orders
  ADD COLUMN IF NOT EXISTS payment_status order_payment_status DEFAULT 'pending';

-- 3. Extend Projects
ALTER TABLE project_projects
  ADD COLUMN IF NOT EXISTS payment_status project_payment_status DEFAULT 'not_started';

-- 4. Extend CRM Contacts (Clients)
ALTER TABLE crm_contacts
  ADD COLUMN IF NOT EXISTS has_overdue_invoices BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS overdue_amount NUMERIC(12,3) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS oldest_overdue_days INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_revenue NUMERIC(12,3) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_payment_date DATE,
  ADD COLUMN IF NOT EXISTS payment_count INTEGER DEFAULT 0;

-- 5. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_crm_contacts_financial_metrics ON crm_contacts(has_overdue_invoices, overdue_amount);
CREATE INDEX IF NOT EXISTS idx_sales_orders_payment_status ON sales_orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_project_projects_payment_status ON project_projects(payment_status);

-- 6. RPC Functions for Financial Sync

-- Update client revenue and payment count
CREATE OR REPLACE FUNCTION update_client_financials(
  p_client_id BIGINT,
  p_amount NUMERIC,
  p_payment_date DATE
)
RETURNS VOID AS $$
BEGIN
  UPDATE crm_contacts
  SET 
    total_revenue = total_revenue + p_amount,
    payment_count = payment_count + 1,
    last_payment_date = p_payment_date
  WHERE id = p_client_id;
END;
$$ LANGUAGE plpgsql;

-- Update client aging metrics
CREATE OR REPLACE FUNCTION update_client_aging(
  p_client_id BIGINT,
  p_overdue_amount NUMERIC,
  p_oldest_days INTEGER,
  p_has_overdue BOOLEAN
)
RETURNS VOID AS $$
BEGIN
  UPDATE crm_contacts
  SET 
    overdue_amount = p_overdue_amount,
    oldest_overdue_days = p_oldest_days,
    has_overdue_invoices = p_has_overdue
  WHERE id = p_client_id;
END;
$$ LANGUAGE plpgsql;

COMMIT;
