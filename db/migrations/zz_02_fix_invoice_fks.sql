-- Fix invoice foreign key type mismatches and add customer_name support
-- Align invoice.order_id (UUID) with sales_orders.id (UUID)
-- Ensure create_invoice/update_invoice accept customer_name

-- 1) Add customer_name column if missing (safe)
ALTER TABLE IF EXISTS public.invoices
  ADD COLUMN IF NOT EXISTS customer_name VARCHAR NOT NULL DEFAULT '';

-- 2) Drop old functions with incompatible signatures
DROP FUNCTION IF EXISTS public.create_invoice(VARCHAR, BIGINT, VARCHAR, VARCHAR, VARCHAR, VARCHAR, DATE, DATE, NUMERIC, NUMERIC, NUMERIC, TEXT);
DROP FUNCTION IF EXISTS public.update_invoice(UUID, VARCHAR, BIGINT, VARCHAR, VARCHAR, VARCHAR, DATE, DATE, NUMERIC, NUMERIC, NUMERIC, NUMERIC, NUMERIC, TEXT);

-- 3) Recreate functions with corrected signatures and customer_name
CREATE OR REPLACE FUNCTION public.create_invoice(
  p_order_id UUID DEFAULT NULL,
  p_project_id BIGINT DEFAULT NULL,
  p_client_id BIGINT DEFAULT NULL,
  p_customer_name VARCHAR DEFAULT NULL,
  p_invoice_number VARCHAR DEFAULT '',
  p_type VARCHAR DEFAULT 'standard',
  p_status VARCHAR DEFAULT 'draft',
  p_issue_date DATE DEFAULT CURRENT_DATE,
  p_due_date DATE DEFAULT (CURRENT_DATE + INTERVAL '30 days'),
  p_subtotal NUMERIC DEFAULT 0,
  p_tax_amount NUMERIC DEFAULT 0,
  p_total NUMERIC DEFAULT 0,
  p_notes TEXT DEFAULT ''
) RETURNS invoices AS $$
DECLARE
  v_invoice invoices;
BEGIN
  INSERT INTO invoices (
    order_id, project_id, client_id, customer_name, invoice_number, type, status,
    issue_date, due_date, subtotal, tax_amount, total, notes,
    amount_due
  ) VALUES (
    p_order_id, p_project_id, p_client_id, COALESCE(p_customer_name, ''), p_invoice_number, p_type, p_status,
    p_issue_date, p_due_date, p_subtotal, p_tax_amount, p_total, p_notes,
    p_total
  )
  RETURNING * INTO v_invoice;
  RETURN v_invoice;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.update_invoice(
  p_id UUID,
  p_order_id UUID DEFAULT NULL,
  p_project_id BIGINT DEFAULT NULL,
  p_client_id BIGINT DEFAULT NULL,
  p_customer_name VARCHAR DEFAULT NULL,
  p_type VARCHAR DEFAULT NULL,
  p_status VARCHAR DEFAULT NULL,
  p_issue_date DATE DEFAULT NULL,
  p_due_date DATE DEFAULT NULL,
  p_subtotal NUMERIC DEFAULT NULL,
  p_tax_amount NUMERIC DEFAULT NULL,
  p_total NUMERIC DEFAULT NULL,
  p_amount_paid NUMERIC DEFAULT NULL,
  p_amount_due NUMERIC DEFAULT NULL,
  p_notes TEXT DEFAULT NULL
) RETURNS invoices AS $$
DECLARE
  v_invoice invoices;
BEGIN
  UPDATE invoices SET
    order_id = COALESCE(p_order_id, order_id),
    project_id = COALESCE(p_project_id, project_id),
    client_id = COALESCE(p_client_id, client_id),
    customer_name = COALESCE(p_customer_name, customer_name),
    type = COALESCE(p_type, type),
    status = COALESCE(p_status, status),
    issue_date = COALESCE(p_issue_date, issue_date),
    due_date = COALESCE(p_due_date, due_date),
    subtotal = COALESCE(p_subtotal, subtotal),
    tax_amount = COALESCE(p_tax_amount, tax_amount),
    total = COALESCE(p_total, total),
    amount_paid = COALESCE(p_amount_paid, amount_paid),
    amount_due = COALESCE(p_amount_due, amount_due),
    notes = COALESCE(p_notes, notes),
    updated_at = NOW()
  WHERE id = p_id
  RETURNING * INTO v_invoice;
  RETURN v_invoice;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3) Drop FK constraint if exists
ALTER TABLE IF EXISTS public.invoices
  DROP CONSTRAINT IF EXISTS invoices_order_id_fkey;

-- 4) Convert order_id to UUID
ALTER TABLE public.invoices
  ALTER COLUMN order_id TYPE UUID
  USING CASE
    WHEN order_id IS NULL THEN NULL
    WHEN order_id ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
      THEN order_id::uuid
    ELSE NULL
  END;

-- 5) Re-add FK
ALTER TABLE public.invoices
  ADD CONSTRAINT invoices_order_id_fkey
  FOREIGN KEY (order_id)
  REFERENCES public.sales_orders (id)
  ON DELETE SET NULL;

-- 6) Regrant with explicit signatures
GRANT EXECUTE ON FUNCTION public.create_invoice(UUID, BIGINT, BIGINT, VARCHAR, VARCHAR, VARCHAR, DATE, DATE, NUMERIC, NUMERIC, NUMERIC, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.update_invoice(UUID, UUID, BIGINT, BIGINT, VARCHAR, VARCHAR, VARCHAR, DATE, DATE, NUMERIC, NUMERIC, NUMERIC, NUMERIC, NUMERIC, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_invoices() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_invoice_by_id(UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_invoice_items_by_id(UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_total_outstanding_amount() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_total_paid_amount() TO anon, authenticated;

-- 7) Recreate index
DROP INDEX IF EXISTS idx_invoices_order_id;
CREATE INDEX IF NOT EXISTS idx_invoices_order_id ON invoices(order_id);
