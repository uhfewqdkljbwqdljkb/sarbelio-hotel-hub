-- Fix 1: Add admin check to get_all_users_with_roles function
CREATE OR REPLACE FUNCTION public.get_all_users_with_roles()
RETURNS TABLE(id uuid, user_id uuid, full_name text, email text, avatar_url text, created_at timestamp with time zone, role app_role)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if calling user is admin
  IF NOT public.check_is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Only admins can view all users';
  END IF;
  
  RETURN QUERY
  SELECT 
    p.id,
    p.user_id,
    p.full_name,
    p.email,
    p.avatar_url,
    p.created_at,
    ur.role
  FROM public.profiles p
  LEFT JOIN public.user_roles ur ON ur.user_id = p.user_id
  ORDER BY p.created_at DESC;
END;
$$;

-- Fix 2: Add admin-only SELECT policy for suppliers (was accidentally removed)
CREATE POLICY "Admins can view suppliers"
ON public.suppliers FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));