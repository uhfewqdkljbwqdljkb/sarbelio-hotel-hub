-- Clean up duplicate triggers on reservations
DROP TRIGGER IF EXISTS trg_calculate_commission ON public.reservations;
DROP TRIGGER IF EXISTS trg_calculate_reservation_commission ON public.reservations;
DROP TRIGGER IF EXISTS check_room_availability_trigger ON public.reservations;
DROP TRIGGER IF EXISTS check_room_availability_before_insert ON public.reservations;
DROP TRIGGER IF EXISTS check_room_availability_before_update ON public.reservations;

-- Recreate cleanly: commission on INSERT and UPDATE
CREATE TRIGGER trg_calculate_reservation_commission
BEFORE INSERT OR UPDATE ON public.reservations
FOR EACH ROW
EXECUTE FUNCTION public.calculate_reservation_commission();

-- Room availability on INSERT and UPDATE
CREATE TRIGGER check_room_availability_trigger
BEFORE INSERT OR UPDATE ON public.reservations
FOR EACH ROW
EXECUTE FUNCTION public.check_room_availability();