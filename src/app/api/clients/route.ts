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

// ─── GET: Fetch clients for a specific agency ──────────────
export async function GET(req: NextRequest) {
  try {
    const supabase = getSupabase();
    if (!supabase) {
      return NextResponse.json({ error: "Supabase not configured." }, { status: 503 });
    }

    // Filter by agency_id if provided — otherwise return empty
    const agencyId = req.nextUrl.searchParams.get("agency_id");

    let query = supabase
      .from("clients")
      .select("*")
      .order("created_at", { ascending: true });

    if (agencyId) {
      query = query.eq("agency_id", agencyId);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Supabase query error:", error);
      return NextResponse.json({ error: "Failed to fetch clients." }, { status: 500 });
    }

    return NextResponse.json({ data: data || [] }, { status: 200 });
  } catch (err) {
    console.error("API error:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

// ─── Helper: Generate a unique software key (XXXX-XXXX-XXXX-XXXX) ───
function generateSoftwareKey(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I to avoid confusion
  const segment = () =>
    Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  return `${segment()}-${segment()}-${segment()}-${segment()}`;
}

// ─── POST: Create a new client ──────────────────────────
export async function POST(req: NextRequest) {
  try {
    const supabase = getSupabase();
    if (!supabase) {
      return NextResponse.json({ error: "Supabase not configured." }, { status: 503 });
    }

    const body = await req.json();
    const { name, email, phone, max_accounts, agency_id } = body;

    if (!name || !email) {
      return NextResponse.json({ error: "Name and email are required." }, { status: 400 });
    }

    // Use the agency_id passed from the client, or fall back to looking up by slug
    let resolvedAgencyId = agency_id;
    if (!resolvedAgencyId) {
      const { data: agency, error: agencyErr } = await supabase
        .from("agencies")
        .select("id")
        .eq("slug", "algofintech")
        .single();

      if (agencyErr || !agency) {
        return NextResponse.json(
          { error: "Agency not found. Please provide agency_id." },
          { status: 404 }
        );
      }
      resolvedAgencyId = agency.id;
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
        .eq("agency_id", resolvedAgencyId)
        .single();
      if (!existing) break;
      attempts++;
    } while (attempts < 20);

    // Generate a unique software / license key (XXXX-XXXX-XXXX-XXXX)
    let softwareKey: string;
    let keyAttempts = 0;
    do {
      softwareKey = generateSoftwareKey();
      const { data: existingKey } = await supabase
        .from("software_keys")
        .select("id")
        .eq("license_key", softwareKey)
        .single();
      if (!existingKey) break;
      keyAttempts++;
    } while (keyAttempts < 20);

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
      agency_id: resolvedAgencyId,
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
      software_key: softwareKey,
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

    // Also store the key in the software_keys table
    await supabase.from("software_keys").insert([
      {
        client_id: data.id,
        agency_id: resolvedAgencyId,
        license_key: softwareKey,
        status: "active",
      },
    ]);

    return NextResponse.json({ message: "Client created!", data }, { status: 201 });
  } catch (err) {
    console.error("API error:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
