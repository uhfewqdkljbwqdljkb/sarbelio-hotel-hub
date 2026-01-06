-- Add missing columns to inventory_items table
ALTER TABLE public.inventory_items
ADD COLUMN IF NOT EXISTS max_quantity integer DEFAULT 100,
ADD COLUMN IF NOT EXISTS sell_price numeric DEFAULT NULL,
ADD COLUMN IF NOT EXISTS location text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS destination text DEFAULT 'INTERNAL',
ADD COLUMN IF NOT EXISTS barcode text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS image_url text DEFAULT NULL;

-- Create suppliers table
CREATE TABLE public.suppliers (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  address text,
  categories text[] DEFAULT '{}',
  rating numeric DEFAULT 5.0,
  total_orders integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on suppliers
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for suppliers
CREATE POLICY "Allow public read on suppliers" ON public.suppliers FOR SELECT USING (true);
CREATE POLICY "Allow public insert on suppliers" ON public.suppliers FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on suppliers" ON public.suppliers FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on suppliers" ON public.suppliers FOR DELETE USING (true);

-- Create purchase_orders table
CREATE TABLE public.purchase_orders (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number text NOT NULL UNIQUE,
  supplier_id uuid REFERENCES public.suppliers(id) ON DELETE SET NULL,
  supplier_name text NOT NULL,
  status text DEFAULT 'DRAFT',
  total_amount numeric DEFAULT 0,
  expected_delivery date,
  notes text,
  is_template boolean DEFAULT false,
  template_name text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on purchase_orders
ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for purchase_orders
CREATE POLICY "Allow public read on purchase_orders" ON public.purchase_orders FOR SELECT USING (true);
CREATE POLICY "Allow public insert on purchase_orders" ON public.purchase_orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on purchase_orders" ON public.purchase_orders FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on purchase_orders" ON public.purchase_orders FOR DELETE USING (true);

-- Create purchase_order_items table
CREATE TABLE public.purchase_order_items (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id uuid REFERENCES public.purchase_orders(id) ON DELETE CASCADE,
  item_id uuid REFERENCES public.inventory_items(id) ON DELETE SET NULL,
  item_name text NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  unit_cost numeric NOT NULL DEFAULT 0,
  total numeric NOT NULL DEFAULT 0,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on purchase_order_items
ALTER TABLE public.purchase_order_items ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for purchase_order_items
CREATE POLICY "Allow public read on purchase_order_items" ON public.purchase_order_items FOR SELECT USING (true);
CREATE POLICY "Allow public insert on purchase_order_items" ON public.purchase_order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on purchase_order_items" ON public.purchase_order_items FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on purchase_order_items" ON public.purchase_order_items FOR DELETE USING (true);

-- Create order_templates table
CREATE TABLE public.order_templates (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  supplier_id uuid REFERENCES public.suppliers(id) ON DELETE SET NULL,
  supplier_name text NOT NULL,
  total_amount numeric DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on order_templates
ALTER TABLE public.order_templates ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for order_templates
CREATE POLICY "Allow public read on order_templates" ON public.order_templates FOR SELECT USING (true);
CREATE POLICY "Allow public insert on order_templates" ON public.order_templates FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on order_templates" ON public.order_templates FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on order_templates" ON public.order_templates FOR DELETE USING (true);

-- Create order_template_items table
CREATE TABLE public.order_template_items (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id uuid REFERENCES public.order_templates(id) ON DELETE CASCADE,
  item_id uuid REFERENCES public.inventory_items(id) ON DELETE SET NULL,
  item_name text NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  unit_cost numeric NOT NULL DEFAULT 0,
  total numeric NOT NULL DEFAULT 0,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on order_template_items
ALTER TABLE public.order_template_items ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for order_template_items
CREATE POLICY "Allow public read on order_template_items" ON public.order_template_items FOR SELECT USING (true);
CREATE POLICY "Allow public insert on order_template_items" ON public.order_template_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on order_template_items" ON public.order_template_items FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on order_template_items" ON public.order_template_items FOR DELETE USING (true);

-- Add updated_at trigger to new tables
CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON public.suppliers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_purchase_orders_updated_at BEFORE UPDATE ON public.purchase_orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_order_templates_updated_at BEFORE UPDATE ON public.order_templates FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();