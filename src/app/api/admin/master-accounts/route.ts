import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/* eslint-disable @typescript-eslint/no-explicit-any */

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key || url === "https://your-project.supabase.co") return null;
  return createClient(url, key);
}

export const dynamic = "force-dynamic";

/* ------------------------------------------------------------------ */
/*  GET /api/admin/master-accounts                                     */
/*  Returns all master trading accounts                                */
/* ------------------------------------------------------------------ */
export async function GET() {
  try {
    const supabase = getSupabase();
    if (!supabase) {
      return NextResponse.json({ accounts: [] }, { status: 200 });
    }

    const { data, error } = await supabase
      .from("master_accounts")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      // If table doesn't exist yet, return empty array
      if (error.code === "42P01" || error.message?.includes("does not exist") || error.message?.includes("relation")) {
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
    if (!supabase) {
      return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
    }

    const insert: any = {
      platform: body.platform || "mt5",
      broker: body.broker || null,
      server: body.server || null,
      login: body.login || null,
      password_encrypted: body.password || null,
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
      return NextResponse.json(
        {
          error: error.message,
          details: error.message?.includes("does not exist") || error.message?.includes("relation")
            ? "The master_accounts table does not exist yet. Please run the SQL from supabase/schema.sql (section 14) in your Supabase SQL Editor."
            : undefined,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ account: data }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}
