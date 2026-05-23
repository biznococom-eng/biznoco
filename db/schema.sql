-- =============================================================================
-- Facebook Creative Analytics Dashboard — Supabase / PostgreSQL schema
-- Chạy tuần tự trong Supabase SQL Editor. Idempotent: an toàn khi chạy lại.
-- =============================================================================

-- 0. Extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- =============================================================================
-- 1. USERS — extends auth.users (Supabase Auth)
-- =============================================================================
create table if not exists public.users (
  id              uuid primary key references auth.users(id) on delete cascade,
  email           text unique not null,
  full_name       text,
  company_name    text,
  avatar_url      text,
  subscription_tier text not null default 'free'
                    check (subscription_tier in ('free','pro','enterprise')),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

comment on table public.users is
  'Profile mở rộng của auth.users — chủ doanh nghiệp dùng dashboard';

-- Tự tạo row trong public.users khi có signup mới ở auth.users
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =============================================================================
-- 2. ACCOUNTS — Facebook Ad Accounts liên kết với user
-- =============================================================================
create table if not exists public.accounts (
  id                uuid primary key default uuid_generate_v4(),
  user_id           uuid not null references public.users(id) on delete cascade,

  -- Facebook side
  fb_ad_account_id  text not null,                      -- "act_1234567890"
  fb_business_id    text,
  account_name      text not null,
  currency          char(3) default 'USD',
  timezone_name     text default 'Asia/Ho_Chi_Minh',

  -- OAuth token (KHUYẾN NGHỊ: dùng Supabase Vault hoặc mã hoá ở app layer;
  -- không lưu plain trên cột này ở production)
  access_token      text,
  token_expires_at  timestamptz,

  status            text not null default 'active'
                      check (status in ('active','paused','disconnected','error')),
  last_synced_at    timestamptz,

  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),

  unique (user_id, fb_ad_account_id)
);

create index if not exists idx_accounts_user_id
  on public.accounts (user_id);
create index if not exists idx_accounts_active
  on public.accounts (user_id) where status = 'active';

comment on table public.accounts is
  'Facebook Ad Account liên kết với user — token cache để sync từ Meta Marketing API';

-- =============================================================================
-- 3. CREATIVE_STATS — raw daily insights từ Meta Marketing API
-- (level=ad, breakdowns=daily, fields=...)
-- =============================================================================
create table if not exists public.creative_stats (
  id              uuid primary key default uuid_generate_v4(),
  account_id      uuid not null references public.accounts(id) on delete cascade,

  -- Time dimension
  date            date not null,

  -- Creative metadata
  ad_id           text not null,
  ad_name         text,
  adset_id        text,
  adset_name      text,
  campaign_id     text,
  campaign_name   text,

  -- Creative content
  thumbnail_url   text,
  video_url       text,
  creative_type   text check (creative_type in ('image','video','carousel','collection','unknown')),

  -- Cost & delivery
  spend                  numeric(14, 4) not null default 0,
  impressions            bigint        not null default 0,
  reach                  bigint        default 0,
  frequency              numeric(8, 4) default 0,

  -- Clicks
  clicks                 bigint not null default 0,   -- all clicks
  inline_link_clicks     bigint not null default 0,   -- link clicks (chuẩn cho CTR)

  -- Video engagement funnel
  video_3s_view          bigint default 0,
  video_p25_view         bigint default 0,
  video_p50_view         bigint default 0,
  video_p75_view         bigint default 0,
  video_p100_view        bigint default 0,
  video_avg_time_watched numeric(8, 2) default 0,     -- seconds

  -- Conversions (optional, hay cần cho ROAS)
  purchases              bigint default 0,
  purchase_value         numeric(14, 4) default 0,

  created_at             timestamptz not null default now(),

  unique (account_id, ad_id, date)                    -- để upsert ON CONFLICT
);

create index if not exists idx_cs_account_date
  on public.creative_stats (account_id, date desc);
create index if not exists idx_cs_account_ad
  on public.creative_stats (account_id, ad_id);
create index if not exists idx_cs_account_campaign
  on public.creative_stats (account_id, campaign_id);

comment on table public.creative_stats is
  'Raw daily insights từ Meta Marketing API (level=ad, breakdowns=daily)';

-- =============================================================================
-- 4. VIEW: creative_metrics — KPI tính sẵn theo từng row (per ad per day)
-- =============================================================================
create or replace view public.creative_metrics as
select
  cs.id,
  cs.account_id,
  cs.date,
  cs.ad_id,
  cs.ad_name,
  cs.adset_id,
  cs.adset_name,
  cs.campaign_id,
  cs.campaign_name,
  cs.creative_type,
  cs.thumbnail_url,
  cs.video_url,

  -- Raw passthrough
  cs.spend,
  cs.impressions,
  cs.reach,
  cs.frequency,
  cs.clicks,
  cs.inline_link_clicks,
  cs.video_3s_view,
  cs.video_p25_view,
  cs.video_p50_view,
  cs.video_p75_view,
  cs.video_p100_view,
  cs.video_avg_time_watched,
  cs.purchases,
  cs.purchase_value,

  -- ── Engagement KPIs ────────────────────────────────────────────────────────
  -- Hook Rate: bao nhiêu % người xem video tới giây 3 (giữ chân ban đầu)
  round( (cs.video_3s_view::numeric  / nullif(cs.impressions, 0))  * 100, 2)
    as hook_rate,

  -- Hold Rate: trong số người vượt 3s, bao nhiêu % vào được mốc 25%
  round( (cs.video_p25_view::numeric / nullif(cs.video_3s_view, 0)) * 100, 2)
    as hold_rate,

  -- Completion Rate: % người xem hết 100% / xem >= 3s
  round( (cs.video_p100_view::numeric / nullif(cs.video_3s_view, 0)) * 100, 2)
    as completion_rate,

  -- ── Click KPIs ─────────────────────────────────────────────────────────────
  -- CTR (link clicks ─ chuẩn cho conversion campaigns)
  round( (cs.inline_link_clicks::numeric / nullif(cs.impressions, 0)) * 100, 2)
    as ctr_link,

  -- CTR (all clicks ─ bao gồm comment/page-like)
  round( (cs.clicks::numeric / nullif(cs.impressions, 0)) * 100, 2)
    as ctr_all,

  -- ── Cost KPIs ──────────────────────────────────────────────────────────────
  round( cs.spend / nullif(cs.inline_link_clicks, 0), 4) as cpc_link,
  round( cs.spend / nullif(cs.clicks, 0),             4) as cpc_all,
  round( (cs.spend / nullif(cs.impressions, 0)) * 1000, 4) as cpm,

  -- ROAS = doanh thu / chi phí (lần)
  round( cs.purchase_value / nullif(cs.spend, 0), 4) as roas
from public.creative_stats cs;

-- View kế thừa RLS từ bảng nền (Postgres 15+)
alter view public.creative_metrics set (security_invoker = true);

comment on view public.creative_metrics is
  'KPI tính sẵn cho từng ad theo từng ngày — frontend SELECT trực tiếp không cần tính JS';

-- =============================================================================
-- 5. RPC: get_creative_summary — tổng hợp theo creative trong khoảng ngày
-- LƯU Ý: phải SUM trước rồi mới chia, KHÔNG trung bình hook_rate các ngày.
-- =============================================================================
create or replace function public.get_creative_summary(
  p_account_id uuid,
  p_start_date date default (current_date - interval '30 days')::date,
  p_end_date   date default current_date
)
returns table (
  ad_id              text,
  ad_name            text,
  campaign_name      text,
  thumbnail_url      text,
  video_url          text,
  creative_type      text,

  total_spend          numeric,
  total_impressions    bigint,
  total_clicks         bigint,
  total_link_clicks    bigint,
  total_3s_views       bigint,
  total_p25_views      bigint,
  total_p50_views      bigint,
  total_p75_views      bigint,
  total_p100_views     bigint,
  total_purchases      bigint,
  total_purchase_value numeric,

  hook_rate        numeric,
  hold_rate        numeric,
  completion_rate  numeric,
  ctr_link         numeric,
  ctr_all          numeric,
  cpc_link         numeric,
  cpm              numeric,
  roas             numeric
)
language sql
stable
security invoker
set search_path = public
as $$
  select
    cs.ad_id,
    max(cs.ad_name)        as ad_name,
    max(cs.campaign_name)  as campaign_name,
    max(cs.thumbnail_url)  as thumbnail_url,
    max(cs.video_url)      as video_url,
    max(cs.creative_type)  as creative_type,

    sum(cs.spend)               as total_spend,
    sum(cs.impressions)         as total_impressions,
    sum(cs.clicks)              as total_clicks,
    sum(cs.inline_link_clicks)  as total_link_clicks,
    sum(cs.video_3s_view)       as total_3s_views,
    sum(cs.video_p25_view)      as total_p25_views,
    sum(cs.video_p50_view)      as total_p50_views,
    sum(cs.video_p75_view)      as total_p75_views,
    sum(cs.video_p100_view)     as total_p100_views,
    sum(cs.purchases)           as total_purchases,
    sum(cs.purchase_value)      as total_purchase_value,

    round( (sum(cs.video_3s_view)::numeric  / nullif(sum(cs.impressions), 0))   * 100, 2) as hook_rate,
    round( (sum(cs.video_p25_view)::numeric / nullif(sum(cs.video_3s_view), 0)) * 100, 2) as hold_rate,
    round( (sum(cs.video_p100_view)::numeric/ nullif(sum(cs.video_3s_view), 0)) * 100, 2) as completion_rate,
    round( (sum(cs.inline_link_clicks)::numeric / nullif(sum(cs.impressions), 0)) * 100, 2) as ctr_link,
    round( (sum(cs.clicks)::numeric / nullif(sum(cs.impressions), 0)) * 100, 2) as ctr_all,
    round(  sum(cs.spend) / nullif(sum(cs.inline_link_clicks), 0), 4) as cpc_link,
    round( (sum(cs.spend) / nullif(sum(cs.impressions), 0)) * 1000, 4) as cpm,
    round(  sum(cs.purchase_value) / nullif(sum(cs.spend), 0), 4) as roas
  from public.creative_stats cs
  where cs.account_id = p_account_id
    and cs.date between p_start_date and p_end_date
  group by cs.ad_id
  order by sum(cs.spend) desc;
$$;

comment on function public.get_creative_summary(uuid, date, date) is
  'Tổng hợp KPI theo từng creative trong khoảng ngày — gọi: select * from get_creative_summary(account_uuid, ''2026-04-01'', ''2026-04-30'')';

-- =============================================================================
-- 6. Helper trigger: auto update updated_at
-- =============================================================================
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_users_updated_at on public.users;
create trigger trg_users_updated_at
  before update on public.users
  for each row execute function public.set_updated_at();

drop trigger if exists trg_accounts_updated_at on public.accounts;
create trigger trg_accounts_updated_at
  before update on public.accounts
  for each row execute function public.set_updated_at();

-- =============================================================================
-- 7. Row Level Security — mỗi user chỉ thấy dữ liệu của chính mình
-- =============================================================================
alter table public.users          enable row level security;
alter table public.accounts       enable row level security;
alter table public.creative_stats enable row level security;

-- users
drop policy if exists "users_select_own" on public.users;
create policy "users_select_own" on public.users
  for select using (auth.uid() = id);

drop policy if exists "users_update_own" on public.users;
create policy "users_update_own" on public.users
  for update using (auth.uid() = id);

-- accounts
drop policy if exists "accounts_select_own" on public.accounts;
create policy "accounts_select_own" on public.accounts
  for select using (auth.uid() = user_id);

drop policy if exists "accounts_insert_own" on public.accounts;
create policy "accounts_insert_own" on public.accounts
  for insert with check (auth.uid() = user_id);

drop policy if exists "accounts_update_own" on public.accounts;
create policy "accounts_update_own" on public.accounts
  for update using (auth.uid() = user_id);

drop policy if exists "accounts_delete_own" on public.accounts;
create policy "accounts_delete_own" on public.accounts
  for delete using (auth.uid() = user_id);

-- creative_stats: ownership đi qua accounts
drop policy if exists "cs_select_via_account" on public.creative_stats;
create policy "cs_select_via_account" on public.creative_stats
  for select using (
    exists (select 1 from public.accounts a
            where a.id = creative_stats.account_id and a.user_id = auth.uid())
  );

drop policy if exists "cs_insert_via_account" on public.creative_stats;
create policy "cs_insert_via_account" on public.creative_stats
  for insert with check (
    exists (select 1 from public.accounts a
            where a.id = creative_stats.account_id and a.user_id = auth.uid())
  );

drop policy if exists "cs_update_via_account" on public.creative_stats;
create policy "cs_update_via_account" on public.creative_stats
  for update using (
    exists (select 1 from public.accounts a
            where a.id = creative_stats.account_id and a.user_id = auth.uid())
  );

drop policy if exists "cs_delete_via_account" on public.creative_stats;
create policy "cs_delete_via_account" on public.creative_stats
  for delete using (
    exists (select 1 from public.accounts a
            where a.id = creative_stats.account_id and a.user_id = auth.uid())
  );

-- =============================================================================
-- 8. Grants — frontend (anon/authenticated) chỉ cần đụng tới view + RPC
-- =============================================================================
grant usage  on schema public to anon, authenticated;
grant select on public.users          to authenticated;
grant select, insert, update, delete on public.accounts       to authenticated;
grant select, insert, update, delete on public.creative_stats to authenticated;
grant select on public.creative_metrics to authenticated;
grant execute on function public.get_creative_summary(uuid, date, date) to authenticated;

-- =============================================================================
-- DONE. Chạy xong → check Tables (users/accounts/creative_stats),
-- Views (creative_metrics), Functions (get_creative_summary, handle_new_user,
-- set_updated_at), và Policies trong Supabase Studio.
-- =============================================================================
