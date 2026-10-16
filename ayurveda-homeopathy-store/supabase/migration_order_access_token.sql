-- ============================================================================
-- Security Migration: Order Access Token for Guest Order Retrieval
-- ============================================================================
-- Malik's Polyclinic - Supabase Production Database
-- REVIEW ONLY - Do not execute automatically
-- ============================================================================

-- Step 0: Verify public.is_active_admin() helper exists (run first)
SELECT proname, prosrc
FROM pg_proc
WHERE pronamespace = 'public'::regnamespace
  AND proname = 'is_active_admin';

-- If the above returns no rows, STOP. Create the helper function before proceeding.

-- Step 1: Add order access token columns to orders table
-- These columns store the HMAC hash of the unguessable token issued at checkout.
-- The plain token is returned to the customer once and never stored in plaintext.
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS order_access_token_hash TEXT;

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS order_access_token_expires_at TIMESTAMPTZ;

-- Step 2: Index for fast lookup by token hash
CREATE INDEX IF NOT EXISTS idx_orders_access_token_hash
  ON orders(order_access_token_hash);

-- Step 3: Verify no unsafe policies remain on order tables
SELECT tablename, policyname, cmd, qual, with_check
FROM pg_policies
WHERE tablename IN ('orders', 'order_items', 'order_payments', 'order_status_history')
ORDER BY tablename, policyname;

-- Expected: No policies with USING (true) remaining.
-- All manage policies should use public.is_active_admin().

-- ============================================================================
-- Notes:
-- - The plain order_access_token is generated in the Edge Function, HMAC-hashed
--   with the service-role key, and only the hash is stored in the database.
-- - At retrieval, the submitted token is hashed and compared to the stored hash.
-- - Token expires after 7 days (ORDER_ACCESS_TOKEN_TTL_MS in create-order).
-- - This replaces the insecure phone/email lookup in get-orders.
-- ============================================================================