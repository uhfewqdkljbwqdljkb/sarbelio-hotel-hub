-- Improve update_reservation_deposit to also update balance_due and payment_status
CREATE OR REPLACE FUNCTION public.update_reservation_deposit()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_total_deposits NUMERIC;
  v_total_amount NUMERIC;
BEGIN
  -- Calculate total deposits for this reservation
  SELECT COALESCE(SUM(amount), 0) INTO v_total_deposits
  FROM deposit_transactions 
  WHERE reservation_id = NEW.reservation_id;

  -- Get the reservation total
  SELECT total_amount INTO v_total_amount
  FROM reservations
  WHERE id = NEW.reservation_id;

  -- Update the reservation's deposit amount, balance, and payment status
  UPDATE reservations
  SET 
    deposit_amount = v_total_deposits,
    balance_due = v_total_amount - v_total_deposits,
    deposit_date = NEW.transaction_date,
    deposit_method = NEW.payment_method,
    deposit_received_by = NEW.received_by_user_id,
    payment_status = CASE
      WHEN v_total_deposits >= v_total_amount THEN 'FULLY_PAID'
      WHEN v_total_deposits > 0 THEN 'DEPOSIT_PAID'
      ELSE 'UNPAID'
    END
  WHERE id = NEW.reservation_id;
  
  RETURN NEW;
END;
$function$;