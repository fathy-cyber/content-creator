-- Sales Schema
-- Defines the commercial agreement tables and security policies

CREATE TABLE IF NOT EXISTS sales_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR NOT NULL,
  customer_id VARCHAR DEFAULT NULL,
  customer_name VARCHAR DEFAULT NULL,
  order_date DATE DEFAULT NULL,
  notes TEXT DEFAULT NULL,
  status VARCHAR DEFAULT 'pending',
  reference_number VARCHAR DEFAULT NULL,
  subtotal NUMERIC DEFAULT 0,
  tax NUMERIC DEFAULT 0,
  discount NUMERIC DEFAULT 0,
  total NUMERIC DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sales_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES sales_orders(id) ON DELETE CASCADE,
  product_id VARCHAR DEFAULT NULL,
  product_name VARCHAR DEFAULT NULL,
  unit_price NUMERIC DEFAULT NULL,
  quantity NUMERIC DEFAULT 0,
  discount NUMERIC DEFAULT 0,
  total NUMERIC DEFAULT 0,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_sales_orders_customer ON sales_orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_sales_orders_status ON sales_orders(status);
CREATE INDEX IF NOT EXISTS idx_sales_order_items_order ON sales_order_items(order_id);

-- RLS Policies
ALTER TABLE sales_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read active sales orders"
ON sales_orders FOR SELECT USING (active = true);

CREATE POLICY "Allow authenticated manage sales orders"
ON sales_orders FOR ALL USING (auth.role() IN ('authenticated', 'anon'));

CREATE POLICY "Allow public read items of active orders"
ON sales_order_items FOR SELECT USING (EXISTS (SELECT 1 FROM sales_orders so WHERE so.id = sales_order_items.order_id AND so.active = true));

CREATE POLICY "Allow authenticated manage order items"
ON sales_order_items FOR ALL USING (auth.role() IN ('authenticated', 'anon'));

-- Table Permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON sales_orders TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON sales_order_items TO anon, authenticated;
