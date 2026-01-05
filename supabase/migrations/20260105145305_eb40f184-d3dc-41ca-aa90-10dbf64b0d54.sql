-- ENUMS
CREATE TYPE room_status AS ENUM ('AVAILABLE', 'OCCUPIED', 'RESERVED', 'OUT_OF_ORDER', 'OUT_OF_SERVICE');
CREATE TYPE cleaning_status AS ENUM ('CLEAN', 'DIRTY', 'IN_PROGRESS', 'INSPECTED');
CREATE TYPE reservation_status AS ENUM ('PENDING', 'CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT', 'CANCELLED', 'NO_SHOW');
CREATE TYPE booking_source AS ENUM ('DIRECT', 'WEBSITE', 'BOOKING_COM', 'EXPEDIA', 'AIRBNB', 'WALK_IN');
CREATE TYPE loyalty_tier AS ENUM ('STANDARD', 'SILVER', 'GOLD', 'PLATINUM');
CREATE TYPE table_status AS ENUM ('AVAILABLE', 'OCCUPIED', 'RESERVED', 'CLEANING');
CREATE TYPE order_status AS ENUM ('OPEN', 'KITCHEN', 'SERVED', 'PAID');
CREATE TYPE table_zone AS ENUM ('INDOOR', 'TERRACE', 'BAR');
CREATE TYPE service_category AS ENUM ('TRANSPORT', 'SPA', 'TOUR', 'RESTAURANT', 'HOUSEKEEPING', 'MAINTENANCE', 'OTHER');
CREATE TYPE request_status AS ENUM ('PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');
CREATE TYPE request_priority AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');
CREATE TYPE account_type AS ENUM ('ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE');
CREATE TYPE invoice_status AS ENUM ('DRAFT', 'PENDING', 'PAID', 'OVERDUE', 'CANCELLED');
CREATE TYPE transaction_type AS ENUM ('CREDIT', 'DEBIT');
CREATE TYPE user_role AS ENUM ('ADMIN', 'MANAGER', 'STAFF', 'VIEWER');
CREATE TYPE integration_type AS ENUM ('OTA', 'PAYMENT', 'PMS', 'CRM', 'ACCOUNTING', 'OTHER');
CREATE TYPE integration_status AS ENUM ('CONNECTED', 'DISCONNECTED', 'ERROR');

-- ROOM TYPES
CREATE TABLE room_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  base_price DECIMAL(10,2) NOT NULL DEFAULT 0,
  max_occupancy INTEGER NOT NULL DEFAULT 2,
  total_rooms INTEGER NOT NULL DEFAULT 0,
  amenities TEXT[] DEFAULT '{}',
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ROOMS
CREATE TABLE rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_number TEXT NOT NULL UNIQUE,
  floor INTEGER NOT NULL DEFAULT 1,
  room_type_id UUID REFERENCES room_types(id),
  name TEXT,
  description TEXT,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  capacity INTEGER NOT NULL DEFAULT 2,
  amenities TEXT[] DEFAULT '{}',
  image_url TEXT,
  size INTEGER,
  status room_status DEFAULT 'AVAILABLE',
  cleaning_status cleaning_status DEFAULT 'CLEAN',
  next_reservation TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- GUESTS
CREATE TABLE guests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT UNIQUE,
  phone TEXT,
  nationality TEXT,
  loyalty_tier loyalty_tier DEFAULT 'STANDARD',
  loyalty_points INTEGER DEFAULT 0,
  total_spent DECIMAL(10,2) DEFAULT 0,
  total_stays INTEGER DEFAULT 0,
  last_stay TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RESERVATIONS
CREATE TABLE reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  confirmation_code TEXT NOT NULL UNIQUE,
  guest_id UUID REFERENCES guests(id),
  guest_name TEXT NOT NULL,
  guest_email TEXT,
  phone TEXT,
  room_id UUID REFERENCES rooms(id),
  room_name TEXT,
  room_type_id UUID REFERENCES room_types(id),
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  nights INTEGER NOT NULL DEFAULT 1,
  guests_count INTEGER NOT NULL DEFAULT 1,
  total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  status reservation_status DEFAULT 'PENDING',
  source booking_source DEFAULT 'DIRECT',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- HOUSEKEEPING TASKS
CREATE TABLE housekeeping_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES rooms(id),
  room_number TEXT NOT NULL,
  task_type TEXT NOT NULL,
  priority request_priority DEFAULT 'NORMAL',
  status TEXT DEFAULT 'PENDING',
  assigned_to TEXT,
  notes TEXT,
  scheduled_for TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- LAUNDRY ITEMS
CREATE TABLE laundry_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_number TEXT NOT NULL,
  guest_name TEXT,
  item_type TEXT NOT NULL,
  quantity INTEGER DEFAULT 1,
  status TEXT DEFAULT 'PENDING',
  priority request_priority DEFAULT 'NORMAL',
  notes TEXT,
  received_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- MENU CATEGORIES
CREATE TABLE menu_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  icon TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- MENU ITEMS
CREATE TABLE menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES menu_categories(id),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  image TEXT,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RESTAURANT TABLES
CREATE TABLE restaurant_tables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_number TEXT NOT NULL UNIQUE,
  capacity INTEGER NOT NULL DEFAULT 4,
  status table_status DEFAULT 'AVAILABLE',
  zone table_zone DEFAULT 'INDOOR',
  current_order_id UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- POS ORDERS
CREATE TABLE pos_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_id UUID REFERENCES restaurant_tables(id),
  table_number TEXT NOT NULL,
  status order_status DEFAULT 'OPEN',
  total_amount DECIMAL(10,2) DEFAULT 0,
  guest_count INTEGER DEFAULT 1,
  opened_at TIMESTAMPTZ DEFAULT now(),
  closed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ORDER ITEMS
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES pos_orders(id) ON DELETE CASCADE,
  menu_item_id UUID REFERENCES menu_items(id),
  name TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- INVENTORY CATEGORIES
CREATE TABLE inventory_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- INVENTORY ITEMS
CREATE TABLE inventory_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES inventory_categories(id),
  name TEXT NOT NULL,
  sku TEXT UNIQUE,
  quantity INTEGER DEFAULT 0,
  min_quantity INTEGER DEFAULT 0,
  unit TEXT DEFAULT 'unit',
  unit_cost DECIMAL(10,2) DEFAULT 0,
  supplier TEXT,
  last_restocked TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- CONCIERGE SERVICES
CREATE TABLE concierge_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category service_category DEFAULT 'OTHER',
  description TEXT,
  price DECIMAL(10,2) DEFAULT 0,
  duration INTEGER,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- SERVICE REQUESTS
CREATE TABLE service_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_name TEXT NOT NULL,
  room_number TEXT NOT NULL,
  category service_category DEFAULT 'OTHER',
  title TEXT NOT NULL,
  description TEXT,
  status request_status DEFAULT 'PENDING',
  priority request_priority DEFAULT 'NORMAL',
  requested_at TIMESTAMPTZ DEFAULT now(),
  scheduled_for TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  assigned_to TEXT,
  notes TEXT,
  cost DECIMAL(10,2),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- MINIMARKET PRODUCTS
CREATE TABLE minimarket_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  stock INTEGER DEFAULT 0,
  min_stock INTEGER DEFAULT 5,
  barcode TEXT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- MINIMARKET SALES
CREATE TABLE minimarket_sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES minimarket_products(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  room_number TEXT,
  payment_method TEXT DEFAULT 'CASH',
  sold_at TIMESTAMPTZ DEFAULT now()
);

-- CHART OF ACCOUNTS
CREATE TABLE chart_of_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  account_type account_type NOT NULL,
  balance DECIMAL(12,2) DEFAULT 0,
  parent_id UUID REFERENCES chart_of_accounts(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- TRANSACTIONS
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  description TEXT NOT NULL,
  account_id UUID REFERENCES chart_of_accounts(id),
  account_name TEXT,
  transaction_type transaction_type NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  reference TEXT,
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- INVOICES
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number TEXT NOT NULL UNIQUE,
  invoice_type TEXT NOT NULL,
  customer_or_vendor TEXT NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  due_date DATE NOT NULL,
  status invoice_status DEFAULT 'DRAFT',
  items JSONB DEFAULT '[]',
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- HOTEL PROFILE
CREATE TABLE hotel_profile (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT,
  city TEXT,
  country TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  timezone TEXT DEFAULT 'UTC',
  currency TEXT DEFAULT 'USD',
  check_in_time TIME DEFAULT '15:00',
  check_out_time TIME DEFAULT '11:00',
  total_rooms INTEGER DEFAULT 0,
  star_rating INTEGER DEFAULT 3,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- SYSTEM USERS
CREATE TABLE system_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role user_role DEFAULT 'STAFF',
  department TEXT,
  status TEXT DEFAULT 'ACTIVE',
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- INTEGRATIONS
CREATE TABLE integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  integration_type integration_type DEFAULT 'OTHER',
  status integration_status DEFAULT 'DISCONNECTED',
  last_sync TIMESTAMPTZ,
  config JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- CALENDAR EVENTS
CREATE TABLE calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  event_type TEXT,
  related_id UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE room_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE housekeeping_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE laundry_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurant_tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE pos_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE concierge_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE minimarket_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE minimarket_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE chart_of_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE hotel_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;

-- PUBLIC READ policies (for now, until auth is implemented)
CREATE POLICY "Allow public read" ON room_types FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON rooms FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON guests FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON reservations FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON housekeeping_tasks FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON laundry_items FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON menu_categories FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON menu_items FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON restaurant_tables FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON pos_orders FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON order_items FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON inventory_categories FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON inventory_items FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON concierge_services FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON service_requests FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON minimarket_products FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON minimarket_sales FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON chart_of_accounts FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON transactions FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON invoices FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON hotel_profile FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON system_users FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON integrations FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON calendar_events FOR SELECT USING (true);

-- PUBLIC WRITE policies (temporary until auth)
CREATE POLICY "Allow public insert" ON room_types FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON room_types FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON room_types FOR DELETE USING (true);

CREATE POLICY "Allow public insert" ON rooms FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON rooms FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON rooms FOR DELETE USING (true);

CREATE POLICY "Allow public insert" ON guests FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON guests FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON guests FOR DELETE USING (true);

CREATE POLICY "Allow public insert" ON reservations FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON reservations FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON reservations FOR DELETE USING (true);

CREATE POLICY "Allow public insert" ON housekeeping_tasks FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON housekeeping_tasks FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON housekeeping_tasks FOR DELETE USING (true);

CREATE POLICY "Allow public insert" ON laundry_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON laundry_items FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON laundry_items FOR DELETE USING (true);

CREATE POLICY "Allow public insert" ON menu_categories FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON menu_categories FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON menu_categories FOR DELETE USING (true);

CREATE POLICY "Allow public insert" ON menu_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON menu_items FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON menu_items FOR DELETE USING (true);

CREATE POLICY "Allow public insert" ON restaurant_tables FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON restaurant_tables FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON restaurant_tables FOR DELETE USING (true);

CREATE POLICY "Allow public insert" ON pos_orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON pos_orders FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON pos_orders FOR DELETE USING (true);

CREATE POLICY "Allow public insert" ON order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON order_items FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON order_items FOR DELETE USING (true);

CREATE POLICY "Allow public insert" ON inventory_categories FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON inventory_categories FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON inventory_categories FOR DELETE USING (true);

CREATE POLICY "Allow public insert" ON inventory_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON inventory_items FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON inventory_items FOR DELETE USING (true);

CREATE POLICY "Allow public insert" ON concierge_services FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON concierge_services FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON concierge_services FOR DELETE USING (true);

CREATE POLICY "Allow public insert" ON service_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON service_requests FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON service_requests FOR DELETE USING (true);

CREATE POLICY "Allow public insert" ON minimarket_products FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON minimarket_products FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON minimarket_products FOR DELETE USING (true);

CREATE POLICY "Allow public insert" ON minimarket_sales FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON minimarket_sales FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON minimarket_sales FOR DELETE USING (true);

CREATE POLICY "Allow public insert" ON chart_of_accounts FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON chart_of_accounts FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON chart_of_accounts FOR DELETE USING (true);

CREATE POLICY "Allow public insert" ON transactions FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON transactions FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON transactions FOR DELETE USING (true);

CREATE POLICY "Allow public insert" ON invoices FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON invoices FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON invoices FOR DELETE USING (true);

CREATE POLICY "Allow public insert" ON hotel_profile FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON hotel_profile FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON hotel_profile FOR DELETE USING (true);

CREATE POLICY "Allow public insert" ON system_users FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON system_users FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON system_users FOR DELETE USING (true);

CREATE POLICY "Allow public insert" ON integrations FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON integrations FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON integrations FOR DELETE USING (true);

CREATE POLICY "Allow public insert" ON calendar_events FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON calendar_events FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON calendar_events FOR DELETE USING (true);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_room_types_updated_at BEFORE UPDATE ON room_types FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_rooms_updated_at BEFORE UPDATE ON rooms FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_guests_updated_at BEFORE UPDATE ON guests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reservations_updated_at BEFORE UPDATE ON reservations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_housekeeping_tasks_updated_at BEFORE UPDATE ON housekeeping_tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_menu_items_updated_at BEFORE UPDATE ON menu_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_restaurant_tables_updated_at BEFORE UPDATE ON restaurant_tables FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pos_orders_updated_at BEFORE UPDATE ON pos_orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_inventory_items_updated_at BEFORE UPDATE ON inventory_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_service_requests_updated_at BEFORE UPDATE ON service_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_minimarket_products_updated_at BEFORE UPDATE ON minimarket_products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_hotel_profile_updated_at BEFORE UPDATE ON hotel_profile FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_system_users_updated_at BEFORE UPDATE ON system_users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_integrations_updated_at BEFORE UPDATE ON integrations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();