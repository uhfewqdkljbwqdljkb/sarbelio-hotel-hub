-- Sales & Commission Tracking columns on reservations
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS created_by_user_id UUID REFERENCES auth.users(id);
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS created_by_user_name TEXT;
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS commission_rate DECIMAL(5,2) DEFAULT 0;
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS commission_amount DECIMAL(10,2) DEFAULT 0;
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS commission_status TEXT DEFAULT 'PENDING';
ALTER TABLE reservations ADD CONSTRAINT chk_commission_status CHECK (commission_status IN ('PENDING', 'APPROVED', 'PAID', 'CANCELLED'));

-- Deposit Tracking columns on reservations
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS deposit_amount DECIMAL(10,2) DEFAULT 0;
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS deposit_date TIMESTAMPTZ;
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS deposit_method TEXT;
ALTER TABLE reservations ADD CONSTRAINT chk_deposit_method CHECK (deposit_method IS NULL OR deposit_method IN ('CASH', 'CREDIT_CARD', 'BANK_TRANSFER', 'WHISH', 'OMT', 'OTHER'));
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS deposit_received_by UUID REFERENCES auth.users(id);
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS balance_due DECIMAL(10,2);
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'UNPAID';
ALTER TABLE reservations ADD CONSTRAINT chk_payment_status CHECK (payment_status IN ('UNPAID', 'DEPOSIT_PAID', 'PARTIALLY_PAID', 'FULLY_PAID', 'REFUNDED'));

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_reservations_created_by ON reservations(created_by_user_id);
CREATE INDEX IF NOT EXISTS idx_reservations_commission_status ON reservations(commission_status);
CREATE INDEX IF NOT EXISTS idx_reservations_payment_status ON reservations(payment_status);

-- Create commission_profiles table
CREATE TABLE IF NOT EXISTS commission_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_name TEXT,
  user_email TEXT,
  base_commission_rate DECIMAL(5,2) NOT NULL DEFAULT 5.00,
  tiered_rates JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  effective_from DATE NOT NULL DEFAULT CURRENT_DATE,
  effective_to DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, effective_from)
);

-- Enable RLS on commission_profiles
ALTER TABLE commission_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for commission_profiles
CREATE POLICY "Admins can manage commission profiles" ON commission_profiles
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view own commission profile" ON commission_profiles
  FOR SELECT USING (user_id = auth.uid());

-- Create deposit_transactions table
CREATE TABLE IF NOT EXISTS deposit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_id UUID NOT NULL REFERENCES reservations(id) ON DELETE CASCADE,
  reservation_code TEXT,
  guest_name TEXT,
  amount DECIMAL(10,2) NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('CASH', 'CREDIT_CARD', 'BANK_TRANSFER', 'WHISH', 'OMT', 'OTHER')),
  received_by_user_id UUID NOT NULL REFERENCES auth.users(id),
  received_by_user_name TEXT,
  transaction_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  notes TEXT,
  receipt_number TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT positive_amount CHECK (amount > 0)
);

-- Indexes for deposit_transactions
CREATE INDEX IF NOT EXISTS idx_deposit_transactions_reservation ON deposit_transactions(reservation_id);
CREATE INDEX IF NOT EXISTS idx_deposit_transactions_received_by ON deposit_transactions(received_by_user_id);
CREATE INDEX IF NOT EXISTS idx_deposit_transactions_date ON deposit_transactions(transaction_date);

-- Enable RLS on deposit_transactions
ALTER TABLE deposit_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for deposit_transactions
CREATE POLICY "Staff can view all deposits" ON deposit_transactions
  FOR SELECT USING (is_staff(auth.uid()));

CREATE POLICY "Staff can insert deposits" ON deposit_transactions
  FOR INSERT WITH CHECK (is_staff(auth.uid()));

CREATE POLICY "Admins can manage deposits" ON deposit_transactions
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Create sales_records table for monthly aggregations
CREATE TABLE IF NOT EXISTS sales_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  user_name TEXT NOT NULL,
  period TEXT NOT NULL,
  period_type TEXT NOT NULL DEFAULT 'MONTHLY' CHECK (period_type IN ('DAILY', 'WEEKLY', 'MONTHLY')),
  total_bookings INTEGER DEFAULT 0,
  total_revenue DECIMAL(12,2) DEFAULT 0,
  total_commission DECIMAL(10,2) DEFAULT 0,
  commission_status TEXT DEFAULT 'PENDING' CHECK (commission_status IN ('PENDING', 'APPROVED', 'PAID', 'CANCELLED')),
  paid_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, period, period_type)
);

-- Enable RLS on sales_records
ALTER TABLE sales_records ENABLE ROW LEVEL SECURITY;

-- RLS Policies for sales_records
CREATE POLICY "Admins can manage sales records" ON sales_records
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view own sales records" ON sales_records
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Staff can view all sales records" ON sales_records
  FOR SELECT USING (is_staff(auth.uid()));

-- Function to calculate commission on reservation insert/update
CREATE OR REPLACE FUNCTION calculate_reservation_commission()
RETURNS TRIGGER AS $$
DECLARE
  v_commission_rate DECIMAL(5,2);
  v_user_name TEXT;
BEGIN
  -- Get the user's commission rate
  SELECT base_commission_rate, user_name 
  INTO v_commission_rate, v_user_name
  FROM commission_profiles 
  WHERE user_id = NEW.created_by_user_id 
    AND is_active = true
    AND effective_from <= CURRENT_DATE
    AND (effective_to IS NULL OR effective_to >= CURRENT_DATE)
  ORDER BY effective_from DESC
  LIMIT 1;
  
  -- Default to 0 if no profile found
  v_commission_rate := COALESCE(v_commission_rate, 0);
  
  -- Calculate commission
  NEW.commission_rate := v_commission_rate;
  NEW.commission_amount := ROUND((NEW.total_amount * v_commission_rate / 100), 2);
  NEW.created_by_user_name := COALESCE(NEW.created_by_user_name, v_user_name);
  
  -- Calculate balance due
  NEW.balance_due := NEW.total_amount - COALESCE(NEW.deposit_amount, 0);
  
  -- Update payment status
  IF COALESCE(NEW.deposit_amount, 0) = 0 THEN
    NEW.payment_status := 'UNPAID';
  ELSIF NEW.deposit_amount >= NEW.total_amount THEN
    NEW.payment_status := 'FULLY_PAID';
  ELSIF NEW.deposit_amount > 0 THEN
    NEW.payment_status := 'DEPOSIT_PAID';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger for commission calculation
DROP TRIGGER IF EXISTS trg_calculate_commission ON reservations;
CREATE TRIGGER trg_calculate_commission
  BEFORE INSERT OR UPDATE OF total_amount, created_by_user_id, deposit_amount
  ON reservations
  FOR EACH ROW
  EXECUTE FUNCTION calculate_reservation_commission();

-- Function to get sales leaderboard
CREATE OR REPLACE FUNCTION get_sales_leaderboard(
  p_start_date DATE DEFAULT DATE_TRUNC('month', CURRENT_DATE)::DATE,
  p_end_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
  rank BIGINT,
  user_id UUID,
  user_name TEXT,
  avatar_url TEXT,
  total_bookings BIGINT,
  total_revenue DECIMAL,
  total_commission DECIMAL
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ROW_NUMBER() OVER (ORDER BY SUM(r.total_amount) DESC) as rank,
    r.created_by_user_id as user_id,
    r.created_by_user_name as user_name,
    p.avatar_url,
    COUNT(*)::BIGINT as total_bookings,
    SUM(r.total_amount) as total_revenue,
    SUM(r.commission_amount) as total_commission
  FROM reservations r
  LEFT JOIN profiles p ON p.user_id = r.created_by_user_id
  WHERE r.created_by_user_id IS NOT NULL
    AND r.status NOT IN ('CANCELLED', 'NO_SHOW')
    AND r.created_at::DATE BETWEEN p_start_date AND p_end_date
  GROUP BY r.created_by_user_id, r.created_by_user_name, p.avatar_url
  ORDER BY total_revenue DESC;
END;
$$;

-- Function to update deposit and recalculate balance
CREATE OR REPLACE FUNCTION update_reservation_deposit()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the reservation's deposit amount
  UPDATE reservations
  SET 
    deposit_amount = COALESCE((
      SELECT SUM(amount) FROM deposit_transactions WHERE reservation_id = NEW.reservation_id
    ), 0),
    deposit_date = NEW.transaction_date,
    deposit_method = NEW.payment_method,
    deposit_received_by = NEW.received_by_user_id
  WHERE id = NEW.reservation_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to update reservation when deposit is added
DROP TRIGGER IF EXISTS trg_update_reservation_deposit ON deposit_transactions;
CREATE TRIGGER trg_update_reservation_deposit
  AFTER INSERT ON deposit_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_reservation_deposit();