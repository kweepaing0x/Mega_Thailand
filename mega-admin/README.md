# Mega Thailand — Admin Panel

Next.js 14 admin panel for the Mega Thailand Myanmar-Thai dropshipping platform.

## Stack
- **Next.js 14** (App Router)
- **Tailwind CSS** (dark theme, custom design system)
- **Supabase** (auth + database + storage)
- **TypeScript**

## Pages
| Route | Description |
|-------|-------------|
| `/login` | Admin login (email + password) |
| `/dashboard` | Stats overview + recent orders |
| `/dashboard/videos` | List, publish/unpublish, delete videos |
| `/dashboard/videos/new` | Upload video + tag products |
| `/dashboard/products` | Edit products, prices, stock status |
| `/dashboard/users` | Manage users, set business accounts |
| `/dashboard/orders` | View & update order status |
| `/dashboard/settings` | Exchange rate, verified badge, Telegram fallback |

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
```bash
cp .env.local.example .env.local
```
Then fill in your Supabase project URL and anon key from:
**Supabase Dashboard → Settings → API**

### 3. Set up the database
Run `schema.sql` in Supabase SQL Editor (the file from this project).

### 4. Create storage buckets
In Supabase Dashboard → Storage, create these public buckets:
- `videos`
- `thumbnails`
- `product-images`
- `avatars`

### 5. Create admin user
1. Go to Supabase Dashboard → Authentication → Users → Add User
2. Create user with your email and password
3. In SQL Editor, run:
```sql
update profiles set role = 'admin' where email = 'your@email.com';
```

### 6. Enable Google Auth (optional)
Supabase Dashboard → Authentication → Providers → Google

### 7. Run locally
```bash
npm run dev
```
Open http://localhost:3000

### 8. Deploy to Vercel
```bash
npx vercel --prod
```
Add environment variables in Vercel dashboard.

## Language Toggle
The sidebar has an EN/မြန်မာ toggle that switches all UI labels between English and Myanmar (Burmese). The language preference is stored in component state — no page reload needed.

## Exchange Rate Logic
- All product prices are stored in THB (source of truth)
- MMK price is always computed live: `price_thb × exchange_rate_thb_mmk`
- The Settings page has a live preview table showing THB → MMK conversions
- Orders snapshot the rate at time of order so historical records are accurate

## Notes
- The `original_link` field is admin-only and protected by Supabase RLS
- Guest orders (no account) are supported — `buyer_id` can be null
- Password reset uses Supabase Admin API — only works when called server-side in production
