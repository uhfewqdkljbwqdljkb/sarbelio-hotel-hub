

# Financial System Synchronization Fix

## Problems Identified

After reviewing the entire codebase, here are the specific issues causing financial data to be out of sync:

### 1. Minimarket Stats Use Local Mock Data, Not Database
The Minimarket page (`MinimarketPage.tsx`) imports `MINIMARKET_SALES` from mock data and uses local state for stats (Today's Revenue, Transactions, Items Sold). These numbers never reflect actual database sales. The `sales` state is initialized from mock data and only appended locally -- refreshing the page resets to mock data.

### 2. Restaurant Revenue Doesn't Invalidate Financial Queries
When a restaurant order is created or paid (`useCreateOrder`, `useUpdateOrder` in `useRestaurant.ts`), neither mutation invalidates the financial query keys (`financial-summary`, `revenue-data`, `combined-transactions`). So the Financials page won't reflect new restaurant revenue until a manual refresh.

### 3. Reservation Mutations Missing Financial Invalidation
`useCreateReservation` and `useUpdateReservation` don't invalidate financial queries. Only `useCancelReservation` does. This means new bookings or status changes (e.g., PENDING -> CONFIRMED) won't appear in financials until page refresh.

### 4. Revenue Chart Lumps Minimarket + Services Together
In `useRevenueData`, minimarket sales and service requests are both added to the `services` field. The chart legend says "Minimarket & Services" but the `RevenueData` type only has a `services` field -- there's no separate `minimarket` field for proper breakdown.

### 5. Dashboard Shows All-Time Revenue (No Date Filter)
`Dashboard.tsx` calls `useFinancialSummary()` with no date parameters, which means it queries all reservations, orders, and sales ever created. For a hotel dashboard, this should default to the current month or a meaningful period.

### 6. Expense Tracking Only Counts Purchase Orders
`useFinancialSummary` only counts `purchase_orders` with status RECEIVED or ORDERED as expenses. Any other operational costs (staff salaries, utilities, etc.) tracked via the `transactions` table as DEBIT entries are completely ignored in the expense total.

---

## Plan

### Step 1: Fix Minimarket to Use Database for Stats
- Remove the mock data import (`MINIMARKET_SALES`) from `MinimarketPage.tsx`
- Create a new query hook `useMinimarketSales()` that fetches from the `minimarket_sales` table
- Replace local `sales` state and mock-driven stats with real database queries
- Show actual today's revenue, transaction count, and items sold from the database

### Step 2: Add Financial Query Invalidation to All Revenue Mutations
Update `onSuccess` callbacks in these hooks to invalidate `financial-summary`, `revenue-data`, and `combined-transactions`:
- **`useRestaurant.ts`**: `useCreateOrder`, `useUpdateOrder` (when status becomes PAID)
- **`useReservations.ts`**: `useCreateReservation`, `useUpdateReservation`

### Step 3: Separate Minimarket from Services in Revenue Data
- Add a `minimarket` field to the `RevenueData` type in `types/financials.ts`
- Update `useRevenueData` to bucket minimarket sales into `minimarket` instead of `services`
- Update `useFinancialSummary` breakdown to include `minimarketRevenue` separately (already done there, just the chart data is wrong)
- Update the Financials page chart to show 4 stacked areas: Rooms, Restaurant, Minimarket, Services

### Step 4: Include Transaction-Table Expenses in Financial Summary
- In `useFinancialSummary`, also query the `transactions` table for DEBIT entries within the date range
- Add those amounts to `totalExpenses` alongside purchase order expenses
- This ensures manually recorded expenses (utilities, salaries, etc.) are counted

### Step 5: Set Dashboard to Current Month by Default
- Pass `startOfMonth(new Date())` and `new Date()` to `useFinancialSummary()` in `Dashboard.tsx` so the revenue card shows current month totals instead of all-time

---

## Files to Change

| File | Change |
|------|--------|
| `src/pages/MinimarketPage.tsx` | Replace mock sales with DB query for stats |
| `src/hooks/useMinimarket.ts` | Add `useMinimarketSales()` query hook |
| `src/hooks/useRestaurant.ts` | Add financial invalidation to create/update order |
| `src/hooks/useReservations.ts` | Add financial invalidation to create/update reservation |
| `src/types/financials.ts` | Add `minimarket` field to `RevenueData` |
| `src/hooks/useFinancials.ts` | Separate minimarket from services in revenue data; include transaction-table debits in expenses |
| `src/pages/FinancialsPage.tsx` | Add minimarket as separate area in chart |
| `src/pages/Dashboard.tsx` | Default financial summary to current month |

