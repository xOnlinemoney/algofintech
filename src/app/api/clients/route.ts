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

// ─── GET: Fetch all clients for the agency ──────────────
export async function GET() {
  try {
    const supabase = getSupabase();
    if (!supabase) {
      return NextResponse.json({ error: "Supabase not configured." }, { status: 503 });
    }

    const { data, error } = await supabase
      .from("clients")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Supabase query error:", error);
      return NextResponse.json({ error: "Failed to fetch clients." }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 200 });
  } catch (err) {
    console.error("API error:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

// ─── POST: Create a new client ──────────────────────────
export async function POST(req: NextRequest) {
  try {
    const supabase = getSupabase();
    if (!supabase) {
      return NextResponse.json({ error: "Supabase not configured." }, { status: 503 });
    }

    const body = await req.json();
    const { name, email, phone, max_accounts } = body;

    if (!name || !email) {
      return NextResponse.json({ error: "Name and email are required." }, { status: 400 });
    }

    // Get the agency (use first agency — AlgoStack)
    const { data: agency, error: agencyErr } = await supabase
      .from("agencies")
      .select("id")
      .eq("slug", "algostack")
      .single();

    if (agencyErr || !agency) {
      return NextResponse.json(
        { error: "Agency not found. Please run /api/seed first." },
        { status: 404 }
      );
    }

    // Generate a unique display ID (CL-XXXX)
    let clientId: string;
    let attempts = 0;
    do {
      clientId = `CL-${Math.floor(1000 + Math.random() * 9000)}`;
      const { data: existing } = await supabase
        .from("clients")
        .select("id")
        .eq("client_id", clientId)
        .eq("agency_id", agency.id)
        .single();
      if (!existing) break;
      attempts++;
    } while (attempts < 20);

    // Random gradient for avatar
    const gradients = [
      "from-blue-600 to-indigo-600",
      "from-emerald-600 to-teal-600",
      "from-purple-600 to-pink-600",
      "from-orange-500 to-red-500",
      "from-cyan-600 to-blue-600",
      "from-indigo-600 to-purple-600",
      "from-rose-500 to-pink-500",
      "from-amber-500 to-orange-500",
    ];
    const gradient = gradients[Math.floor(Math.random() * gradients.length)];

    const row = {
      client_id: clientId,
      agency_id: agency.id,
      name,
      email,
      phone: phone || null,
      avatar_gradient: gradient,
      status: "active",
      liquidity: 0,
      total_pnl: 0,
      pnl_percentage: 0,
      active_strategies: 0,
      risk_level: "medium",
      broker: null,
      max_accounts: max_accounts || null, // NULL = unlimited
    };

    const { data, error } = await supabase
      .from("clients")
      .insert([row])
      .select()
      .single();

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json(
        { error: `Failed to create client: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "Client created!", data }, { status: 201 });
  } catch (err) {
    console.error("API error:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
