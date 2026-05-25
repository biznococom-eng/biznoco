/**
 * scripts/fix-auth.mjs
 * Chạy: node scripts/fix-auth.mjs
 *
 * Công dụng:
 *  1. Activate tài khoản admin (set is_activated = true)
 *  2. Tạo activation codes mới để phát cho user
 *  3. Đồng bộ public.users cho user chưa có profile row
 */

import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dir = dirname(fileURLToPath(import.meta.url));
const envPath = join(__dir, "../.env.local");

// Đọc .env.local
const env = {};
try {
  readFileSync(envPath, "utf8")
    .split("\n")
    .forEach((line) => {
      const m = line.match(/^([^#=]+)=(.*)$/);
      if (m) env[m[1].trim()] = m[2].trim();
    });
} catch {
  console.error("❌ Không đọc được .env.local");
  process.exit(1);
}

const SUPABASE_URL = env["NEXT_PUBLIC_SUPABASE_URL"];
const SERVICE_KEY = env["SUPABASE_SERVICE_ROLE_KEY"];

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("❌ Thiếu NEXT_PUBLIC_SUPABASE_URL hoặc SUPABASE_SERVICE_ROLE_KEY trong .env.local");
  process.exit(1);
}

const headers = {
  apikey: SERVICE_KEY,
  Authorization: `Bearer ${SERVICE_KEY}`,
  "Content-Type": "application/json",
  Prefer: "return=representation",
};

async function query(path, opts = {}) {
  const { headers: optHeaders, ...restOpts } = opts;
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    headers: { ...headers, ...(optHeaders ?? {}) },
    ...restOpts,
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`${res.status} ${text}`);
  return text ? JSON.parse(text) : [];
}

async function rpc(fn, body = {}) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${fn}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`${res.status} ${text}`);
  return text ? JSON.parse(text) : null;
}

async function main() {
  console.log("🔧 Biznoco Auth Fix Tool\n");
  console.log(`📡 Supabase: ${SUPABASE_URL}\n`);

  // 1. List all auth users
  const authRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users?per_page=100`, {
    headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` },
  });
  const { users: authUsers = [] } = await authRes.json();
  console.log(`👥 Tổng auth users: ${authUsers.length}`);

  // 2. List public.users
  let publicUsers = [];
  try {
    publicUsers = await query("users?select=id,email,is_activated");
  } catch (e) {
    console.warn("⚠️  Bảng public.users chưa có cột is_activated. Chạy db/activation.sql trước.");
    console.warn("   Lỗi:", e.message);
  }
  console.log(`📋 public.users rows: ${publicUsers.length}\n`);

  // 3. Sync missing profiles
  let synced = 0;
  for (const u of authUsers) {
    const exists = publicUsers.find((p) => p.id === u.id);
    if (!exists) {
      try {
        await query("users", {
          method: "POST",
          headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
          body: JSON.stringify({
            id: u.id,
            email: u.email,
            full_name: u.user_metadata?.full_name ?? u.email?.split("@")[0] ?? "User",
          }),
        });
        console.log(`✅ Tạo profile: ${u.email}`);
        synced++;
      } catch (e) {
        console.warn(`⚠️  Không tạo được profile cho ${u.email}: ${e.message}`);
      }
    }
  }
  if (synced === 0) console.log("✅ Tất cả auth users đã có profile row.\n");

  // 4. Activate all users (set is_activated = true)
  try {
    const result = await query("users?is_activated=eq.false", {
      method: "PATCH",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify({ is_activated: true }),
    });
    const count = Array.isArray(result) ? result.length : 0;
    if (count > 0) {
      console.log(`🔓 Đã activate ${count} tài khoản:`);
      result.forEach((u) => console.log(`   • ${u.email}`));
    } else {
      console.log("✅ Tất cả tài khoản đã activated rồi.\n");
    }
  } catch (e) {
    console.warn("⚠️  Không activate được:", e.message);
    console.warn("   → Thử chạy db/activation.sql trong Supabase SQL Editor trước.");
  }

  // 5. Tạo activation codes mẫu
  try {
    const codes = [
      { code: "BIZ-2026-ADMIN", notes: "Admin code — multi-use", max_uses: 999 },
      { code: "BIZ-EARLY-01", notes: "Early adopter batch 1", max_uses: 50 },
      { code: "BIZ-EARLY-02", notes: "Early adopter batch 2", max_uses: 50 },
    ];
    for (const c of codes) {
      try {
        await query("activation_codes", {
          method: "POST",
          headers: { Prefer: "resolution=ignore-duplicates,return=minimal" },
          body: JSON.stringify(c),
        });
        console.log(`🎫 Code created/skipped: ${c.code} (${c.max_uses} uses)`);
      } catch (e) {
        // Ignore duplicate
      }
    }
  } catch (e) {
    console.warn("⚠️  Bảng activation_codes chưa tồn tại. Chạy db/activation.sql trước.");
  }

  console.log("\n✅ Done! Thử đăng nhập lại vào app.biznoco.com");
}

main().catch((e) => {
  console.error("❌ Fatal:", e.message);
  process.exit(1);
});
