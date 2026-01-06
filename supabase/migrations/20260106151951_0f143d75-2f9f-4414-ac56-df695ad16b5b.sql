-- Drop existing permissive policies on guests table
DROP POLICY IF EXISTS "Authenticated users can view guests" ON public.guests;
DROP POLICY IF EXISTS "Authenticated users can create guests" ON public.guests;
DROP POLICY IF EXISTS "Authenticated users can update guests" ON public.guests;
DROP POLICY IF EXISTS "Authenticated users can delete guests" ON public.guests;

-- Create a helper function to check if user has any staff role
CREATE OR REPLACE FUNCTION public.is_staff(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
  )
$$;

-- Create new RLS policies that restrict access to staff members only
-- All staff can view guests
CREATE POLICY "Staff can view guests"
ON public.guests
FOR SELECT
TO authenticated
USING (public.is_staff(auth.uid()));

-- Reception and admin can create guests
CREATE POLICY "Reception and admin can create guests"
ON public.guests
FOR INSERT
TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'admin'::app_role) OR 
  public.has_role(auth.uid(), 'reception'::app_role)
);

-- Reception and admin can update guests
CREATE POLICY "Reception and admin can update guests"
ON public.guests
FOR UPDATE
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::app_role) OR 
  public.has_role(auth.uid(), 'reception'::app_role)
);

-- Only admin can delete guests
CREATE POLICY "Admin can delete guests"
ON public.guests
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));