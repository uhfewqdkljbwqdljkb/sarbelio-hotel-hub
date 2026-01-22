-- Add extra charges and discount columns to reservations
ALTER TABLE public.reservations
ADD COLUMN extra_bed_count integer NOT NULL DEFAULT 0,
ADD COLUMN extra_wood_count integer NOT NULL DEFAULT 0,
ADD COLUMN discount_amount numeric NOT NULL DEFAULT 0;

-- Add a comment for documentation
COMMENT ON COLUMN public.reservations.extra_bed_count IS 'Number of extra beds ($20 each)';
COMMENT ON COLUMN public.reservations.extra_wood_count IS 'Number of extra wood orders ($15 each)';
COMMENT ON COLUMN public.reservations.discount_amount IS 'Fixed dollar discount applied to the reservation';