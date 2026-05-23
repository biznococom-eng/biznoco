/**
 * Seed Supabase với mock creative_stats data.
 *
 * Cách chạy:
 *   1. Trong .env.local đặt:
 *      SUPABASE_URL=https://xxx.supabase.co
 *      SUPABASE_SERVICE_ROLE_KEY=eyJ...   ← service_role (bypass RLS)
 *      SEED_ACCOUNT_ID=<UUID account row>
 *   2. Cài tsx nếu chưa có: npm install -D tsx
 *   3. Chạy: npx tsx scripts/seed-supabase.ts
 *
 * Script idempotent — chạy lại sẽ upsert ON CONFLICT (account_id, ad_id, date).
 *
 * CẢNH BÁO: dùng service_role key — KHÔNG commit lên git, KHÔNG dùng trên browser.
 */
import { createClient } from "@supabase/supabase-js";
import { config as loadEnv } from "dotenv";
import { resolve } from "node:path";
import { CREATIVE_STATS_MOCK } from "../src/mock/creative-stats";

loadEnv({ path: resolve(process.cwd(), ".env.local") });

const URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ACCOUNT_ID = process.env.SEED_ACCOUNT_ID;

function fail(msg: string): never {
  console.error("✗", msg);
  process.exit(1);
}

if (!URL) fail("Missing SUPABASE_URL (hoặc NEXT_PUBLIC_SUPABASE_URL)");
if (!KEY) fail("Missing SUPABASE_SERVICE_ROLE_KEY");
if (!ACCOUNT_ID) fail("Missing SEED_ACCOUNT_ID — UUID của row trong bảng `accounts`");

const sb = createClient(URL!, KEY!, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function main() {
  console.log(`→ Seed ${CREATIVE_STATS_MOCK.length} rows vào account ${ACCOUNT_ID}`);
  console.log(`  URL: ${URL}`);

  // 1) Verify account exists
  const { data: account, error: acctErr } = await sb
    .from("accounts")
    .select("id, account_name")
    .eq("id", ACCOUNT_ID!)
    .maybeSingle();

  if (acctErr) fail(`Lỗi đọc accounts: ${acctErr.message}`);
  if (!account)
    fail(
      `Account ${ACCOUNT_ID} không tồn tại trong DB. Tạo row mới trong table 'accounts' trước.`,
    );

  console.log(`✓ Account: ${account.account_name}`);

  // 2) Override account_id + drop client-only "id" (DB sẽ gen uuid mới khi conflict)
  const rows = CREATIVE_STATS_MOCK.map(({ id, ...r }) => ({
    ...r,
    account_id: ACCOUNT_ID!,
  }));

  // 3) Upsert theo (account_id, ad_id, date)
  console.log(`→ Upserting ${rows.length} rows…`);

  // Split into chunks of 500 to avoid Supabase request size limit
  const chunkSize = 500;
  let inserted = 0;
  for (let i = 0; i < rows.length; i += chunkSize) {
    const chunk = rows.slice(i, i + chunkSize);
    const { error } = await sb
      .from("creative_stats")
      .upsert(chunk, { onConflict: "account_id,ad_id,date", ignoreDuplicates: false });
    if (error) fail(`Upsert chunk ${i / chunkSize + 1}: ${error.message}`);
    inserted += chunk.length;
    console.log(`  ✓ ${inserted}/${rows.length}`);
  }

  // 4) Verify count
  const { count, error: countErr } = await sb
    .from("creative_stats")
    .select("*", { count: "exact", head: true })
    .eq("account_id", ACCOUNT_ID!);

  if (countErr) console.warn(`(! không verify được count: ${countErr.message})`);
  else console.log(`✓ Tổng row trong DB cho account: ${count}`);

  console.log("\n🎉 Done! Mở /creatives để xem dashboard với data thực.");
}

main().catch((err) => {
  console.error("✗ Unexpected error:", err);
  process.exit(1);
});
