-- Create a function to check for overlapping reservations
CREATE OR REPLACE FUNCTION public.check_room_availability()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  overlapping_count INTEGER;
BEGIN
  -- Only check if room_id is provided and status is not CANCELLED
  IF NEW.room_id IS NOT NULL AND NEW.status != 'CANCELLED' THEN
    SELECT COUNT(*) INTO overlapping_count
    FROM public.reservations
    WHERE room_id = NEW.room_id
      AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
      AND status NOT IN ('CANCELLED', 'NO_SHOW', 'CHECKED_OUT')
      AND (
        -- Check for date overlap: new reservation overlaps with existing
        (NEW.check_in < check_out AND NEW.check_out > check_in)
      );
    
    IF overlapping_count > 0 THEN
      RAISE EXCEPTION 'Room is already booked for the selected dates. Please choose different dates or another room.';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to check availability before insert
DROP TRIGGER IF EXISTS check_room_availability_before_insert ON public.reservations;
CREATE TRIGGER check_room_availability_before_insert
  BEFORE INSERT ON public.reservations
  FOR EACH ROW
  EXECUTE FUNCTION public.check_room_availability();

-- Create trigger to check availability before update (in case room or dates change)
DROP TRIGGER IF EXISTS check_room_availability_before_update ON public.reservations;
CREATE TRIGGER check_room_availability_before_update
  BEFORE UPDATE ON public.reservations
  FOR EACH ROW
  WHEN (
    OLD.room_id IS DISTINCT FROM NEW.room_id 
    OR OLD.check_in IS DISTINCT FROM NEW.check_in 
    OR OLD.check_out IS DISTINCT FROM NEW.check_out
    OR OLD.status IS DISTINCT FROM NEW.status
  )
  EXECUTE FUNCTION public.check_room_availability();

-- Create a helper function to check room availability (for frontend use)
CREATE OR REPLACE FUNCTION public.is_room_available(
  p_room_id UUID,
  p_check_in DATE,
  p_check_out DATE,
  p_exclude_reservation_id UUID DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  overlapping_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO overlapping_count
  FROM public.reservations
  WHERE room_id = p_room_id
    AND id != COALESCE(p_exclude_reservation_id, '00000000-0000-0000-0000-000000000000'::uuid)
    AND status NOT IN ('CANCELLED', 'NO_SHOW', 'CHECKED_OUT')
    AND (p_check_in < check_out AND p_check_out > check_in);
  
  RETURN overlapping_count = 0;
END;
$$;