
-- Drop the broken restrictive policies on reservations
DROP POLICY IF EXISTS "Authenticated users can create reservations" ON public.reservations;
DROP POLICY IF EXISTS "Authenticated users can delete reservations" ON public.reservations;
DROP POLICY IF EXISTS "Authenticated users can update reservations" ON public.reservations;
DROP POLICY IF EXISTS "Authenticated users can view reservations" ON public.reservations;

-- Recreate as PERMISSIVE policies (the default) so staff can actually access reservations
CREATE POLICY "Staff can view reservations"
ON public.reservations FOR SELECT TO authenticated
USING (is_staff(auth.uid()));

CREATE POLICY "Staff can create reservations"
ON public.reservations FOR INSERT TO authenticated
WITH CHECK (is_staff(auth.uid()));

CREATE POLICY "Staff can update reservations"
ON public.reservations FOR UPDATE TO authenticated
USING (is_staff(auth.uid()));

CREATE POLICY "Staff can delete reservations"
ON public.reservations FOR DELETE TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));
