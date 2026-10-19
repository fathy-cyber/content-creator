-- Fix infinite recursion in employees RLS
-- Create a security definer function to safely check admin role without RLS recursion

BEGIN;

-- Drop the recursive policy
DROP POLICY IF EXISTS "Allow admin manage employees" ON employees;

-- Create a security definer function to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS BOOLEAN
LANGUAGE sql SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM employees
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION public.is_current_user_admin() TO anon, authenticated;

-- New policy using the security definer function (no recursion)
CREATE POLICY "Allow admin manage employees"
ON employees FOR ALL
USING (public.is_current_user_admin());

-- Keep the read policy for all authenticated users
DROP POLICY IF EXISTS "Allow authenticated read employees" ON employees;
CREATE POLICY "Allow authenticated read employees"
ON employees FOR SELECT
USING (auth.role() IN ('authenticated', 'anon'));

COMMIT;
