# Malik's Polyclinic - Ayurveda & Homeopathy Store

A modern e-commerce platform for Ayurvedic and Homeopathic products with a comprehensive admin dashboard. Built with React 19, Vite, Tailwind CSS, and Supabase.

## 🏥 About

Malik's Polyclinic is a clinical-grade e-commerce store specializing in:
- **Ayurvedic formulations** - Traditional herbal wellness products
- **Homeopathic remedies** - Diluted natural medicines
- **Clinical consultations** - Appointment booking with practitioners
- **Prescription management** - Doctor-prescribed product ordering

## ✨ Features

### Customer-Facing
- **Product Catalog** - Browse Ayurvedic & Homeopathic products with filtering
- **Shopping Cart** - Persistent cart with localStorage sync
- **Checkout** - Multiple payment methods (UPI, Net Banking, COD)
- **Order Tracking** - Real-time order status updates
- **Appointments** - Book consultations with clinic doctors
- **Coupons & Discounts** - Promotional codes support
- **Tax Invoices** - GST-compliant invoice generation
- **Notifications** - Toast notifications for user actions

### Admin Dashboard
- **Order Management** - Accept, ship, deliver, cancel orders
- **Payment Verification** - Verify/deny payment proofs
- **Product Management** - CRUD products with categories
- **Category Management** - Organize products (Ayurvedic/Homeopathic)
- **Coupon Management** - Create/edit/delete promotional codes
- **Clinic Settings** - Configure clinic info, shipping fees
- **Analytics/Insights** - Sales charts, order metrics
- **Admin Authentication** - Supabase Auth with role-based access
- **Action Audit Log** - Track all admin actions with timestamps

### Technical
- **Supabase Integration** - Auth, Database, Realtime ready
- **Admin Action Logging** - All mutations tracked with identity verification
- **Responsive Design** - Mobile-first with Tailwind CSS
- **TypeScript-ready** - JSDoc types throughout
- **ESLint + Oxlint** - Code quality enforcement

## 🛠 Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19, Vite 8 |
| Styling | Tailwind CSS 4 |
| Icons | Lucide React |
| Backend | Supabase (Auth, Database, Realtime) |
| State | React Context + localStorage |
| Linting | Oxlint |
| Build | Vite (Rolldown) |

## 📦 Project Structure

```
ayurveda-homeopathy-store/
├── public/                 # Static assets
├── src/
│   ├── admin/             # Admin dashboard pages
│   │   ├── AdminAuthGuard.jsx    # Auth protection wrapper
│   │   ├── AdminInsights.jsx     # Analytics dashboard
│   │   ├── AdminLogin.jsx        # Admin login
│   │   ├── AdminManagement.jsx   # Categories/Coupons/Settings
│   │   ├── AdminOrders.jsx       # Order management
│   │   ├── AdminProducts.jsx     # Product management
│   │   └── AdminSignup.jsx       # Admin registration
│   ├── components/        # Reusable UI components
│   │   ├── Appointment.jsx       # Booking widget
│   │   ├── CartDrawer.jsx        # Slide-out cart
│   │   ├── Checkout.jsx          # Multi-step checkout
│   │   ├── Footer.jsx            # Site footer
│   │   ├── Hero.jsx              # Landing hero
│   │   ├── InvoiceModal.jsx      # Order invoice
│   │   ├── Navbar.jsx            # Navigation header
│   │   ├── NotificationBell.jsx  # Notification dropdown
│   │   ├── ProductCard.jsx       # Product display
│   │   ├── Products.jsx          # Product grid/filter
│   │   └── ...
│   ├── context/           # React Context providers
│   │   ├── AuthContext.jsx       # Supabase auth state
│   │   ├── CartContext.jsx       # Shopping cart state
│   │   └── NotificationContext.jsx # Toast notifications
│   ├── pages/             # Route pages
│   │   ├── OrderDetails.jsx      # Order view
│   │   ├── Orders.jsx            # Order history
│   │   ├── ProductDetails.jsx    # Product page
│   │   └── ...
│   ├── services/          # Business logic
│   │   └── adminOrderService.js  # Admin order operations
│   ├── utils/             # Utilities & helpers
│   │   ├── adminActionLog.js     # Admin audit logging
│   │   ├── adminAuth.js          # Server-side admin verification
│   │   ├── adminManagementStorage.js # Categories/Coupons/Settings
│   │   ├── orderStorage.js       # Order localStorage ops
│   │   └── productStorage.js     # Product localStorage ops
│   ├── supabaseClient.js   # Supabase client init
│   ├── App.jsx            # Root component + routing
│   └── main.jsx           # Entry point
├── .env                    # Supabase credentials (NOT committed)
├── .env.example           # Template for .env
├── .gitignore             # Git ignore rules
├── package.json
└── vite.config.js
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm/yarn/pnpm
- Supabase account

### Installation

```bash
# Clone and enter project
cd ayurveda-homeopathy-store

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Add your Supabase credentials to .env
# VITE_SUPABASE_URL=https://your-project.supabase.co
# VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key

# Start development server
npm run dev
```

### Build for Production

```bash
npm run build
npm run preview  # Preview production build
```

### Linting

```bash
npm run lint
```

## 🔐 Environment Variables

Create `.env` from `.env.example`:

```env
# Supabase Configuration (REQUIRED)
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key

# ⚠️ NEVER commit .env - it's in .gitignore
# ⚠️ NEVER add SUPABASE_SECRET_KEY to frontend .env
```

### Supabase Setup
1. Create project at [supabase.com](https://supabase.com)
2. Get Project URL & Anon Key from **Settings → API**
3. Enable **Email Auth** in **Authentication → Providers**
4. (Optional) Create tables for orders, products, etc. - see [Database Schema](#database-schema)

## 🗄 Database Schema (Supabase)

> Tables don't exist yet - currently using localStorage. Run these in Supabase SQL Editor when ready to migrate.

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Products
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  category TEXT NOT NULL, -- 'Ayurvedic' | 'Homeopathic'
  image_url TEXT,
  stock INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Categories
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders
CREATE TABLE orders (
  id TEXT PRIMARY KEY, -- e.g., ORD-26-27-0001
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  delivery_address JSONB NOT NULL,
  items JSONB NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  shipping DECIMAL(10,2) DEFAULT 0,
  tax DECIMAL(10,2) DEFAULT 0,
  discount DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  payment JSONB NOT NULL,
  order_status TEXT NOT NULL DEFAULT 'PENDING', -- PENDING|CONFIRMED|SHIPPED|DELIVERED|CANCELLED
  status_history JSONB DEFAULT '[]',
  cancellation JSONB DEFAULT '{"cancelled":false,"reason":"","cancelled_at":null}',
  notes TEXT,
  coupon_code TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Coupons
CREATE TABLE coupons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percent','fixed')),
  value DECIMAL(10,2) NOT NULL,
  active BOOLEAN DEFAULT true,
  expires_on DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Clinic Settings (single row)
CREATE TABLE clinic_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_name TEXT NOT NULL DEFAULT 'Malik''s Polyclinic',
  support_phone TEXT,
  support_email TEXT,
  order_shipping_fee DECIMAL(10,2) DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Admin Action Log
CREATE TABLE admin_action_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id TEXT NOT NULL,
  admin_email TEXT NOT NULL,
  action_type TEXT NOT NULL,
  target_id TEXT,
  target_type TEXT,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinic_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_action_log ENABLE ROW LEVEL SECURITY;

-- Public read policies
CREATE POLICY "Public read products" ON products FOR SELECT USING (active = true);
CREATE POLICY "Public read categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Public read coupons" ON coupons FOR SELECT USING (active = true AND (expires_on IS NULL OR expires_on >= CURRENT_DATE));
CREATE POLICY "Public read clinic settings" ON clinic_settings FOR SELECT USING (true);

-- Admin policies (require authenticated admin)
CREATE POLICY "Admin full access products" ON products FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access categories" ON categories FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access orders" ON orders FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access coupons" ON coupons FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access settings" ON clinic_settings FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin read action log" ON admin_action_log FOR SELECT USING (auth.role() = 'authenticated');
```

## 🔑 Admin Access

### Default Demo Admin
- **Email:** `admin@malikspolyclinic.com`
- **Password:** `Admin@123` or `Admin@2026`

### Create New Admin
1. Go to `/admin/signup`
2. Enter clinic passcode: `MALIK2026` (configurable via `CLINIC_ADMIN_SECRET_KEY`)
3. Fill registration form

### Admin Roles
| Role | Permissions |
|------|-------------|
| Lead Medical Officer (Doctor) | Full access |
| Chief Pharmacy Administrator | Full access |
| Clinical Operations Manager | Orders, Products |
| Healthcare Inventory Specialist | Products, Categories |
| Frontdesk Clinical Administrator | Orders, Coupons |

## 📋 Admin Action Logging

All admin mutations are logged with:
- **Admin identity** (verified against current session)
- **Action type** (order_accept, payment_verify, category_add, etc.)
- **Target** (order ID, category ID, etc.)
- **Details** (before/after values)
- **Timestamp**

Access via `getAdminActionLog()` in `src/utils/adminActionLog.js`

## 🛡 Security

- **Admin verification** - Every mutating action validates session matches provided identity
- **RLS policies** - Database-level access control (when migrated)
- **No secret keys in frontend** - Only publishable anon key exposed
- **Input validation** - Server-side validation in storage utilities
- **XSS protection** - React's built-in escaping

## 📱 Responsive Breakpoints

| Breakpoint | Width | Usage |
|------------|-------|-------|
| `sm` | 640px | Tablet portrait |
| `md` | 768px | Tablet landscape |
| `lg` | 1024px | Desktop |
| `xl` | 1280px | Large desktop |
| `2xl` | 1536px | Ultra-wide |

## 🧪 Testing Admin Features

```bash
# 1. Start dev server
npm run dev

# 2. Open http://localhost:5173/admin/login
# 3. Use demo credentials or signup with passcode MALIK2026
# 4. Test order management, products, categories, coupons, settings
# 5. Check Supabase Dashboard → Authentication → Users for created admins
```

## 📄 License

Private - Malik's Polyclinic proprietary software.

## 🤝 Contributing

Internal project - not accepting external contributions.

## 📞 Support

For technical issues, contact the development team.