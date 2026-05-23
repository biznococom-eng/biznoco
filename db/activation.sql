-- =============================================================================
-- Activation Code System
-- Idempotent — chạy được nhiều lần. Áp lên schema chính (db/schema.sql) đã có.
-- =============================================================================

-- 1. Thêm cột is_activated vào public.users
alter table public.users
  add column if not exists is_activated boolean not null default false;

alter table public.users
  add column if not exists activated_at timestamptz;

comment on column public.users.is_activated is
  'TRUE = user đã nhập mã code để mở khóa dashboard. Default FALSE — mọi signup mới bị khóa.';

-- 2. Bảng activation_codes — admin tạo & quản lý
create table if not exists public.activation_codes (
  id          uuid primary key default uuid_generate_v4(),
  code        text unique not null,
  notes       text,                              -- ghi chú (vd: "early-access-batch-1")
  max_uses    int  not null default 1 check (max_uses > 0),
  uses_count  int  not null default 0 check (uses_count >= 0),
  expires_at  timestamptz,                       -- null = không hết hạn
  is_active   boolean not null default true,     -- false = vô hiệu hoá thủ công
  created_at  timestamptz not null default now(),
  created_by  uuid references public.users(id)
);

create index if not exists idx_activation_codes_code on public.activation_codes (code);
create index if not exists idx_activation_codes_active on public.activation_codes (is_active) where is_active = true;

comment on table public.activation_codes is
  'Mã code để user mở khóa dashboard. Admin tạo thủ công qua Supabase Studio.';

-- 3. Bảng activation_redemptions — log mỗi user đã redeem code nào
create table if not exists public.activation_redemptions (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references public.users(id) on delete cascade,
  code_id       uuid not null references public.activation_codes(id) on delete restrict,
  redeemed_at   timestamptz not null default now(),
  unique (user_id)                               -- 1 user chỉ activate 1 lần
);

create index if not exists idx_activation_redemptions_user on public.activation_redemptions (user_id);
create index if not exists idx_activation_redemptions_code on public.activation_redemptions (code_id);

comment on table public.activation_redemptions is
  'Audit log redemption — ai dùng code nào, lúc nào. Có UNIQUE(user_id) để chặn double redeem.';

-- 4. RPC redeem_activation_code — atomic redeem + return user-friendly message
create or replace function public.redeem_activation_code(p_code text)
returns table (success boolean, message text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_code public.activation_codes%rowtype;
  v_normalized text;
begin
  if v_user_id is null then
    return query select false, 'Bạn cần đăng nhập trước.'::text;
    return;
  end if;

  -- Chuẩn hoá code: trim + uppercase để chấp nhận "biz-2026" lẫn "BIZ-2026" lẫn " biz-2026 "
  v_normalized := upper(trim(coalesce(p_code, '')));
  if v_normalized = '' then
    return query select false, 'Vui lòng nhập mã code.'::text;
    return;
  end if;

  -- Check đã activate chưa
  if exists (select 1 from public.activation_redemptions where user_id = v_user_id) then
    return query select false, 'Tài khoản đã được kích hoạt rồi.'::text;
    return;
  end if;

  -- Tìm code (case-insensitive)
  select * into v_code
  from public.activation_codes
  where upper(code) = v_normalized and is_active = true
  limit 1
  for update;

  if not found then
    return query select false, 'Mã code không hợp lệ hoặc đã bị vô hiệu hoá.'::text;
    return;
  end if;

  -- Check hết hạn
  if v_code.expires_at is not null and v_code.expires_at < now() then
    return query select false, 'Mã code đã hết hạn.'::text;
    return;
  end if;

  -- Check đã hết lượt sử dụng
  if v_code.uses_count >= v_code.max_uses then
    return query select false, 'Mã code đã được sử dụng đủ số lượt cho phép.'::text;
    return;
  end if;

  -- Redeem atomically
  insert into public.activation_redemptions (user_id, code_id)
  values (v_user_id, v_code.id);

  update public.activation_codes
  set uses_count = uses_count + 1
  where id = v_code.id;

  update public.users
  set is_activated = true,
      activated_at = now()
  where id = v_user_id;

  return query select true, 'Kích hoạt thành công! Đang chuyển hướng vào dashboard…'::text;
end;
$$;

comment on function public.redeem_activation_code(text) is
  'User gọi để mở khóa tài khoản bằng mã code. Atomic — không thể double-redeem.';

-- 5. RLS — chặn truy cập trực tiếp activation_codes (chỉ qua RPC)
alter table public.activation_codes enable row level security;
alter table public.activation_redemptions enable row level security;

drop policy if exists "no_direct_access_codes" on public.activation_codes;
create policy "no_direct_access_codes" on public.activation_codes
  for select using (false);

drop policy if exists "own_redemption_select" on public.activation_redemptions;
create policy "own_redemption_select" on public.activation_redemptions
  for select using (user_id = auth.uid());

-- 6. Grant — chỉ RPC redeem cho authenticated
grant execute on function public.redeem_activation_code(text) to authenticated;

-- =============================================================================
-- Mẫu insert code (admin chạy trong Supabase SQL Editor để tạo code phát ra)
-- =============================================================================
-- Code 1 lần dùng, không hết hạn:
--   insert into public.activation_codes (code, notes) values ('BIZ-2026-ALPHA', 'Early adopter');
--
-- Code 100 lượt dùng, hết hạn cuối năm:
--   insert into public.activation_codes (code, notes, max_uses, expires_at)
--   values ('BLACKFRIDAY100', 'Promo Black Friday', 100, '2026-12-31');
--
-- Tự activate luôn account chính (không cần redeem):
--   update public.users set is_activated = true, activated_at = now()
--   where email = 'chuongchudu@gmail.com';
-- =============================================================================
