-- Invoice Service Functions (Security Definer)

-- Drop old functions with incompatible signatures before recreating

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

CREATE OR REPLACE FUNCTION public.get_invoices() 
RETURNS SETOF invoices 
LANGUAGE sql SECURITY DEFINER AS $$
  SELECT * FROM invoices ORDER BY created_at DESC;
$$;

CREATE OR REPLACE FUNCTION public.get_invoice_by_id(p_id UUID) 
RETURNS invoices 
LANGUAGE sql SECURITY DEFINER AS $$
  SELECT * FROM invoices WHERE id = p_id;
$$;

CREATE OR REPLACE FUNCTION public.get_invoice_items_by_id(p_invoice_id UUID) 
RETURNS SETOF invoice_items 
LANGUAGE sql SECURITY DEFINER AS $$
  SELECT * FROM invoice_items WHERE invoice_id = p_invoice_id ORDER BY created_at ASC;
$$;

CREATE OR REPLACE FUNCTION public.get_total_outstanding_amount() 
RETURNS NUMERIC 
LANGUAGE sql SECURITY DEFINER AS $$
  SELECT COALESCE(SUM(amount_due), 0) FROM invoices WHERE status != 'paid' AND status != 'cancelled';
$$;

CREATE OR REPLACE FUNCTION public.get_total_paid_amount() 
RETURNS NUMERIC 
LANGUAGE sql SECURITY DEFINER AS $$
  SELECT COALESCE(SUM(amount_paid), 0) FROM invoices;
$$;

-- Grants (explicit signatures)
GRANT EXECUTE ON FUNCTION public.create_invoice(UUID, BIGINT, BIGINT, VARCHAR, VARCHAR, VARCHAR, VARCHAR, DATE, DATE, NUMERIC, NUMERIC, NUMERIC, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.update_invoice(UUID, UUID, BIGINT, BIGINT, VARCHAR, VARCHAR, VARCHAR, DATE, DATE, NUMERIC, NUMERIC, NUMERIC, NUMERIC, NUMERIC, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_invoices() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_invoice_by_id(UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_invoice_items_by_id(UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_total_outstanding_amount() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_total_paid_amount() TO anon, authenticated;
