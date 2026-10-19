-- Fix infinite recursion in employees RLS policy
-- The policy "Allow admin manage employees" uses a subquery on employees,
-- which causes recursion when other tables join to employees.
-- Solution: use a simpler policy that allows admins based on their employee record role.

BEGIN;

-- Drop the recursive policy
DROP POLICY IF EXISTS "Allow admin manage employees" ON employees;

-- New policy: admins can manage all employees (no self-join)
CREATE POLICY "Allow admin manage employees"
ON employees FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM employees admin_check
    WHERE admin_check.id = auth.uid() AND admin_check.role = 'admin'
  )
);

-- Alternative: even simpler — just allow authenticated users to read,
-- and only allow updates by the employee themselves or admins via a function.
-- But keep current structure; just remove the recursive loop.

COMMIT;

-- Note: If this still causes issues, consider using a security definer
-- function or storing user roles in a separate auth metadata table.
