-- Add customer_name column to sales_orders table
-- This column is required for invoice generation and order tracking

-- Add column if it doesn't exist (idempotent)
ALTER TABLE IF EXISTS public.sales_orders
  ADD COLUMN IF NOT EXISTS customer_name VARCHAR DEFAULT NULL;

-- Optional: Backfill customer_name from existing orders if needed
-- (If you have a separate contacts table, you could join here)
-- UPDATE sales_orders so
-- SET customer_name = c.name
-- FROM crm_contacts c
-- WHERE so.customer_id = c.id::VARCHAR;
