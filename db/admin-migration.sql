-- =============================================================================
-- ADMIN MIGRATION — chạy trong Supabase SQL Editor
-- Thêm role cho users + tạo bảng system_settings cho admin
-- =============================================================================

-- 1. Thêm cột role vào users
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user'
    CHECK (role IN ('user', 'admin'));

-- 2. Set admin cho email của bạn (thay bằng email thực)
-- UPDATE public.users SET role = 'admin' WHERE email = 'your@email.com';

-- 3. Tạo bảng system_settings (key-value cho toàn hệ thống)
CREATE TABLE IF NOT EXISTS public.system_settings (
  key         TEXT PRIMARY KEY,
  value       TEXT,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by  UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Trigger auto-update updated_at
DROP TRIGGER IF EXISTS trg_system_settings_updated_at ON public.system_settings;
CREATE TRIGGER trg_system_settings_updated_at
  BEFORE UPDATE ON public.system_settings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 4. RLS — chỉ admin được đọc/ghi
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "settings_admin_select" ON public.system_settings;
CREATE POLICY "settings_admin_select" ON public.system_settings
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "settings_admin_all" ON public.system_settings;
CREATE POLICY "settings_admin_all" ON public.system_settings
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- 5. Grant
GRANT ALL ON public.system_settings TO authenticated;

-- =============================================================================
-- DONE. Sau khi chạy:
-- 1. UPDATE public.users SET role = 'admin' WHERE email = 'your@email.com';
-- 2. Vào app.biznoco.com/admin để cài đặt
-- =============================================================================
