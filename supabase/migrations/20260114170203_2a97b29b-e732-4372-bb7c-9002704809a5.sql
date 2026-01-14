-- Add weekday and weekend pricing columns to rooms table
ALTER TABLE public.rooms 
ADD COLUMN IF NOT EXISTS weekday_price numeric DEFAULT NULL,
ADD COLUMN IF NOT EXISTS weekend_price numeric DEFAULT NULL;

-- Create room_images table for multiple images per room
CREATE TABLE public.room_images (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id uuid NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  display_order integer NOT NULL DEFAULT 0,
  is_primary boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on room_images
ALTER TABLE public.room_images ENABLE ROW LEVEL SECURITY;

-- RLS policies for room_images (staff can manage, public can view)
CREATE POLICY "Anyone can view room images"
ON public.room_images FOR SELECT
TO authenticated, anon
USING (true);

CREATE POLICY "Staff can insert room images"
ON public.room_images FOR INSERT
TO authenticated
WITH CHECK (public.is_staff(auth.uid()));

CREATE POLICY "Staff can update room images"
ON public.room_images FOR UPDATE
TO authenticated
USING (public.is_staff(auth.uid()));

CREATE POLICY "Staff can delete room images"
ON public.room_images FOR DELETE
TO authenticated
USING (public.is_staff(auth.uid()));

-- Create index for faster lookups
CREATE INDEX idx_room_images_room_id ON public.room_images(room_id);
CREATE INDEX idx_room_images_display_order ON public.room_images(room_id, display_order);