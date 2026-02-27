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

export const dynamic = "force-dynamic";

// ─── GET: Fetch copier accounts, stats, and recent trade events ───
export async function GET() {
  try {
    const supabase = getSupabase();
    if (!supabase) {
      return NextResponse.json(
        { error: "Supabase not configured." },
        { status: 503 }
      );
    }

    // Fetch all copier accounts
    const { data: accounts, error: accErr } = await supabase
      .from("copier_accounts")
      .select("*")
      .order("account_name", { ascending: true });

    if (accErr) {
      return NextResponse.json({ error: accErr.message }, { status: 500 });
    }

    // Fetch recent trade events (last 100)
    const { data: events, error: evErr } = await supabase
      .from("copier_trade_events")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);

    if (evErr) {
      return NextResponse.json({ error: evErr.message }, { status: 500 });
    }

    // Compute stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { count: tradesToday } = await supabase
      .from("copier_trade_events")
      .select("id", { count: "exact", head: true })
      .gte("created_at", today.toISOString());

    const activeAccounts = (accounts || []).filter(
      (a: { is_active: boolean }) => a.is_active
    ).length;
    const masterAccount = (accounts || []).find(
      (a: { is_master: boolean }) => a.is_master
    );

    return NextResponse.json({
      accounts: accounts || [],
      events: events || [],
      stats: {
        trades_today: tradesToday || 0,
        active_accounts: activeAccounts,
        total_accounts: (accounts || []).length,
        master_account: masterAccount?.account_name || null,
        last_trade: events && events.length > 0 ? events[0] : null,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ─── PATCH: Update a copier account (toggle active, set contract_size) ───
export async function PATCH(req: NextRequest) {
  try {
    const supabase = getSupabase();
    if (!supabase) {
      return NextResponse.json(
        { error: "Supabase not configured." },
        { status: 503 }
      );
    }

    const body = await req.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: "Missing account id" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("copier_accounts")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ─── POST: Add a new copier account ───
export async function POST(req: NextRequest) {
  try {
    const supabase = getSupabase();
    if (!supabase) {
      return NextResponse.json(
        { error: "Supabase not configured." },
        { status: 503 }
      );
    }

    const body = await req.json();
    const { account_name, is_master, is_active, contract_size, notes } = body;

    if (!account_name) {
      return NextResponse.json(
        { error: "Missing account_name" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("copier_accounts")
      .insert([
        {
          account_name,
          is_master: is_master || false,
          is_active: is_active || false,
          contract_size: contract_size || 1,
          notes: notes || null,
        },
      ])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ─── DELETE: Remove a copier account ───
export async function DELETE(req: NextRequest) {
  try {
    const supabase = getSupabase();
    if (!supabase) {
      return NextResponse.json(
        { error: "Supabase not configured." },
        { status: 503 }
      );
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    const { error } = await supabase
      .from("copier_accounts")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
