-- Create storage bucket for room images
INSERT INTO storage.buckets (id, name, public)
VALUES ('room-images', 'room-images', true);

-- Create policy for public read access
CREATE POLICY "Room images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'room-images');

-- Create policy for public upload
CREATE POLICY "Anyone can upload room images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'room-images');

-- Create policy for public update
CREATE POLICY "Anyone can update room images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'room-images');

-- Create policy for public delete
CREATE POLICY "Anyone can delete room images"
ON storage.objects FOR DELETE
USING (bucket_id = 'room-images');