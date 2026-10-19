-- Sales Service Functions (Security Definer)
-- This script ensures ONLY the UUID version of functions exists to avoid ambiguity

-- 1. Cleanup: Remove any overlapping functions with character varying parameters
DROP FUNCTION IF EXISTS public.create_sales_order(VARCHAR, VARCHAR, NUMERIC, TEXT, DATE, VARCHAR, VARCHAR, NUMERIC, NUMERIC, NUMERIC, VARCHAR);
DROP FUNCTION IF EXISTS public.update_sales_order(VARCHAR, VARCHAR, VARCHAR, VARCHAR, DATE, NUMERIC, NUMERIC, NUMERIC, NUMERIC, TEXT, BOOLEAN);
DROP FUNCTION IF EXISTS public.delete_sales_order(VARCHAR);
DROP FUNCTION IF EXISTS public.get_sales_order_by_id(VARCHAR);
DROP FUNCTION IF EXISTS public.create_sales_order_item(VARCHAR, VARCHAR, VARCHAR, VARCHAR, NUMERIC, NUMERIC, NUMERIC, NUMERIC, INTEGER);
DROP FUNCTION IF EXISTS public.get_sales_order_items_by_order(VARCHAR);
DROP FUNCTION IF EXISTS public.delete_sales_order_items_by_order(VARCHAR);

-- 2. Re-create UUID functions
CREATE OR REPLACE FUNCTION public.create_sales_order(
  p_id UUID DEFAULT gen_random_uuid(),
  p_user_id VARCHAR DEFAULT NULL,
  p_customer_id VARCHAR DEFAULT NULL,
  p_customer_name VARCHAR DEFAULT NULL,
  p_reference_number VARCHAR DEFAULT NULL,
  p_order_date DATE DEFAULT NULL,
  p_status VARCHAR DEFAULT 'pending',
  p_subtotal NUMERIC DEFAULT 0,
  p_tax NUMERIC DEFAULT 0,
  p_discount NUMERIC DEFAULT 0,
  p_total NUMERIC DEFAULT 0,
  p_notes TEXT DEFAULT NULL
) RETURNS sales_orders AS $$
DECLARE
  v_order sales_orders;
BEGIN
  INSERT INTO sales_orders (
    id, user_id, customer_id, customer_name, reference_number, order_date,
    status, subtotal, tax, discount, total, notes
  ) VALUES (
    p_id, p_user_id, p_customer_id, p_customer_name, p_reference_number, p_order_date,
    p_status, p_subtotal, p_tax, p_discount, p_total, p_notes
  )
  RETURNING * INTO v_order;
  RETURN v_order;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.update_sales_order(
  p_id UUID,
  p_customer_id VARCHAR DEFAULT NULL,
  p_customer_name VARCHAR DEFAULT NULL,
  p_reference_number VARCHAR DEFAULT NULL,
  p_status VARCHAR DEFAULT NULL,
  p_order_date DATE DEFAULT NULL,
  p_subtotal NUMERIC DEFAULT NULL,
  p_tax NUMERIC DEFAULT NULL,
  p_discount NUMERIC DEFAULT NULL,
  p_total NUMERIC DEFAULT NULL,
  p_notes TEXT DEFAULT NULL,
  p_active BOOLEAN DEFAULT NULL
) RETURNS sales_orders AS $$
DECLARE
  v_order sales_orders;
BEGIN
  UPDATE sales_orders SET
    customer_id = COALESCE(p_customer_id, customer_id),
    customer_name = COALESCE(p_customer_name, customer_name),
    reference_number = COALESCE(p_reference_number, reference_number),
    status = COALESCE(p_status, status),
    order_date = COALESCE(p_order_date, order_date),
    subtotal = COALESCE(p_subtotal, subtotal),
    tax = COALESCE(p_tax, tax),
    discount = COALESCE(p_discount, discount),
    total = COALESCE(p_total, total),
    notes = COALESCE(p_notes, notes),
    active = COALESCE(p_active, active),
    updated_at = NOW()
  WHERE id = p_id
  RETURNING * INTO v_order;
  RETURN v_order;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.delete_sales_order(p_id UUID) RETURNS BOOLEAN AS $$
BEGIN
  DELETE FROM sales_orders WHERE id = p_id;
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.get_sales_orders() 
RETURNS SETOF sales_orders LANGUAGE sql SECURITY DEFINER AS $$
  SELECT * FROM sales_orders ORDER BY created_at DESC;
$$;

CREATE OR REPLACE FUNCTION public.get_sales_order_by_id(p_id UUID) 
RETURNS sales_orders LANGUAGE sql SECURITY DEFINER AS $$
  SELECT * FROM sales_orders WHERE id = p_id;
$$;

CREATE OR REPLACE FUNCTION public.create_sales_order_item(
  p_order_id UUID,
  p_id UUID DEFAULT gen_random_uuid(),
  p_product_id VARCHAR DEFAULT NULL,
  p_product_name VARCHAR DEFAULT NULL,
  p_unit_price NUMERIC DEFAULT 0,
  p_quantity NUMERIC DEFAULT 0,
  p_discount NUMERIC DEFAULT 0,
  p_total NUMERIC DEFAULT 0,
  p_order_index INTEGER DEFAULT 0
)
RETURNS sales_order_items
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_item sales_order_items;
BEGIN
  INSERT INTO sales_order_items (
    order_id, id, product_id, product_name, quantity, unit_price,
    discount, total, order_index
  )
  VALUES (
    p_order_id, p_id, p_product_id, p_product_name, p_quantity,
    p_unit_price, p_discount, p_total, p_order_index
  )
  RETURNING * INTO v_item;

  RETURN v_item;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_sales_order_items_by_order(p_order_id UUID) 
RETURNS SETOF sales_order_items LANGUAGE sql SECURITY DEFINER AS $$
  SELECT * FROM sales_order_items WHERE order_id = p_order_id ORDER by order_index ASC;
$$;

CREATE OR REPLACE FUNCTION public.delete_sales_order_items_by_order(p_order_id UUID) RETURNS BOOLEAN AS $$
BEGIN
  DELETE FROM sales_order_items WHERE order_id = p_order_id;
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grants (explicit signatures)
GRANT EXECUTE ON FUNCTION public.create_sales_order(UUID, VARCHAR, VARCHAR, VARCHAR, VARCHAR, DATE, VARCHAR, NUMERIC, NUMERIC, NUMERIC, NUMERIC, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.update_sales_order(UUID, VARCHAR, VARCHAR, VARCHAR, VARCHAR, DATE, NUMERIC, NUMERIC, NUMERIC, NUMERIC, TEXT, BOOLEAN) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.delete_sales_order(UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_sales_orders() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_sales_order_by_id(UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.create_sales_order_item(UUID, UUID, VARCHAR, VARCHAR, NUMERIC, NUMERIC, NUMERIC, NUMERIC, INTEGER) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_sales_order_items_by_order(UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.delete_sales_order_items_by_order(UUID) TO anon, authenticated;
