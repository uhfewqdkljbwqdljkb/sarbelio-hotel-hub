-- Enable RLS on rooms and room_types tables
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_types ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (for booking page)
CREATE POLICY "Anyone can view rooms" 
ON public.rooms 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can view room types" 
ON public.room_types 
FOR SELECT 
USING (true);