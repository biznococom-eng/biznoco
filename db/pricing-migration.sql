-- =============================================================================
-- Pricing migration: đổi subscription_tier từ free/pro/enterprise → free/base/ultra
-- Chạy trong Supabase SQL Editor.
-- =============================================================================

-- 1. Migrate dữ liệu cũ sang tier mới trước khi đổi constraint
update public.users
  set subscription_tier = 'base'
  where subscription_tier = 'pro';

update public.users
  set subscription_tier = 'ultra'
  where subscription_tier = 'enterprise';

-- 2. Drop constraint cũ
alter table public.users
  drop constraint if exists users_subscription_tier_check;

-- 3. Thêm constraint mới
alter table public.users
  add constraint users_subscription_tier_check
  check (subscription_tier in ('free', 'base', 'ultra'));

-- 4. Cập nhật default (vẫn là 'free')
alter table public.users
  alter column subscription_tier set default 'free';

-- Done
comment on column public.users.subscription_tier is
  'Gói dịch vụ: free (1 chiến dịch), base ($10/th — 10 chiến dịch + lịch sử + PDF + AI), ultra ($15/th — không giới hạn)';
