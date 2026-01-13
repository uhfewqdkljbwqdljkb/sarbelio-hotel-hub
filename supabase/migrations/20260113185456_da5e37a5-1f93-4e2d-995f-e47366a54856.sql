-- Fix the slow permission loading caused by recursive RLS policy
-- The SELECT policy on user_roles was calling has_role() which queries user_roles again

-- Drop the problematic SELECT policy
DROP POLICY IF EXISTS "Users can view their own role" ON public.user_roles;

-- Create a simpler SELECT policy that doesn't cause recursion
-- Users can always view their own role (by user_id match)
-- Admins viewing all roles is handled separately through SECURITY DEFINER functions
CREATE POLICY "Users can view their own role"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Create an additional policy for admins to view all roles
-- This uses a direct subquery instead of the has_role function to avoid recursion
CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
  )
);