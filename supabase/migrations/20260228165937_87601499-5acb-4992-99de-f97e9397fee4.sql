-- Drop and recreate all triggers to ensure they exist
DROP TRIGGER IF EXISTS trg_calculate_reservation_commission ON public.reservations;
DROP TRIGGER IF EXISTS trg_update_reservation_deposit ON public.deposit_transactions;
DROP TRIGGER IF EXISTS update_reservations_updated_at ON public.reservations;
DROP TRIGGER IF EXISTS update_commission_profiles_updated_at ON public.commission_profiles;
DROP TRIGGER IF EXISTS check_room_availability_trigger ON public.reservations;

-- Trigger to auto-calculate commission when a reservation is inserted or updated
CREATE TRIGGER trg_calculate_reservation_commission
BEFORE INSERT OR UPDATE ON public.reservations
FOR EACH ROW
EXECUTE FUNCTION public.calculate_reservation_commission();

-- Trigger to auto-update reservation deposit totals when a deposit transaction is inserted
CREATE TRIGGER trg_update_reservation_deposit
AFTER INSERT ON public.deposit_transactions
FOR EACH ROW
EXECUTE FUNCTION public.update_reservation_deposit();

-- Trigger to update updated_at timestamps
CREATE TRIGGER update_reservations_updated_at
BEFORE UPDATE ON public.reservations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_commission_profiles_updated_at
BEFORE UPDATE ON public.commission_profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Room availability check trigger
CREATE TRIGGER check_room_availability_trigger
BEFORE INSERT OR UPDATE ON public.reservations
FOR EACH ROW
EXECUTE FUNCTION public.check_room_availability();