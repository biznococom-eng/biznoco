-- =============================================================================
-- Campaign-level analytics + Demographics breakdowns + Meta token storage
-- Idempotent. Chạy SAU schema.sql + activation.sql.
-- =============================================================================

-- ── 1. Meta API access token cho account ────────────────────────────────────
-- (cột access_token đã có trong accounts từ schema.sql, thêm metadata)
alter table public.accounts
  add column if not exists meta_business_id text,
  add column if not exists meta_token_user_id text,
  add column if not exists meta_token_scopes text[],
  add column if not exists meta_last_synced_at timestamptz;

-- ── 2. campaigns table ──────────────────────────────────────────────────────
create table if not exists public.campaigns (
  id              uuid primary key default uuid_generate_v4(),
  account_id      uuid not null references public.accounts(id) on delete cascade,

  -- Meta side
  fb_campaign_id  text not null,
  name            text not null,
  objective       text,                    -- CONVERSIONS, MESSAGES, TRAFFIC...
  status          text default 'ACTIVE',   -- ACTIVE / PAUSED / DELETED
  effective_status text,

  -- Budgets
  daily_budget    numeric(14, 2),
  lifetime_budget numeric(14, 2),
  budget_remaining numeric(14, 2),

  -- Dates
  start_time      timestamptz,
  stop_time       timestamptz,
  created_time    timestamptz,
  updated_time    timestamptz,

  -- Metadata
  buying_type     text,                    -- AUCTION / RESERVED
  special_ad_categories text[],

  last_synced_at  timestamptz default now(),

  unique (account_id, fb_campaign_id)
);

create index if not exists idx_campaigns_account on public.campaigns (account_id);
create index if not exists idx_campaigns_status on public.campaigns (account_id, status) where status = 'ACTIVE';

-- ── 3. campaign_daily_stats — overview metrics per campaign per day ────────
create table if not exists public.campaign_daily_stats (
  id              uuid primary key default uuid_generate_v4(),
  campaign_id     uuid not null references public.campaigns(id) on delete cascade,
  account_id      uuid not null references public.accounts(id) on delete cascade,
  date            date not null,

  -- Core delivery
  spend           numeric(14, 4) not null default 0,
  impressions     bigint not null default 0,
  reach           bigint default 0,
  frequency       numeric(8, 4) default 0,

  -- Clicks
  clicks          bigint not null default 0,           -- all clicks
  inline_link_clicks bigint not null default 0,        -- link clicks
  unique_link_clicks bigint default 0,

  -- Messenger / conversation actions
  messaging_conversations_started bigint default 0,    -- onsite_conversion.messaging_conversation_started_7d
  messaging_first_reply bigint default 0,              -- onsite_conversion.messaging_first_reply
  messaging_welcome_views bigint default 0,            -- onsite_conversion.messaging_user_subscribed
  messaging_connects bigint default 0,                 -- onsite_conversion.messaging_block

  -- Standard conversions
  purchases       bigint default 0,
  purchase_value  numeric(14, 4) default 0,
  leads           bigint default 0,
  registrations   bigint default 0,

  created_at      timestamptz not null default now(),

  unique (campaign_id, date)
);

create index if not exists idx_cds_campaign_date on public.campaign_daily_stats (campaign_id, date desc);
create index if not exists idx_cds_account_date on public.campaign_daily_stats (account_id, date desc);

-- ── 4. campaign_demographics — generic breakdown storage ───────────────────
-- Lưu mọi loại breakdown (gender, age, age_gender, region, device, platform)
-- vào 1 bảng để query dễ + dễ thêm breakdown mới.
create table if not exists public.campaign_demographics (
  id              uuid primary key default uuid_generate_v4(),
  campaign_id     uuid not null references public.campaigns(id) on delete cascade,
  account_id      uuid not null references public.accounts(id) on delete cascade,
  date            date not null,

  -- Breakdown dimension
  breakdown_type  text not null check (breakdown_type in (
    'gender', 'age', 'age_gender', 'region', 'country',
    'device_platform', 'publisher_platform', 'platform_position',
    'impression_device', 'dma'
  )),
  -- Composite key value, e.g. "male", "45-54", "male|45-54", "Lâm Đồng", "iphone"
  breakdown_value text not null,
  -- For age_gender: store gender + age separately too for easier query
  gender          text,
  age_range       text,

  -- Metrics
  spend           numeric(14, 4) not null default 0,
  impressions     bigint not null default 0,
  reach           bigint default 0,
  clicks          bigint not null default 0,
  inline_link_clicks bigint not null default 0,

  created_at      timestamptz not null default now(),

  unique (campaign_id, date, breakdown_type, breakdown_value)
);

create index if not exists idx_cd_campaign_type on public.campaign_demographics (campaign_id, breakdown_type);
create index if not exists idx_cd_campaign_date on public.campaign_demographics (campaign_id, date desc);

-- ── 5. campaign_recommendations — output của rule engine, cache ────────────
create table if not exists public.campaign_recommendations (
  id              uuid primary key default uuid_generate_v4(),
  campaign_id     uuid not null references public.campaigns(id) on delete cascade,
  generated_at    timestamptz not null default now(),

  -- Cards JSON: [{ severity, category, title, body, action }, ...]
  cards           jsonb not null default '[]'::jsonb,

  -- Period snapshot dùng để gen cards
  period_start    date,
  period_end      date,

  unique (campaign_id)                              -- 1 latest per campaign
);

create index if not exists idx_cr_campaign on public.campaign_recommendations (campaign_id);

-- ── 6. RLS policies ────────────────────────────────────────────────────────
alter table public.campaigns enable row level security;
alter table public.campaign_daily_stats enable row level security;
alter table public.campaign_demographics enable row level security;
alter table public.campaign_recommendations enable row level security;

-- campaigns: ownership đi qua accounts
drop policy if exists "campaigns_select_via_account" on public.campaigns;
create policy "campaigns_select_via_account" on public.campaigns
  for select using (
    exists (select 1 from public.accounts a where a.id = campaigns.account_id and a.user_id = auth.uid())
  );
drop policy if exists "campaigns_insert_via_account" on public.campaigns;
create policy "campaigns_insert_via_account" on public.campaigns
  for insert with check (
    exists (select 1 from public.accounts a where a.id = campaigns.account_id and a.user_id = auth.uid())
  );
drop policy if exists "campaigns_update_via_account" on public.campaigns;
create policy "campaigns_update_via_account" on public.campaigns
  for update using (
    exists (select 1 from public.accounts a where a.id = campaigns.account_id and a.user_id = auth.uid())
  );
drop policy if exists "campaigns_delete_via_account" on public.campaigns;
create policy "campaigns_delete_via_account" on public.campaigns
  for delete using (
    exists (select 1 from public.accounts a where a.id = campaigns.account_id and a.user_id = auth.uid())
  );

-- Same pattern cho campaign_daily_stats, campaign_demographics, campaign_recommendations
drop policy if exists "cds_select_via_account" on public.campaign_daily_stats;
create policy "cds_select_via_account" on public.campaign_daily_stats
  for select using (
    exists (select 1 from public.accounts a where a.id = campaign_daily_stats.account_id and a.user_id = auth.uid())
  );
drop policy if exists "cds_write_via_account" on public.campaign_daily_stats;
create policy "cds_write_via_account" on public.campaign_daily_stats
  for all using (
    exists (select 1 from public.accounts a where a.id = campaign_daily_stats.account_id and a.user_id = auth.uid())
  );

drop policy if exists "cd_select_via_account" on public.campaign_demographics;
create policy "cd_select_via_account" on public.campaign_demographics
  for select using (
    exists (select 1 from public.accounts a where a.id = campaign_demographics.account_id and a.user_id = auth.uid())
  );
drop policy if exists "cd_write_via_account" on public.campaign_demographics;
create policy "cd_write_via_account" on public.campaign_demographics
  for all using (
    exists (select 1 from public.accounts a where a.id = campaign_demographics.account_id and a.user_id = auth.uid())
  );

drop policy if exists "cr_select_via_account" on public.campaign_recommendations;
create policy "cr_select_via_account" on public.campaign_recommendations
  for select using (
    exists (select 1 from public.campaigns c
      join public.accounts a on a.id = c.account_id
      where c.id = campaign_recommendations.campaign_id and a.user_id = auth.uid())
  );
drop policy if exists "cr_write_via_account" on public.campaign_recommendations;
create policy "cr_write_via_account" on public.campaign_recommendations
  for all using (
    exists (select 1 from public.campaigns c
      join public.accounts a on a.id = c.account_id
      where c.id = campaign_recommendations.campaign_id and a.user_id = auth.uid())
  );

-- ── 7. Grants ──────────────────────────────────────────────────────────────
grant select, insert, update, delete on public.campaigns to authenticated;
grant select, insert, update, delete on public.campaign_daily_stats to authenticated;
grant select, insert, update, delete on public.campaign_demographics to authenticated;
grant select, insert, update, delete on public.campaign_recommendations to authenticated;

-- ── 8. RPC: get_campaign_overview ──────────────────────────────────────────
-- Aggregate daily_stats trong khoảng ngày cho 1 campaign — 8 KPIs Di Linh
create or replace function public.get_campaign_overview(
  p_campaign_id uuid,
  p_start_date date default (current_date - interval '7 days')::date,
  p_end_date date default current_date
)
returns table (
  total_spend         numeric,
  total_impressions   bigint,
  total_reach         bigint,
  avg_frequency       numeric,
  total_clicks        bigint,
  total_link_clicks   bigint,
  total_conversations bigint,
  total_first_replies bigint,
  total_welcome_views bigint,
  total_connects      bigint,
  ctr_link            numeric,
  ctr_all             numeric,
  cpc_link            numeric,
  cpm                 numeric,
  cost_per_conversation numeric,
  days_count          int
)
language sql stable security invoker set search_path = public as $$
  select
    coalesce(sum(spend), 0) as total_spend,
    coalesce(sum(impressions), 0) as total_impressions,
    coalesce(max(reach), 0) as total_reach,  -- reach không additive, lấy max (gần đúng)
    case when sum(impressions) > 0 then sum(impressions)::numeric / nullif(max(reach), 0) else 0 end as avg_frequency,
    coalesce(sum(clicks), 0) as total_clicks,
    coalesce(sum(inline_link_clicks), 0) as total_link_clicks,
    coalesce(sum(messaging_conversations_started), 0) as total_conversations,
    coalesce(sum(messaging_first_reply), 0) as total_first_replies,
    coalesce(sum(messaging_welcome_views), 0) as total_welcome_views,
    coalesce(sum(messaging_connects), 0) as total_connects,
    round((sum(inline_link_clicks)::numeric / nullif(sum(impressions), 0)) * 100, 2) as ctr_link,
    round((sum(clicks)::numeric / nullif(sum(impressions), 0)) * 100, 2) as ctr_all,
    round(sum(spend) / nullif(sum(inline_link_clicks), 0), 2) as cpc_link,
    round((sum(spend) / nullif(sum(impressions), 0)) * 1000, 2) as cpm,
    round(sum(spend) / nullif(sum(messaging_conversations_started), 0), 2) as cost_per_conversation,
    count(distinct date)::int as days_count
  from public.campaign_daily_stats
  where campaign_id = p_campaign_id
    and date between p_start_date and p_end_date;
$$;

grant execute on function public.get_campaign_overview(uuid, date, date) to authenticated;

comment on function public.get_campaign_overview is
  'Tổng hợp 8 KPIs Di Linh-style cho 1 campaign trong khoảng ngày.';

-- ── 9. RPC: get_campaign_demographics ──────────────────────────────────────
-- Aggregate demographics theo breakdown_type
create or replace function public.get_campaign_demographics_breakdown(
  p_campaign_id uuid,
  p_breakdown_type text,
  p_start_date date default (current_date - interval '7 days')::date,
  p_end_date date default current_date
)
returns table (
  breakdown_value text,
  gender          text,
  age_range       text,
  spend           numeric,
  impressions     bigint,
  reach           bigint,
  clicks          bigint,
  inline_link_clicks bigint,
  ctr_link        numeric,
  cpc_link        numeric,
  spend_share     numeric
)
language sql stable security invoker set search_path = public as $$
  with totals as (
    select sum(spend) as total_spend
    from public.campaign_demographics
    where campaign_id = p_campaign_id
      and breakdown_type = p_breakdown_type
      and date between p_start_date and p_end_date
  )
  select
    cd.breakdown_value,
    max(cd.gender) as gender,
    max(cd.age_range) as age_range,
    sum(cd.spend) as spend,
    sum(cd.impressions) as impressions,
    coalesce(sum(cd.reach), 0) as reach,
    sum(cd.clicks) as clicks,
    sum(cd.inline_link_clicks) as inline_link_clicks,
    round((sum(cd.inline_link_clicks)::numeric / nullif(sum(cd.impressions), 0)) * 100, 2) as ctr_link,
    round(sum(cd.spend) / nullif(sum(cd.inline_link_clicks), 0), 2) as cpc_link,
    round((sum(cd.spend) / nullif((select total_spend from totals), 0)) * 100, 2) as spend_share
  from public.campaign_demographics cd
  where cd.campaign_id = p_campaign_id
    and cd.breakdown_type = p_breakdown_type
    and cd.date between p_start_date and p_end_date
  group by cd.breakdown_value
  order by sum(cd.spend) desc;
$$;

grant execute on function public.get_campaign_demographics_breakdown(uuid, text, date, date) to authenticated;

-- ── 10. Trigger updated_at cho campaigns ──────────────────────────────────
create or replace function public.set_campaign_updated()
returns trigger language plpgsql as $$
begin
  new.updated_time = now();
  return new;
end;
$$;

drop trigger if exists trg_campaigns_updated on public.campaigns;
create trigger trg_campaigns_updated
  before update on public.campaigns
  for each row execute function public.set_campaign_updated();

-- =============================================================================
-- DONE.
-- =============================================================================
