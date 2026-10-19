--Run this in the SQL editor to see the exact signatures Postgres thinks exist:

SELECT
  p.proname,
  pg_get_function_identity_arguments(p.oid) AS args,
  pg_catalog.format_type(p.prorettype, NULL) AS return_type
FROM pg_catalog.pg_proc p
JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
  AND p.proname IN ('create_invoice', 'update_invoice');

--generate GRANTs dynamically (optional)

--If you want, you can run this after you identify the signatures:


 SELECT format(
  'GRANT EXECUTE ON FUNCTION public.%I(%s) TO anon, authenticated;',
  p.proname,
  pg_get_function_identity_arguments(p.oid)
)
FROM pg_catalog.pg_proc p
JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
  AND p.proname IN ('create_invoice','update_invoice');