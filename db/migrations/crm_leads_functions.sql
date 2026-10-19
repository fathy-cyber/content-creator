-- Service Functions for CRM (Security Definer - bypass RLS)
-- These functions run with owner privileges, allowing admin operations
-- via the anon key while keeping RLS enabled for direct table access.

-- ==============================
-- CRM Contact Service Functions
-- ==============================

-- Create a contact (bypasses RLS)
CREATE OR REPLACE FUNCTION public.create_crm_contact(
  p_name VARCHAR,
  p_company VARCHAR DEFAULT NULL,
  p_job_title VARCHAR DEFAULT NULL,
  p_type VARCHAR DEFAULT 'individual',
  p_category VARCHAR DEFAULT 'prospect',
  p_email VARCHAR DEFAULT NULL,
  p_phone VARCHAR DEFAULT NULL,
  p_mobile VARCHAR DEFAULT NULL,
  p_website VARCHAR DEFAULT NULL,
  p_address TEXT DEFAULT NULL,
  p_city VARCHAR DEFAULT NULL,
  p_state VARCHAR DEFAULT NULL,
  p_country VARCHAR DEFAULT 'Tunisia',
  p_notes TEXT DEFAULT NULL,
  p_assigned_to VARCHAR DEFAULT NULL
) RETURNS crm_contacts AS $$
DECLARE
  v_contact crm_contacts;
BEGIN
  INSERT INTO crm_contacts (
    name, company, job_title, type, category,
    email, phone, mobile, website,
    address, city, state, country, notes,
    assigned_to, active
  ) VALUES (
    p_name, p_company, p_job_title, p_type, p_category,
    p_email, p_phone, p_mobile, p_website,
    p_address, p_city, p_state, p_country, p_notes,
    p_assigned_to, true
  )
  RETURNING * INTO v_contact;
  
  RETURN v_contact;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update a contact (bypasses RLS)
CREATE OR REPLACE FUNCTION public.update_crm_contact(
  p_id BIGINT,
  p_name VARCHAR DEFAULT NULL,
  p_company VARCHAR DEFAULT NULL,
  p_job_title VARCHAR DEFAULT NULL,
  p_type VARCHAR DEFAULT NULL,
  p_category VARCHAR DEFAULT NULL,
  p_email VARCHAR DEFAULT NULL,
  p_phone VARCHAR DEFAULT NULL,
  p_mobile VARCHAR DEFAULT NULL,
  p_website VARCHAR DEFAULT NULL,
  p_address TEXT DEFAULT NULL,
  p_city VARCHAR DEFAULT NULL,
  p_state VARCHAR DEFAULT NULL,
  p_country VARCHAR DEFAULT NULL,
  p_notes TEXT DEFAULT NULL,
  p_assigned_to VARCHAR DEFAULT NULL,
  p_active BOOLEAN DEFAULT NULL
) RETURNS crm_contacts AS $$
DECLARE
  v_contact crm_contacts;
BEGIN
  UPDATE crm_contacts SET
    name = COALESCE(p_name, name),
    company = COALESCE(p_company, company),
    job_title = COALESCE(p_job_title, job_title),
    type = COALESCE(p_type, type),
    category = COALESCE(p_category, category),
    email = COALESCE(p_email, email),
    phone = COALESCE(p_phone, phone),
    mobile = COALESCE(p_mobile, mobile),
    website = COALESCE(p_website, website),
    address = COALESCE(p_address, address),
    city = COALESCE(p_city, city),
    state = COALESCE(p_state, state),
    country = COALESCE(p_country, country),
    notes = COALESCE(p_notes, notes),
    assigned_to = COALESCE(p_assigned_to, assigned_to),
    active = COALESCE(p_active, active),
    updated_at = NOW()
  WHERE id = p_id
  RETURNING * INTO v_contact;
  
  RETURN v_contact;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Delete a contact (bypasses RLS)
CREATE OR REPLACE FUNCTION public.delete_crm_contact(p_id BIGINT) RETURNS BOOLEAN AS $$
BEGIN
  DELETE FROM crm_contacts WHERE id = p_id;
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get all contacts (respects RLS for SELECT, but we can also bypass if needed)
-- For now we keep using direct select; if you want to bypass RLS for reads too:
CREATE OR REPLACE FUNCTION public.get_crm_contacts() 
RETURNS SETOF crm_contacts 
LANGUAGE sql SECURITY DEFINER 
AS $$
  SELECT * FROM crm_contacts ORDER BY name ASC;
$$;

-- Get single contact by ID (RLS bypass)
CREATE OR REPLACE FUNCTION public.get_crm_contact_by_id(p_id BIGINT) 
RETURNS crm_contacts 
LANGUAGE sql SECURITY DEFINER 
AS $$
  SELECT * FROM crm_contacts WHERE id = p_id;
$$;

-- ==============================
-- Grant execute permissions to anon and authenticated roles
-- ==============================

GRANT EXECUTE ON FUNCTION public.create_crm_contact TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.update_crm_contact TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.delete_crm_contact TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_crm_contacts TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_crm_contact_by_id TO anon, authenticated;
