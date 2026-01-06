-- Drop existing public policies on reservations table
DROP POLICY IF EXISTS "Allow public read" ON public.reservations;
DROP POLICY IF EXISTS "Allow public insert" ON public.reservations;
DROP POLICY IF EXISTS "Allow public update" ON public.reservations;
DROP POLICY IF EXISTS "Allow public delete" ON public.reservations;

-- Create new RLS policies that restrict access to authenticated users only
CREATE POLICY "Authenticated users can view reservations"
ON public.reservations
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can create reservations"
ON public.reservations
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update reservations"
ON public.reservations
FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete reservations"
ON public.reservations
FOR DELETE
TO authenticated
USING (true);