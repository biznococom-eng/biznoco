"use client";

import { getSupabase } from "@/lib/supabase/client";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const untyped = (sb: ReturnType<typeof getSupabase>) => sb as any;

export interface AdAccount {
  id: string;
  user_id: string;
  fb_ad_account_id: string;
  fb_business_id: string | null;
  account_name: string;
  currency: string | null;
  timezone_name: string | null;
  status: "active" | "paused" | "disconnected" | "error";
  last_synced_at: string | null;
  created_at: string;
  updated_at: string;
  // Meta API
  access_token: string | null;
  meta_business_id?: string | null;
  meta_token_user_id?: string | null;
  meta_token_scopes?: string[] | null;
  meta_last_synced_at?: string | null;
}

export interface CreateAccountInput {
  fb_ad_account_id: string;
  account_name: string;
  currency?: string;
  timezone_name?: string;
  access_token?: string;
  meta_token_user_id?: string;
  meta_token_scopes?: string[];
}

/** List all ad accounts của user đang đăng nhập (RLS tự lọc theo auth.uid()) */
export async function listAccounts(): Promise<AdAccount[]> {
  const sb = getSupabase();
  const { data, error } = await sb
    .from("accounts")
    .select("*")
    .order("created_at", { ascending: true });
  if (error) throw new Error(`listAccounts: ${error.message}`);
  return (data ?? []) as AdAccount[];
}

/** Create new ad account cho user đang login. user_id tự lấy từ auth context. */
export async function createAccount(input: CreateAccountInput): Promise<AdAccount> {
  const sb = getSupabase();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) throw new Error("Bạn cần đăng nhập để thêm ad account.");

  // Normalize fb_ad_account_id — nhận cả "act_123" hoặc "123"
  const normalizedFbId = input.fb_ad_account_id.startsWith("act_")
    ? input.fb_ad_account_id
    : `act_${input.fb_ad_account_id}`;

  const insertPayload: Record<string, unknown> = {
    user_id: user.id,
    fb_ad_account_id: normalizedFbId,
    account_name: input.account_name,
    currency: input.currency ?? "VND",
    timezone_name: input.timezone_name ?? "Asia/Ho_Chi_Minh",
  };
  if (input.access_token) insertPayload.access_token = input.access_token;
  if (input.meta_token_user_id) insertPayload.meta_token_user_id = input.meta_token_user_id;
  if (input.meta_token_scopes) insertPayload.meta_token_scopes = input.meta_token_scopes;
  const { data, error } = await untyped(sb)
    .from("accounts")
    .insert(insertPayload)
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      throw new Error("Ad Account này đã được thêm rồi.");
    }
    throw new Error(`createAccount: ${error.message}`);
  }
  return data as AdAccount;
}

export async function deleteAccount(accountId: string): Promise<void> {
  const sb = getSupabase();
  const { error } = await sb.from("accounts").delete().eq("id", accountId);
  if (error) throw new Error(`deleteAccount: ${error.message}`);
}

/** Count creative_stats rows cho account — để biết có data chưa */
export async function countCreativeStats(accountId: string): Promise<number> {
  const sb = getSupabase();
  const { count, error } = await sb
    .from("creative_stats")
    .select("*", { count: "exact", head: true })
    .eq("account_id", accountId);
  if (error) throw new Error(`countCreativeStats: ${error.message}`);
  return count ?? 0;
}
