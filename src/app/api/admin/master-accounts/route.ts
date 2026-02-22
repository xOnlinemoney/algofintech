import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

/* ------------------------------------------------------------------ */
/*  GET /api/admin/master-accounts                                     */
/*  Returns all master trading accounts                                */
/* ------------------------------------------------------------------ */
export async function GET() {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("master_accounts")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      // If table doesn't exist yet, return empty array
      if (error.code === "42P01" || error.message?.includes("does not exist")) {
        return NextResponse.json({ accounts: [] }, { status: 200 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ accounts: data || [] }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}

/* ------------------------------------------------------------------ */
/*  POST /api/admin/master-accounts                                    */
/*  Create a new master trading account                                */
/* ------------------------------------------------------------------ */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const supabase = getSupabase();

    const insert: any = {
      platform: body.platform || "mt5",
      broker: body.broker || null,
      server: body.server || null,
      login: body.login || null,
      password_encrypted: body.password || null, // In production, encrypt this
      account_type: body.account_type || "live",
      nickname: body.nickname || null,
      status: body.status || "connected",
      settings: body.settings || {},
    };

    const { data, error } = await supabase
      .from("master_accounts")
      .insert(insert)
      .select()
      .single();

    if (error) {
      // If table doesn't exist, create it first
      if (error.code === "42P01" || error.message?.includes("does not exist")) {
        // Try to create the table
        const createResult = await createMasterAccountsTable(supabase);
        if (!createResult.success) {
          return NextResponse.json(
            { error: "Master accounts table does not exist. Please create it in Supabase SQL Editor.", details: createResult.error },
            { status: 500 }
          );
        }
        // Retry insert
        const { data: retryData, error: retryError } = await supabase
          .from("master_accounts")
          .insert(insert)
          .select()
          .single();
        if (retryError) {
          return NextResponse.json({ error: retryError.message }, { status: 500 });
        }
        return NextResponse.json({ account: retryData }, { status: 201 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ account: data }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}

/* ------------------------------------------------------------------ */
/*  Helper: attempt to create the table via Supabase REST             */
/* ------------------------------------------------------------------ */
async function createMasterAccountsTable(supabase: any) {
  try {
    // Use the Supabase SQL execution via rpc if available
    const sql = `
      CREATE TABLE IF NOT EXISTS master_accounts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        platform TEXT NOT NULL DEFAULT 'mt5',
        broker TEXT,
        server TEXT,
        login TEXT,
        password_encrypted TEXT,
        account_type TEXT NOT NULL DEFAULT 'live' CHECK (account_type IN ('demo', 'live')),
        nickname TEXT,
        status TEXT NOT NULL DEFAULT 'connected' CHECK (status IN ('connected', 'disconnected', 'paused', 'error')),
        settings JSONB DEFAULT '{}',
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `;
    const { error } = await supabase.rpc("exec_sql", { sql_query: sql });
    if (error) return { success: false, error: error.message };
    return { success: true, error: null };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}
