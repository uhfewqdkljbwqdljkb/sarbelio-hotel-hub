-- Add check-in and check-out time columns to reservations table
ALTER TABLE public.reservations
ADD COLUMN check_in_time time without time zone DEFAULT '15:00:00',
ADD COLUMN check_out_time time without time zone DEFAULT '11:00:00';