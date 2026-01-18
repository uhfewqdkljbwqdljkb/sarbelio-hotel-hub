-- Add day stay price to rooms
ALTER TABLE public.rooms ADD COLUMN IF NOT EXISTS day_stay_price numeric;

-- Add is_day_stay flag to reservations
ALTER TABLE public.reservations ADD COLUMN IF NOT EXISTS is_day_stay boolean DEFAULT false;