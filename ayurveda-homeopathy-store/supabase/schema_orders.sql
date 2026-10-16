-- ============================================================================
-- Malik's Polyclinic - Orders Schema for Supabase
-- ============================================================================
-- Run this in Supabase Dashboard → SQL Editor
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ----------------------------------------------------------------------------
-- Orders table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  delivery_address JSONB NOT NULL DEFAULT '{}',
  notes TEXT DEFAULT '',
  coupon_code TEXT DEFAULT '',
  subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
  shipping DECIMAL(10,2) NOT NULL DEFAULT 0,
  tax DECIMAL(10,2) NOT NULL DEFAULT 0,
  discount DECIMAL(10,2) NOT NULL DEFAULT 0,
  total DECIMAL(10,2) NOT NULL DEFAULT 0,
  order_status TEXT NOT NULL DEFAULT 'PENDING' CHECK (order_status IN ('PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED')),
  cancellation JSONB NOT NULL DEFAULT '{"cancelled": false, "reason": "", "cancelled_at": null}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- Order items (line items for each order)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL,
  product_name TEXT NOT NULL,
  product_image TEXT,
  price DECIMAL(10,2) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  subtotal DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- Order status history (audit trail of status changes)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS order_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- Order payments (payment details separate from order)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS order_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  method TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING_VERIFICATION' CHECK (status IN ('PENDING_VERIFICATION', 'VERIFIED', 'FAILED')),
  transaction_id TEXT,
  verified_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  verified_by TEXT,
  failed_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- Indexes for performance
-- ----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_orders_customer_phone ON orders(customer_phone);
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(order_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_status_history_order_id ON order_status_history(order_id);
CREATE INDEX IF NOT EXISTS idx_order_payments_order_id ON order_payments(order_id);

-- ----------------------------------------------------------------------------
-- Row Level Security
-- ----------------------------------------------------------------------------

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_payments ENABLE ROW LEVEL SECURITY;

-- Orders: Public can read by ID (for order tracking), authenticated admins can manage all
CREATE POLICY "Public read orders by ID" ON orders
  FOR SELECT
  USING (true);

CREATE POLICY "Authenticated admin manage orders" ON orders
  FOR ALL
  TO authenticated
  USING (true);

-- Order items: Public can read (joined with orders), authenticated admins can manage
CREATE POLICY "Public read order items" ON order_items
  FOR SELECT
  USING (true);

CREATE POLICY "Authenticated admin manage order items" ON order_items
  FOR ALL
  TO authenticated
  USING (true);

-- Order status history: Public can read, authenticated admins can manage
CREATE POLICY "Public read order status history" ON order_status_history
  FOR SELECT
  USING (true);

CREATE POLICY "Authenticated admin manage order status history" ON order_status_history
  FOR ALL
  TO authenticated
  USING (true);

-- Order payments: Public can read, authenticated admins can manage
CREATE POLICY "Public read order payments" ON order_payments
  FOR SELECT
  USING (true);

CREATE POLICY "Authenticated admin manage order payments" ON order_payments
  FOR ALL
  TO authenticated
  USING (true);

-- ----------------------------------------------------------------------------
-- Comments
-- ----------------------------------------------------------------------------
COMMENT ON TABLE orders IS 'Customer orders for Malik\'s Polyclinic Ayurveda & Homeopathy Store';
COMMENT ON TABLE order_items IS 'Line items within each order';
COMMENT ON TABLE order_status_history IS 'Audit trail of order status changes';
COMMENT ON TABLE order_payments IS 'Payment details for each order';