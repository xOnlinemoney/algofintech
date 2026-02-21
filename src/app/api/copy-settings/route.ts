import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// ─── GET: Fetch copy settings for an account ────────────
export async function GET(req: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (
      !supabaseUrl ||
      !supabaseKey ||
      supabaseUrl === "https://your-project.supabase.co"
    ) {
      return NextResponse.json(
        { error: "Supabase is not configured yet." },
        { status: 503 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const accountId = req.nextUrl.searchParams.get("account_id");

    if (!accountId) {
      return NextResponse.json(
        { error: "account_id is required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("copy_settings")
      .select("*")
      .eq("account_id", accountId)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("Supabase query error:", error);
      return NextResponse.json(
        { error: "Failed to fetch copy settings." },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: data || null }, { status: 200 });
  } catch (err) {
    console.error("API error:", err);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}

// ─── POST: Create or update copy settings ───────────────
export async function POST(req: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (
      !supabaseUrl ||
      !supabaseKey ||
      supabaseUrl === "https://your-project.supabase.co"
    ) {
      return NextResponse.json(
        { error: "Supabase is not configured yet." },
        { status: 503 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const body = await req.json();

    const { account_id, ...settings } = body;

    if (!account_id) {
      return NextResponse.json(
        { error: "account_id is required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("copy_settings")
      .upsert(
        {
          account_id,
          ...settings,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "account_id" }
      )
      .select()
      .single();

    if (error) {
      console.error("Supabase upsert error:", error);
      return NextResponse.json(
        { error: "Failed to save copy settings." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Copy settings saved!", data },
      { status: 200 }
    );
  } catch (err) {
    console.error("API error:", err);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
