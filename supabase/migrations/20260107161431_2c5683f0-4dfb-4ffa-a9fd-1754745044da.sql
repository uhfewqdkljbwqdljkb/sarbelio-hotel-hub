-- Add order_type and guest_name columns to pos_orders table for drive-thru support
ALTER TABLE public.pos_orders 
ADD COLUMN IF NOT EXISTS order_type text DEFAULT 'DINE_IN',
ADD COLUMN IF NOT EXISTS guest_name text;

-- Make table_id nullable for drive-thru orders
ALTER TABLE public.pos_orders 
ALTER COLUMN table_id DROP NOT NULL;