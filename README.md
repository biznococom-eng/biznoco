# Biznoco — Creative Analytics cho Facebook Ads

SaaS phân tích hiệu suất video/hình ảnh quảng cáo Facebook. Hook Rate, Hold Rate, ROAS — biết ngay creative nào đáng scale, cái nào đang đốt ngân sách.

🌐 **Live**: https://app.biznoco.com

## Tech stack

- **Next.js 15** App Router + React 19 + TypeScript
- **Tailwind CSS** + **Shadcn/ui** primitives
- **Recharts** cho biểu đồ
- **Supabase** PostgreSQL + Auth (magic link)
- Deploy trên **Vercel**

## Setup local

```bash
git clone https://github.com/biznococom-eng/biznoco
cd biznoco
npm install
cp .env.example .env.local
```

Điền `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
NEXT_PUBLIC_DEMO_ACCOUNT_ID=00000000-0000-0000-0000-000000000001
```

Không có Supabase? App tự fallback **mock mode** với 12 ads demo.

```bash
npm run dev      # http://localhost:3035
```

## Supabase setup

### 1. Tạo schema

Vào Supabase SQL Editor → paste & chạy file `db/schema.sql`. Tạo:

- Tables: `users`, `accounts`, `creative_stats`
- View: `creative_metrics` (KPI tính sẵn)
- RPC: `get_creative_summary(account, start, end)` (aggregate per ad)
- RLS policies (mỗi user chỉ thấy row của mình)
- Trigger `handle_new_user` (auto-create profile khi signup)

### 2. Seed mock data

```bash
# .env.local thêm:
SUPABASE_SERVICE_ROLE_KEY=eyJ...        # service_role key (Settings → API)
SEED_ACCOUNT_ID=<UUID row trong accounts>

npm install -D tsx dotenv
npx tsx scripts/seed-supabase.ts
```

Script idempotent — chạy lại sẽ upsert, không trùng.

### 3. Tạo account row đầu tiên

Trước khi seed, cần ít nhất 1 row trong table `accounts`. Insert qua Supabase Studio:

```sql
insert into public.accounts (user_id, fb_ad_account_id, account_name)
values ('<auth-user-uuid>', 'act_demo', 'Demo Account')
returning id;
```

Copy `id` UUID vào `SEED_ACCOUNT_ID` + `NEXT_PUBLIC_DEMO_ACCOUNT_ID`.

## Cấu trúc thư mục

```
src/
├── app/
│   ├── layout.tsx              Root HTML
│   ├── page.tsx                Landing
│   ├── globals.css             Tailwind + theme tokens
│   ├── (auth)/                 Route group, layout centered
│   │   ├── login/page.tsx      Magic link login
│   │   └── signup/page.tsx     Magic link signup
│   ├── auth/
│   │   ├── callback/route.ts   Exchange code → session
│   │   └── signout/route.ts    Clear session
│   └── (dashboard)/            Route group, sidebar + topbar
│       ├── layout.tsx
│       ├── creatives/
│       │   ├── page.tsx        Grid dashboard
│       │   └── [ad_id]/page.tsx Detail page
│       └── accounts/page.tsx   Manage FB Ad Accounts
├── components/
│   ├── ui/                     Shadcn primitives
│   ├── auth/AuthForm.tsx       Shared login/signup form
│   ├── dashboard/              Sidebar + Topbar
│   └── creatives/              Cards, charts, filters
├── hooks/
│   ├── useCreatives.ts         Hook fetch grid
│   └── useCreativeDetail.ts    Hook fetch detail
├── services/
│   └── creativeService.ts      Supabase queries
├── lib/
│   ├── supabase/{client,server,middleware,types}.ts
│   ├── creative-aggregator.ts  Pure aggregation logic
│   └── utils.ts                cn() helper
├── mock/creative-stats.ts      12 ads × 14 days mock
└── middleware.ts               Auth route protection

db/schema.sql                   Supabase schema (chạy 1 lần trong SQL Editor)
scripts/seed-supabase.ts        Upload mock data lên DB
```

## Routes

| Route | Loại | Mô tả |
|---|---|---|
| `/` | Public | Landing marketing |
| `/login` | Public | Magic link login |
| `/signup` | Public | Magic link signup |
| `/auth/callback` | API | Exchange code → session |
| `/auth/signout` | API | Logout |
| `/creatives` | Protected | Dashboard chính |
| `/creatives/[ad_id]` | Protected | Detail per-day + funnel |
| `/accounts` | Protected | Quản lý FB Ad Accounts |

## Phát triển

```bash
npm run dev        # dev server tại :3035
npm run build      # production build
npm start          # serve production
```

## Deploy

App đã deploy tự động lên Vercel khi push lên `main`. Manual deploy:

```bash
vercel --prod --yes
```

## License

Private — © 2026 Biznoco.
