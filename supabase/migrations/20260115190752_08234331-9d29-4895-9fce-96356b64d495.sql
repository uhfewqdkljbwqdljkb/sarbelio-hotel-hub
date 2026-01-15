-- Add supplier_id foreign key to inventory_items table
ALTER TABLE public.inventory_items 
ADD COLUMN IF NOT EXISTS supplier_id uuid REFERENCES public.suppliers(id) ON DELETE SET NULL;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_inventory_items_supplier_id ON public.inventory_items(supplier_id);

-- Add received_at column to purchase_orders for tracking when orders are received
ALTER TABLE public.purchase_orders
ADD COLUMN IF NOT EXISTS received_at timestamp with time zone;

-- Add invoice_id column to purchase_orders to link to generated invoice
ALTER TABLE public.purchase_orders
ADD COLUMN IF NOT EXISTS invoice_id uuid REFERENCES public.invoices(id) ON DELETE SET NULL;