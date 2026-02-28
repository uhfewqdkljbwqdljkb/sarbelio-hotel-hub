

# Fix Sales Commission Tracking and Add Employee Commission View

## Problems Found

1. **Root Cause -- Commissions not tracked**: When reservations are created via `useCreateReservation`, the `created_by_user_id` and `created_by_user_name` fields are never set. The database trigger `calculate_reservation_commission` relies on `created_by_user_id` to look up the staff member's commission profile and calculate the commission. Since it's always null, commissions are always $0.

2. **No employee commission view**: The `/sales` route is restricted to `admin` only. Non-admin staff (e.g., reception) have no way to see their own commissions or the reservations they created.

---

## Plan

### 1. Set `created_by_user_id` when creating reservations

Update `useCreateReservation` in `src/hooks/useReservations.ts` to automatically include the current logged-in user's ID and name when inserting a reservation. This will:
- Use `useAuth()` to get the current user and profile
- Pass `created_by_user_id` (auth user ID) and `created_by_user_name` (profile full_name or email) in the insert payload
- The existing database trigger will then automatically calculate the commission based on the user's active commission profile

### 2. Create an Employee Commissions page component

Create `src/components/sales/MyCommissions.tsx` -- a new component that shows:
- **Summary cards**: Total bookings made, total revenue generated, total commission earned, and commission status (paid vs pending)
- **Reservations table**: Lists all reservations created by the logged-in user with columns for confirmation code, guest name, dates, amount, commission earned, and commission status
- Data is fetched by filtering reservations where `created_by_user_id` matches the current user, and from the user's commission profile

### 3. Add a new hook for employee commission data

Add to `src/hooks/useSales.ts`:
- `useMyCommissions(userId)` -- fetches the current user's reservations (where `created_by_user_id = userId`) and their commission profile to compute personal stats
- This avoids creating a new RPC since the data is already accessible via existing RLS policies on reservations

### 4. Create a dedicated employee sales route

- Create `src/pages/MyCommissionsPage.tsx` as a lightweight page wrapper
- Add a `/my-commissions` route in `App.tsx`, accessible to `reception` and `admin` roles
- Add a navigation item in `src/data/constants.ts` for "My Commissions" visible to reception staff

### 5. Update the Sales Management page access

- Keep `/sales` as admin-only (for the full leaderboard, settings, mark-paid workflows)
- The new `/my-commissions` route serves as the employee self-service view

---

## Technical Details

**Files to create:**
- `src/components/sales/MyCommissions.tsx` -- Employee commission dashboard component
- `src/pages/MyCommissionsPage.tsx` -- Page wrapper

**Files to modify:**
- `src/hooks/useReservations.ts` -- Add `created_by_user_id` and `created_by_user_name` to the insert in `useCreateReservation`
- `src/hooks/useSales.ts` -- Add `useMyCommissions` hook
- `src/App.tsx` -- Add `/my-commissions` route
- `src/data/constants.ts` -- Add navigation item for My Commissions

No database changes are needed -- the `created_by_user_id` column and commission trigger already exist and are correctly configured.

