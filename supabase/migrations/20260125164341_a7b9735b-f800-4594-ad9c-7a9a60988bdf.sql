-- Fix RLS policies for all tables with error-level security issues
-- This migration replaces overly permissive policies with role-based access controls

-- =====================================================
-- 1. Fix system_users table - Admin only access
-- =====================================================
DROP POLICY IF EXISTS "Allow public delete" ON system_users;
DROP POLICY IF EXISTS "Allow public insert" ON system_users;
DROP POLICY IF EXISTS "Allow public read" ON system_users;
DROP POLICY IF EXISTS "Allow public update" ON system_users;

CREATE POLICY "Admins can manage system users"
ON system_users FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Staff can view system users"
ON system_users FOR SELECT TO authenticated
USING (is_staff(auth.uid()));

-- =====================================================
-- 2. Fix suppliers table - Admin only write access
-- =====================================================
DROP POLICY IF EXISTS "Allow public delete on suppliers" ON suppliers;
DROP POLICY IF EXISTS "Allow public insert on suppliers" ON suppliers;
DROP POLICY IF EXISTS "Allow public read on suppliers" ON suppliers;
DROP POLICY IF EXISTS "Allow public update on suppliers" ON suppliers;

CREATE POLICY "Admins can manage suppliers"
ON suppliers FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Staff can view suppliers"
ON suppliers FOR SELECT TO authenticated
USING (is_staff(auth.uid()));

-- =====================================================
-- 3. Fix invoices table - Admin only access
-- =====================================================
DROP POLICY IF EXISTS "Allow public delete" ON invoices;
DROP POLICY IF EXISTS "Allow public insert" ON invoices;
DROP POLICY IF EXISTS "Allow public read" ON invoices;
DROP POLICY IF EXISTS "Allow public update" ON invoices;

CREATE POLICY "Admins can manage invoices"
ON invoices FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Staff can view invoices"
ON invoices FOR SELECT TO authenticated
USING (is_staff(auth.uid()));

-- =====================================================
-- 4. Fix purchase_orders table - Admin only write access
-- =====================================================
DROP POLICY IF EXISTS "Allow public delete on purchase_orders" ON purchase_orders;
DROP POLICY IF EXISTS "Allow public insert on purchase_orders" ON purchase_orders;
DROP POLICY IF EXISTS "Allow public read on purchase_orders" ON purchase_orders;
DROP POLICY IF EXISTS "Allow public update on purchase_orders" ON purchase_orders;

CREATE POLICY "Admins can manage purchase orders"
ON purchase_orders FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Staff can view purchase orders"
ON purchase_orders FOR SELECT TO authenticated
USING (is_staff(auth.uid()));

-- =====================================================
-- 5. Fix purchase_order_items table - Admin only write access
-- =====================================================
DROP POLICY IF EXISTS "Allow public delete on purchase_order_items" ON purchase_order_items;
DROP POLICY IF EXISTS "Allow public insert on purchase_order_items" ON purchase_order_items;
DROP POLICY IF EXISTS "Allow public read on purchase_order_items" ON purchase_order_items;
DROP POLICY IF EXISTS "Allow public update on purchase_order_items" ON purchase_order_items;

CREATE POLICY "Admins can manage purchase order items"
ON purchase_order_items FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Staff can view purchase order items"
ON purchase_order_items FOR SELECT TO authenticated
USING (is_staff(auth.uid()));

-- =====================================================
-- 6. Fix housekeeping_tasks table - Admin/Housekeeping access
-- =====================================================
DROP POLICY IF EXISTS "Allow public delete" ON housekeeping_tasks;
DROP POLICY IF EXISTS "Allow public insert" ON housekeeping_tasks;
DROP POLICY IF EXISTS "Allow public read" ON housekeeping_tasks;
DROP POLICY IF EXISTS "Allow public update" ON housekeeping_tasks;

CREATE POLICY "Housekeeping and admin can manage tasks"
ON housekeeping_tasks FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'housekeeping'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'housekeeping'::app_role));

CREATE POLICY "Staff can view housekeeping tasks"
ON housekeeping_tasks FOR SELECT TO authenticated
USING (is_staff(auth.uid()));

-- =====================================================
-- 7. Fix laundry_items table - Admin/Housekeeping access
-- =====================================================
DROP POLICY IF EXISTS "Allow public delete" ON laundry_items;
DROP POLICY IF EXISTS "Allow public insert" ON laundry_items;
DROP POLICY IF EXISTS "Allow public read" ON laundry_items;
DROP POLICY IF EXISTS "Allow public update" ON laundry_items;

CREATE POLICY "Housekeeping and admin can manage laundry"
ON laundry_items FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'housekeeping'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'housekeeping'::app_role));

CREATE POLICY "Staff can view laundry items"
ON laundry_items FOR SELECT TO authenticated
USING (is_staff(auth.uid()));

-- =====================================================
-- 8. Fix menu_categories table - Admin/FnB access
-- =====================================================
DROP POLICY IF EXISTS "Allow public delete" ON menu_categories;
DROP POLICY IF EXISTS "Allow public insert" ON menu_categories;
DROP POLICY IF EXISTS "Allow public read" ON menu_categories;
DROP POLICY IF EXISTS "Allow public update" ON menu_categories;

CREATE POLICY "FnB and admin can manage menu categories"
ON menu_categories FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'fnb'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'fnb'::app_role));

CREATE POLICY "Staff can view menu categories"
ON menu_categories FOR SELECT TO authenticated
USING (is_staff(auth.uid()));

-- =====================================================
-- 9. Fix menu_items table - Admin/FnB access
-- =====================================================
DROP POLICY IF EXISTS "Allow public delete" ON menu_items;
DROP POLICY IF EXISTS "Allow public insert" ON menu_items;
DROP POLICY IF EXISTS "Allow public read" ON menu_items;
DROP POLICY IF EXISTS "Allow public update" ON menu_items;

CREATE POLICY "FnB and admin can manage menu items"
ON menu_items FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'fnb'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'fnb'::app_role));

CREATE POLICY "Staff can view menu items"
ON menu_items FOR SELECT TO authenticated
USING (is_staff(auth.uid()));

-- =====================================================
-- 10. Fix restaurant_tables table - Admin/FnB access
-- =====================================================
DROP POLICY IF EXISTS "Allow public delete" ON restaurant_tables;
DROP POLICY IF EXISTS "Allow public insert" ON restaurant_tables;
DROP POLICY IF EXISTS "Allow public read" ON restaurant_tables;
DROP POLICY IF EXISTS "Allow public update" ON restaurant_tables;

CREATE POLICY "FnB and admin can manage restaurant tables"
ON restaurant_tables FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'fnb'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'fnb'::app_role));

CREATE POLICY "Staff can view restaurant tables"
ON restaurant_tables FOR SELECT TO authenticated
USING (is_staff(auth.uid()));

-- =====================================================
-- 11. Fix pos_orders table - Admin/FnB access
-- =====================================================
DROP POLICY IF EXISTS "Allow public delete" ON pos_orders;
DROP POLICY IF EXISTS "Allow public insert" ON pos_orders;
DROP POLICY IF EXISTS "Allow public read" ON pos_orders;
DROP POLICY IF EXISTS "Allow public update" ON pos_orders;

CREATE POLICY "FnB and admin can manage POS orders"
ON pos_orders FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'fnb'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'fnb'::app_role));

CREATE POLICY "Staff can view POS orders"
ON pos_orders FOR SELECT TO authenticated
USING (is_staff(auth.uid()));

-- =====================================================
-- 12. Fix order_items table - Admin/FnB access
-- =====================================================
DROP POLICY IF EXISTS "Allow public delete" ON order_items;
DROP POLICY IF EXISTS "Allow public insert" ON order_items;
DROP POLICY IF EXISTS "Allow public read" ON order_items;
DROP POLICY IF EXISTS "Allow public update" ON order_items;

CREATE POLICY "FnB and admin can manage order items"
ON order_items FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'fnb'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'fnb'::app_role));

CREATE POLICY "Staff can view order items"
ON order_items FOR SELECT TO authenticated
USING (is_staff(auth.uid()));

-- =====================================================
-- 13. Fix inventory_items table - Admin only write
-- =====================================================
DROP POLICY IF EXISTS "Allow public delete" ON inventory_items;
DROP POLICY IF EXISTS "Allow public insert" ON inventory_items;
DROP POLICY IF EXISTS "Allow public read" ON inventory_items;
DROP POLICY IF EXISTS "Allow public update" ON inventory_items;

CREATE POLICY "Admins can manage inventory items"
ON inventory_items FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Staff can view inventory items"
ON inventory_items FOR SELECT TO authenticated
USING (is_staff(auth.uid()));

-- =====================================================
-- 14. Fix inventory_categories table - Admin only write
-- =====================================================
DROP POLICY IF EXISTS "Allow public delete" ON inventory_categories;
DROP POLICY IF EXISTS "Allow public insert" ON inventory_categories;
DROP POLICY IF EXISTS "Allow public read" ON inventory_categories;
DROP POLICY IF EXISTS "Allow public update" ON inventory_categories;

CREATE POLICY "Admins can manage inventory categories"
ON inventory_categories FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Staff can view inventory categories"
ON inventory_categories FOR SELECT TO authenticated
USING (is_staff(auth.uid()));

-- =====================================================
-- 15. Fix order_templates table - Admin only write
-- =====================================================
DROP POLICY IF EXISTS "Allow public delete on order_templates" ON order_templates;
DROP POLICY IF EXISTS "Allow public insert on order_templates" ON order_templates;
DROP POLICY IF EXISTS "Allow public read on order_templates" ON order_templates;
DROP POLICY IF EXISTS "Allow public update on order_templates" ON order_templates;

CREATE POLICY "Admins can manage order templates"
ON order_templates FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Staff can view order templates"
ON order_templates FOR SELECT TO authenticated
USING (is_staff(auth.uid()));

-- =====================================================
-- 16. Fix order_template_items table - Admin only write
-- =====================================================
DROP POLICY IF EXISTS "Allow public delete on order_template_items" ON order_template_items;
DROP POLICY IF EXISTS "Allow public insert on order_template_items" ON order_template_items;
DROP POLICY IF EXISTS "Allow public read on order_template_items" ON order_template_items;
DROP POLICY IF EXISTS "Allow public update on order_template_items" ON order_template_items;

CREATE POLICY "Admins can manage order template items"
ON order_template_items FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Staff can view order template items"
ON order_template_items FOR SELECT TO authenticated
USING (is_staff(auth.uid()));

-- =====================================================
-- 17. Fix chart_of_accounts table - Admin only
-- =====================================================
DROP POLICY IF EXISTS "Allow public delete" ON chart_of_accounts;
DROP POLICY IF EXISTS "Allow public insert" ON chart_of_accounts;
DROP POLICY IF EXISTS "Allow public read" ON chart_of_accounts;
DROP POLICY IF EXISTS "Allow public update" ON chart_of_accounts;

CREATE POLICY "Admins can manage chart of accounts"
ON chart_of_accounts FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Staff can view chart of accounts"
ON chart_of_accounts FOR SELECT TO authenticated
USING (is_staff(auth.uid()));

-- =====================================================
-- 18. Fix transactions table - Admin only
-- =====================================================
DROP POLICY IF EXISTS "Allow public delete" ON transactions;
DROP POLICY IF EXISTS "Allow public insert" ON transactions;
DROP POLICY IF EXISTS "Allow public read" ON transactions;
DROP POLICY IF EXISTS "Allow public update" ON transactions;

CREATE POLICY "Admins can manage transactions"
ON transactions FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Staff can view transactions"
ON transactions FOR SELECT TO authenticated
USING (is_staff(auth.uid()));

-- =====================================================
-- 19. Fix concierge_services table - Admin only write
-- =====================================================
DROP POLICY IF EXISTS "Allow public delete" ON concierge_services;
DROP POLICY IF EXISTS "Allow public insert" ON concierge_services;
DROP POLICY IF EXISTS "Allow public read" ON concierge_services;
DROP POLICY IF EXISTS "Allow public update" ON concierge_services;

CREATE POLICY "Admins can manage concierge services"
ON concierge_services FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Staff can view concierge services"
ON concierge_services FOR SELECT TO authenticated
USING (is_staff(auth.uid()));

-- =====================================================
-- 20. Fix service_requests table - Role-based access
-- =====================================================
DROP POLICY IF EXISTS "Allow public delete" ON service_requests;
DROP POLICY IF EXISTS "Allow public insert" ON service_requests;
DROP POLICY IF EXISTS "Allow public read" ON service_requests;
DROP POLICY IF EXISTS "Allow public update" ON service_requests;

CREATE POLICY "Staff can manage service requests"
ON service_requests FOR ALL TO authenticated
USING (is_staff(auth.uid()))
WITH CHECK (is_staff(auth.uid()));

-- =====================================================
-- 21. Fix minimarket_products table - Admin/FnB access
-- =====================================================
DROP POLICY IF EXISTS "Allow public delete" ON minimarket_products;
DROP POLICY IF EXISTS "Allow public insert" ON minimarket_products;
DROP POLICY IF EXISTS "Allow public read" ON minimarket_products;
DROP POLICY IF EXISTS "Allow public update" ON minimarket_products;

CREATE POLICY "FnB and admin can manage minimarket products"
ON minimarket_products FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'fnb'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'fnb'::app_role));

CREATE POLICY "Staff can view minimarket products"
ON minimarket_products FOR SELECT TO authenticated
USING (is_staff(auth.uid()));

-- =====================================================
-- 22. Fix minimarket_sales table - Admin/FnB access
-- =====================================================
DROP POLICY IF EXISTS "Allow public delete" ON minimarket_sales;
DROP POLICY IF EXISTS "Allow public insert" ON minimarket_sales;
DROP POLICY IF EXISTS "Allow public read" ON minimarket_sales;
DROP POLICY IF EXISTS "Allow public update" ON minimarket_sales;

CREATE POLICY "FnB and admin can manage minimarket sales"
ON minimarket_sales FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'fnb'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'fnb'::app_role));

CREATE POLICY "Staff can view minimarket sales"
ON minimarket_sales FOR SELECT TO authenticated
USING (is_staff(auth.uid()));

-- =====================================================
-- 23. Fix hotel_profile table - Admin only write
-- =====================================================
DROP POLICY IF EXISTS "Allow public delete" ON hotel_profile;
DROP POLICY IF EXISTS "Allow public insert" ON hotel_profile;
DROP POLICY IF EXISTS "Allow public read" ON hotel_profile;
DROP POLICY IF EXISTS "Allow public update" ON hotel_profile;

CREATE POLICY "Admins can manage hotel profile"
ON hotel_profile FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Staff can view hotel profile"
ON hotel_profile FOR SELECT TO authenticated
USING (is_staff(auth.uid()));

-- =====================================================
-- 24. Fix integrations table - Admin only
-- =====================================================
DROP POLICY IF EXISTS "Allow public delete" ON integrations;
DROP POLICY IF EXISTS "Allow public insert" ON integrations;
DROP POLICY IF EXISTS "Allow public read" ON integrations;
DROP POLICY IF EXISTS "Allow public update" ON integrations;

CREATE POLICY "Admins can manage integrations"
ON integrations FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Staff can view integrations"
ON integrations FOR SELECT TO authenticated
USING (is_staff(auth.uid()));

-- =====================================================
-- 25. Fix calendar_events table - Staff access
-- =====================================================
DROP POLICY IF EXISTS "Allow public delete" ON calendar_events;
DROP POLICY IF EXISTS "Allow public insert" ON calendar_events;
DROP POLICY IF EXISTS "Allow public read" ON calendar_events;
DROP POLICY IF EXISTS "Allow public update" ON calendar_events;

CREATE POLICY "Staff can manage calendar events"
ON calendar_events FOR ALL TO authenticated
USING (is_staff(auth.uid()))
WITH CHECK (is_staff(auth.uid()));

-- =====================================================
-- 26. Fix rooms table - Admin/Reception write, keep public read for booking
-- =====================================================
DROP POLICY IF EXISTS "Allow public delete" ON rooms;
DROP POLICY IF EXISTS "Allow public insert" ON rooms;
DROP POLICY IF EXISTS "Allow public update" ON rooms;
-- Keep "Anyone can view rooms" and "Allow public read" for booking page

CREATE POLICY "Admin and reception can manage rooms"
ON rooms FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'reception'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'reception'::app_role));

-- =====================================================
-- 27. Fix room_types table - Admin write, keep public read
-- =====================================================
DROP POLICY IF EXISTS "Allow public delete" ON room_types;
DROP POLICY IF EXISTS "Allow public insert" ON room_types;
DROP POLICY IF EXISTS "Allow public update" ON room_types;
-- Keep "Anyone can view room types" for booking page

CREATE POLICY "Admins can manage room types"
ON room_types FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- =====================================================
-- 28. Fix storage policies for room-images bucket
-- =====================================================
DROP POLICY IF EXISTS "Anyone can upload room images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can update room images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete room images" ON storage.objects;

-- Create new staff-only policies for upload/update/delete
CREATE POLICY "Staff can upload room images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'room-images' AND is_staff(auth.uid()));

CREATE POLICY "Staff can update room images"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'room-images' AND is_staff(auth.uid()));

CREATE POLICY "Staff can delete room images"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'room-images' AND is_staff(auth.uid()));

-- Keep public read for room images (for booking page)
CREATE POLICY "Room images are publicly viewable"
ON storage.objects FOR SELECT
USING (bucket_id = 'room-images');