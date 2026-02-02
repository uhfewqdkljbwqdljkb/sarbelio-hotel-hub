-- Remove the overly permissive staff SELECT policy on suppliers
-- Only admins should be able to view supplier contact information
DROP POLICY IF EXISTS "Staff can view suppliers" ON public.suppliers;