import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key || url === "https://your-project.supabase.co") return null;
  return createClient(url, key);
}

// Resolve display ID (CL-7829) → Supabase UUID
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getClientUuid(
  supabase: any,
  displayId: string
): Promise<string | null> {
  const { data } = await supabase
    .from("clients")
    .select("id")
    .eq("client_id", displayId)
    .single();
  return data?.id ?? null;
}

// ─── GET: Fetch all accounts for a client (by display ID) ──
export async function GET(req: NextRequest) {
  try {
    const supabase = getSupabase();
    if (!supabase) {
      return NextResponse.json({ error: "Supabase not configured." }, { status: 503 });
    }

    const displayId = req.nextUrl.searchParams.get("client_id");
    if (!displayId) {
      return NextResponse.json({ error: "client_id is required" }, { status: 400 });
    }

    const clientUuid = await getClientUuid(supabase, displayId);
    if (!clientUuid) {
      return NextResponse.json({ data: [] }, { status: 200 });
    }

    const { data, error } = await supabase
      .from("client_accounts")
      .select("*")
      .eq("client_id", clientUuid)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Supabase query error:", error);
      return NextResponse.json({ error: "Failed to fetch accounts." }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 200 });
  } catch (err) {
    console.error("API error:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

// ─── POST: Add a new client account ─────────────────────
export async function POST(req: NextRequest) {
  try {
    const supabase = getSupabase();
    if (!supabase) {
      return NextResponse.json({ error: "Supabase not configured." }, { status: 503 });
    }

    const body = await req.json();
    const {
      client_display_id,
      platform,
      account_type,
      account_number,
      username,
      password,
    } = body;

    if (!client_display_id || !platform || !account_type || !account_number) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    const clientUuid = await getClientUuid(supabase, client_display_id);
    if (!clientUuid) {
      return NextResponse.json(
        { error: `Client ${client_display_id} not found.` },
        { status: 404 }
      );
    }

    // Get agency_id and max_accounts from client
    const { data: clientRow } = await supabase
      .from("clients")
      .select("agency_id, max_accounts")
      .eq("id", clientUuid)
      .single();

    // Enforce max accounts limit
    if (clientRow?.max_accounts) {
      const { count } = await supabase
        .from("client_accounts")
        .select("id", { count: "exact", head: true })
        .eq("client_id", clientUuid);

      if (count !== null && count >= clientRow.max_accounts) {
        return NextResponse.json(
          { error: `Account limit reached. This client is limited to ${clientRow.max_accounts} accounts.` },
          { status: 403 }
        );
      }
    }

    const platformAssetClass: Record<string, string> = {
      Tradovate: "Futures",
      "MetaTrader 4": "Forex",
      "MetaTrader 5": "Forex",
      Binance: "Crypto",
      Bybit: "Crypto",
      Schwab: "Stocks",
    };

    const accountName = `slave - ${platform.toLowerCase().replace(/\s+/g, "")} - ${account_number}`;
    const accountLabel = `${platform} ${account_type} / ${account_number} (USD)`;

    const row: Record<string, unknown> = {
      client_id: clientUuid,
      agency_id: clientRow?.agency_id,
      account_name: accountName,
      account_label: accountLabel,
      platform,
      account_type,
      account_number,
      currency: "USD",
      balance: 0,
      credit: 0,
      equity: 0,
      free_margin: 0,
      open_trades: 0,
      asset_class: platformAssetClass[platform] || "Futures",
      algorithm_id: null,
      is_active: false,
      status: "off",
    };

    // Store Tradovate credentials if provided
    if (platform === "Tradovate" && username) {
      row.username_encrypted = username;
      row.password_encrypted = password || "";
    }

    const { data, error } = await supabase
      .from("client_accounts")
      .insert([row])
      .select()
      .single();

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json(
        { error: `Failed to add account: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "Account added!", data }, { status: 201 });
  } catch (err) {
    console.error("API error:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

// ─── PATCH: Update account (toggle, strategy, etc.) ─────
export async function PATCH(req: NextRequest) {
  try {
    const supabase = getSupabase();
    if (!supabase) {
      return NextResponse.json({ error: "Supabase not configured." }, { status: 503 });
    }

    const body = await req.json();
    const { account_id, ...updates } = body;

    if (!account_id) {
      return NextResponse.json({ error: "account_id is required" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("client_accounts")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", account_id)
      .select()
      .single();

    if (error) {
      console.error("Supabase update error:", error);
      return NextResponse.json({ error: "Failed to update account." }, { status: 500 });
    }

    return NextResponse.json({ message: "Account updated!", data }, { status: 200 });
  } catch (err) {
    console.error("API error:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

// ─── DELETE: Remove a client account ────────────────────
export async function DELETE(req: NextRequest) {
  try {
    const supabase = getSupabase();
    if (!supabase) {
      return NextResponse.json({ error: "Supabase not configured." }, { status: 503 });
    }

    const accountId = req.nextUrl.searchParams.get("account_id");
    if (!accountId) {
      return NextResponse.json({ error: "account_id is required" }, { status: 400 });
    }

    const { error } = await supabase
      .from("client_accounts")
      .delete()
      .eq("id", accountId);

    if (error) {
      console.error("Supabase delete error:", error);
      return NextResponse.json({ error: "Failed to delete account." }, { status: 500 });
    }

    return NextResponse.json({ message: "Account deleted!" }, { status: 200 });
  } catch (err) {
    console.error("API error:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
