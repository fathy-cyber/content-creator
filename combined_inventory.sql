
-- ==============================
-- Inventory Tables
-- ==============================

CREATE TABLE IF NOT EXISTS inventory_categories (
  id VARCHAR PRIMARY KEY,
  name VARCHAR NOT NULL,
  description TEXT,
  parent_id VARCHAR,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS inventory_products (
  id VARCHAR PRIMARY KEY,
  name VARCHAR NOT NULL,
  sku VARCHAR UNIQUE,
  category_id VARCHAR REFERENCES inventory_categories(id),
  type VARCHAR CHECK (type IN ('physical', 'service', 'digital')),
  unit VARCHAR,
  barcode VARCHAR,
  description TEXT,
  supplier_id VARCHAR,
  cost NUMERIC DEFAULT 0,
  price NUMERIC DEFAULT 0,
  tax_percent INTEGER DEFAULT 0,
  reorder_point INTEGER DEFAULT 0,
  qty_on_hand NUMERIC DEFAULT 0,
  status VARCHAR DEFAULT 'active',
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS inventory_stock_movements (
  id BIGSERIAL PRIMARY KEY,
  product_id VARCHAR NOT NULL REFERENCES inventory_products(id),
  reference_id VARCHAR,
  quantity_before INTEGER,
  quantity_change INTEGER,
  quantity_after INTEGER,
  reason TEXT,
  movement_type VARCHAR,
  order_id VARCHAR,
  created_at TIMESTAMP DEFAULT NOW()
);


-- ==============================
-- Initial Inventory Categories
-- ==============================

INSERT INTO inventory_categories (id, name, description) VALUES
  ('CAT-ELECTRONICS', 'Electronics', 'Electronic devices and accessories'),
  ('CAT-COMPUTERS', 'Computers & Laptops', 'Computers, laptops, and computing devices'),
  ('CAT-PHONES', 'Phones & Tablets', 'Mobile phones, tablets, and mobile accessories'),
  ('CAT-AUDIO', 'Audio Equipment', 'Headphones, speakers, and audio devices'),
  ('CAT-OFFICE', 'Office Supplies', 'Office furniture, stationery, and supplies'),
  ('CAT-FURNITURE', 'Furniture', 'Office and home furniture'),
  ('CAT-CLOTHING', 'Clothing & Apparel', 'Clothing, shoes, and fashion accessories'),
  ('CAT-BOOKS', 'Books & Media', 'Books, magazines, and digital media'),
  ('CAT-SPORTS', 'Sports & Recreation', 'Sports equipment and recreational items'),
  ('CAT-AUTOMOTIVE', 'Automotive', 'Car parts, accessories, and automotive supplies'),
  ('CAT-HOME', 'Home & Garden', 'Home improvement and garden supplies'),
  ('CAT-HEALTH', 'Health & Beauty', 'Health products, cosmetics, and personal care'),
  ('CAT-FOOD', 'Food & Beverages', 'Food items and beverages'),
  ('CAT-TOYS', 'Toys & Games', 'Toys, games, and entertainment products'),
  ('CAT-TOOLS', 'Tools & Hardware', 'Tools, hardware, and construction supplies')
ON CONFLICT (id) DO NOTHING;



-- ==============================
-- Inventory Product Functions
-- ==============================

CREATE OR REPLACE FUNCTION public.create_inventory_product(
  p_id VARCHAR,
  p_name VARCHAR,
  p_sku VARCHAR,
  p_category_id VARCHAR,
  p_type VARCHAR,
  p_unit VARCHAR,
  p_barcode VARCHAR,
  p_description TEXT,
  p_cost NUMERIC DEFAULT 0,
  p_price NUMERIC DEFAULT 0,
  p_tax_percent INTEGER DEFAULT 0,
  p_reorder_point INTEGER DEFAULT 0,
  p_supplier_id VARCHAR DEFAULT NULL,
  p_qty_on_hand NUMERIC DEFAULT 0,
  p_status VARCHAR DEFAULT 'active'
) RETURNS inventory_products AS $$
DECLARE
  v_product inventory_products;
BEGIN
  INSERT INTO inventory_products (
    id, name, sku, category_id, type, unit, barcode, description,
    cost, price, tax_percent, reorder_point, supplier_id, qty_on_hand, status, active
  ) VALUES (
    p_id, p_name, p_sku, p_category_id, p_type, p_unit, p_barcode, p_description,
    p_cost, p_price, p_tax_percent, p_reorder_point, p_supplier_id, p_qty_on_hand, p_status, true
  )
  RETURNING * INTO v_product;
  RETURN v_product;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.update_inventory_product(
  p_id VARCHAR,
  p_name VARCHAR DEFAULT NULL,
  p_sku VARCHAR DEFAULT NULL,
  p_category_id VARCHAR DEFAULT NULL,
  p_type VARCHAR DEFAULT NULL,
  p_unit VARCHAR DEFAULT NULL,
  p_barcode VARCHAR DEFAULT NULL,
  p_description TEXT DEFAULT NULL,
  p_cost NUMERIC DEFAULT NULL,
  p_price NUMERIC DEFAULT NULL,
  p_tax_percent INTEGER DEFAULT NULL,
  p_reorder_point INTEGER DEFAULT NULL,
  p_supplier_id VARCHAR DEFAULT NULL,
  p_qty_on_hand NUMERIC DEFAULT NULL,
  p_status VARCHAR DEFAULT NULL,
  p_active BOOLEAN DEFAULT NULL
) RETURNS inventory_products AS $$
DECLARE
  v_product inventory_products;
BEGIN
  UPDATE inventory_products SET
    name = COALESCE(p_name, name),
    sku = COALESCE(p_sku, sku),
    category_id = COALESCE(p_category_id, category_id),
    type = COALESCE(p_type, type),
    unit = COALESCE(p_unit, unit),
    barcode = COALESCE(p_barcode, barcode),
    description = COALESCE(p_description, description),
    cost = COALESCE(p_cost, cost),
    price = COALESCE(p_price, price),
    tax_percent = COALESCE(p_tax_percent, tax_percent),
    reorder_point = COALESCE(p_reorder_point, reorder_point),
    supplier_id = COALESCE(p_supplier_id, supplier_id),
    qty_on_hand = COALESCE(p_qty_on_hand, qty_on_hand),
    status = COALESCE(p_status, status),
    active = COALESCE(p_active, active),
    updated_at = NOW()
  WHERE id = p_id
  RETURNING * INTO v_product;
  RETURN v_product;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.delete_inventory_product(p_id VARCHAR) RETURNS BOOLEAN AS $$
BEGIN
  UPDATE inventory_products SET active = FALSE, updated_at = NOW() WHERE id = p_id;
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.get_inventory_products() 
RETURNS SETOF inventory_products LANGUAGE sql SECURITY DEFINER AS $$
  SELECT * FROM inventory_products WHERE active = true ORDER BY name ASC;
$$;

CREATE OR REPLACE FUNCTION public.get_inventory_product_by_id(p_id VARCHAR) 
RETURNS inventory_products LANGUAGE sql SECURITY DEFINER AS $$
  SELECT * FROM inventory_products WHERE id = p_id;
$$;

-- ==============================
-- Inventory Category Functions
-- ==============================

CREATE OR REPLACE FUNCTION public.create_inventory_category(
  p_id VARCHAR,
  p_name VARCHAR,
  p_description TEXT DEFAULT NULL,
  p_parent_id VARCHAR DEFAULT NULL
) RETURNS inventory_categories AS $$
DECLARE
  v_category inventory_categories;
BEGIN
  INSERT INTO inventory_categories (id, name, description, parent_id, active)
  VALUES (p_id, p_name, p_description, p_parent_id, true)
  RETURNING * INTO v_category;
  RETURN v_category;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.update_inventory_category(
  p_id VARCHAR,
  p_name VARCHAR DEFAULT NULL,
  p_description TEXT DEFAULT NULL,
  p_parent_id VARCHAR DEFAULT NULL,
  p_active BOOLEAN DEFAULT NULL
) RETURNS inventory_categories AS $$
DECLARE
  v_category inventory_categories;
BEGIN
  UPDATE inventory_categories SET
    name = COALESCE(p_name, name),
    description = COALESCE(p_description, description),
    parent_id = COALESCE(p_parent_id, parent_id),
    active = COALESCE(p_active, active),
    updated_at = NOW()
  WHERE id = p_id
  RETURNING * INTO v_category;
  RETURN v_category;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.get_inventory_categories() 
RETURNS SETOF inventory_categories LANGUAGE sql SECURITY DEFINER AS $$
  SELECT * FROM inventory_categories WHERE active = true ORDER BY name ASC;
$$;

CREATE OR REPLACE FUNCTION public.get_inventory_category_by_id(p_id VARCHAR) 
RETURNS inventory_categories LANGUAGE sql SECURITY DEFINER AS $$
  SELECT * FROM inventory_categories WHERE id = p_id;
$$;

-- ==============================
-- Stock Movement Functions
-- ==============================

CREATE OR REPLACE FUNCTION public.record_stock_movement(
  p_product_id VARCHAR,
  p_reference_id VARCHAR,
  p_quantity_before INTEGER,
  p_quantity_change INTEGER,
  p_quantity_after INTEGER,
  p_reason TEXT,
  p_movement_type VARCHAR,
  p_order_id VARCHAR DEFAULT NULL
) RETURNS inventory_stock_movements AS $$
DECLARE
  v_movement inventory_stock_movements;
BEGIN
  INSERT INTO inventory_stock_movements (
    product_id, reference_id, quantity_before, quantity_change,
    quantity_after, reason, movement_type, order_id
  ) VALUES (
    p_product_id, p_reference_id, p_quantity_before, p_quantity_change,
    p_quantity_after, p_reason, p_movement_type, p_order_id
  )
  RETURNING * INTO v_movement;
  RETURN v_movement;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.get_stock_movements_by_product(p_product_id VARCHAR) 
RETURNS SETOF inventory_stock_movements LANGUAGE sql SECURITY DEFINER AS $$
  SELECT * FROM inventory_stock_movements WHERE product_id = p_product_id ORDER BY created_at DESC;
$$;


-- Grant Table Permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON sales_orders TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON sales_order_items TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON inventory_products TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON inventory_categories TO anon, authenticated;
GRANT SELECT, INSERT ON inventory_stock_movements TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON project_projects TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON project_tasks TO anon, authenticated;

-- ==============================
-- Enable RLS on All Tables
-- ==============================

ALTER TABLE sales_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_tasks ENABLE ROW LEVEL SECURITY;

-- ==============================
-- RLS Policies for Sales Orders
-- ==============================

CREATE POLICY "Allow public read active sales orders"
ON sales_orders FOR SELECT USING (active = true);

CREATE POLICY "Allow authenticated insert sales orders"
ON sales_orders FOR INSERT WITH CHECK (auth.role() IN ('authenticated', 'anon'));

CREATE POLICY "Allow authenticated update sales orders"
ON sales_orders FOR UPDATE USING (auth.role() IN ('authenticated', 'anon')) WITH CHECK (auth.role() IN ('authenticated', 'anon'));

CREATE POLICY "Allow authenticated delete sales orders"
ON sales_orders FOR DELETE USING (auth.role() IN ('authenticated', 'anon'));

-- ==============================
-- RLS Policies for Sales Order Items
-- ==============================

CREATE POLICY "Allow public read items of active orders"
ON sales_order_items FOR SELECT USING (EXISTS (SELECT 1 FROM sales_orders so WHERE so.id = sales_order_items.order_id AND so.active = true));

CREATE POLICY "Allow authenticated insert order items"
ON sales_order_items FOR INSERT WITH CHECK (auth.role() IN ('authenticated', 'anon'));

CREATE POLICY "Allow authenticated update order items"
ON sales_order_items FOR UPDATE USING (auth.role() IN ('authenticated', 'anon')) WITH CHECK (auth.role() IN ('authenticated', 'anon'));

CREATE POLICY "Allow authenticated delete order items"
ON sales_order_items FOR DELETE USING (auth.role() IN ('authenticated', 'anon'));

-- ==============================
-- RLS Policies for Inventory Products
-- ==============================

CREATE POLICY "Allow public read active products"
ON inventory_products FOR SELECT USING (active = true);

CREATE POLICY "Allow authenticated insert products"
ON inventory_products FOR INSERT WITH CHECK (auth.role() IN ('authenticated', 'anon'));

CREATE POLICY "Allow authenticated update products"
ON inventory_products FOR UPDATE USING (auth.role() IN ('authenticated', 'anon')) WITH CHECK (auth.role() IN ('authenticated', 'anon'));

CREATE POLICY "Allow authenticated delete products"
ON inventory_products FOR DELETE USING (auth.role() IN ('authenticated', 'anon'));

-- ==============================
-- RLS Policies for Inventory Categories
-- ==============================

CREATE POLICY "Allow public read active categories"
ON inventory_categories FOR SELECT USING (active = true);

CREATE POLICY "Allow authenticated insert categories"
ON inventory_categories FOR INSERT WITH CHECK (auth.role() IN ('authenticated', 'anon'));

CREATE POLICY "Allow authenticated update categories"
ON inventory_categories FOR UPDATE USING (auth.role() IN ('authenticated', 'anon')) WITH CHECK (auth.role() IN ('authenticated', 'anon'));

CREATE POLICY "Allow authenticated delete categories"
ON inventory_categories FOR DELETE USING (auth.role() IN ('authenticated', 'anon'));

-- ==============================
-- RLS Policies for Stock Movements
-- ==============================

CREATE POLICY "Allow authenticated read movements"
ON inventory_stock_movements FOR SELECT USING (auth.role() IN ('authenticated', 'anon'));

CREATE POLICY "Allow authenticated record movements"
ON inventory_stock_movements FOR INSERT WITH CHECK (auth.role() IN ('authenticated', 'anon'));

-- ==============================
-- RLS Policies for Project Projects
-- ==============================

CREATE POLICY "Allow public read active projects"
ON project_projects FOR SELECT USING (active = true);

CREATE POLICY "Allow authenticated insert projects"
ON project_projects FOR INSERT WITH CHECK (auth.role() IN ('authenticated', 'anon'));

CREATE POLICY "Allow authenticated update projects"
ON project_projects FOR UPDATE USING (auth.role() IN ('authenticated', 'anon')) WITH CHECK (auth.role() IN ('authenticated', 'anon'));

CREATE POLICY "Allow authenticated delete projects"
ON project_projects FOR DELETE USING (auth.role() IN ('authenticated', 'anon'));

-- ==============================
-- RLS Policies for Project Tasks
-- ==============================

CREATE POLICY "Allow public read tasks of active projects"
ON project_tasks FOR SELECT USING (EXISTS (SELECT 1 FROM project_projects p WHERE p.id = project_tasks.project_id AND p.active = true));

CREATE POLICY "Allow authenticated insert tasks"
ON project_tasks FOR INSERT WITH CHECK (auth.role() IN ('authenticated', 'anon'));

CREATE POLICY "Allow authenticated update tasks"
ON project_tasks FOR UPDATE USING (auth.role() IN ('authenticated', 'anon')) WITH CHECK (auth.role() IN ('authenticated', 'anon'));

CREATE POLICY "Allow authenticated delete tasks"
ON project_tasks FOR DELETE USING (auth.role() IN ('authenticated', 'anon'));
