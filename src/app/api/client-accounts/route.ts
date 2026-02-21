import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// ─── GET: Fetch all accounts for a client ───────────────
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
        {
          error:
            "Supabase is not configured yet. Please add your Supabase credentials to .env.local",
        },
        { status: 503 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const clientId = req.nextUrl.searchParams.get("client_id");

    if (!clientId) {
      return NextResponse.json(
        { error: "client_id is required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("client_accounts")
      .select("*")
      .eq("client_id", clientId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase query error:", error);
      return NextResponse.json(
        { error: "Failed to fetch accounts." },
        { status: 500 }
      );
    }

    return NextResponse.json({ data }, { status: 200 });
  } catch (err) {
    console.error("API error:", err);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}

// ─── POST: Add a new client account ─────────────────────
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
        {
          error:
            "Supabase is not configured yet. Please add your Supabase credentials to .env.local",
        },
        { status: 503 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const body = await req.json();

    const {
      client_id,
      platform,
      account_type,
      account_number,
      plan,
    } = body;

    if (!client_id || !platform || !account_type || !account_number || !plan) {
      return NextResponse.json(
        { error: "Missing required fields." },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("client_accounts")
      .insert([
        {
          client_id,
          platform,
          account_type,
          account_number,
          plan,
          currency: "USD",
          balance: 0,
          credit: 0,
          equity: 0,
          free_margin: 0,
          open_trades: 0,
          asset_class: platform === "Tradovate" ? "Futures" : "Forex",
          strategy_id: null,
          is_active: false,
          status: "off",
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json(
        { error: "Failed to add account. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Account added successfully!", data },
      { status: 201 }
    );
  } catch (err) {
    console.error("API error:", err);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}

// ─── PATCH: Update account (toggle, strategy, copy settings) ─
export async function PATCH(req: NextRequest) {
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
        {
          error:
            "Supabase is not configured yet. Please add your Supabase credentials to .env.local",
        },
        { status: 503 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const body = await req.json();
    const { account_id, ...updates } = body;

    if (!account_id) {
      return NextResponse.json(
        { error: "account_id is required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("client_accounts")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", account_id)
      .select()
      .single();

    if (error) {
      console.error("Supabase update error:", error);
      return NextResponse.json(
        { error: "Failed to update account." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Account updated successfully!", data },
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

// ─── DELETE: Remove a client account ────────────────────
export async function DELETE(req: NextRequest) {
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
        {
          error:
            "Supabase is not configured yet. Please add your Supabase credentials to .env.local",
        },
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

    const { error } = await supabase
      .from("client_accounts")
      .delete()
      .eq("id", accountId);

    if (error) {
      console.error("Supabase delete error:", error);
      return NextResponse.json(
        { error: "Failed to delete account." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Account deleted successfully!" },
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
