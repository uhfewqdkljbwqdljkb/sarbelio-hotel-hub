-- Drop the existing restrictive INSERT policy on user_roles
DROP POLICY IF EXISTS "Admins can insert roles" ON public.user_roles;

-- Create a more permissive INSERT policy that allows admins to insert roles
-- Using SECURITY DEFINER function to check admin status
CREATE POLICY "Admins can insert roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Also update profiles insert policy to be more permissive for admins
DROP POLICY IF EXISTS "Admins can insert profiles" ON public.profiles;

CREATE POLICY "Admins can insert profiles"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (
  (auth.uid() = user_id) OR has_role(auth.uid(), 'admin'::app_role)
);