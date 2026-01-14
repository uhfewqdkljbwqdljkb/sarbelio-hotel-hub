-- Fix the infinite recursion in user_roles SELECT policies
-- The "Admins can view all roles" policy queries user_roles, causing infinite recursion

-- Drop the problematic policies
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view their own role" ON public.user_roles;

-- Create a SECURITY DEFINER function to check if user is admin without triggering RLS
CREATE OR REPLACE FUNCTION public.check_is_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = 'admin'::app_role
  );
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.check_is_admin(uuid) TO authenticated;

-- Create new policies that don't cause recursion
-- Users can always view their own role
CREATE POLICY "Users can view their own role"
ON public.user_roles FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Admins can view all roles (using SECURITY DEFINER function to avoid recursion)
CREATE POLICY "Admins can view all roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (public.check_is_admin(auth.uid()));