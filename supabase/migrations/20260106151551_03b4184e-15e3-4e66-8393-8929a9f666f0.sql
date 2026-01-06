-- Drop existing public policies on guests table
DROP POLICY IF EXISTS "Allow public read" ON public.guests;
DROP POLICY IF EXISTS "Allow public insert" ON public.guests;
DROP POLICY IF EXISTS "Allow public update" ON public.guests;
DROP POLICY IF EXISTS "Allow public delete" ON public.guests;

-- Create new RLS policies that restrict access to authenticated users only
-- Any authenticated staff member can view guests
CREATE POLICY "Authenticated users can view guests"
ON public.guests
FOR SELECT
TO authenticated
USING (true);

-- Any authenticated staff member can create guests
CREATE POLICY "Authenticated users can create guests"
ON public.guests
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Any authenticated staff member can update guests
CREATE POLICY "Authenticated users can update guests"
ON public.guests
FOR UPDATE
TO authenticated
USING (true);

-- Any authenticated staff member can delete guests
CREATE POLICY "Authenticated users can delete guests"
ON public.guests
FOR DELETE
TO authenticated
USING (true);