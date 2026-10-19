-- Add sales_order_id to crm_leads to link deals to sales orders
ALTER TABLE crm_leads 
ADD COLUMN IF NOT EXISTS sales_order_id UUID REFERENCES sales_orders(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_crm_leads_sales_order_id ON crm_leads(sales_order_id);
