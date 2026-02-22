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

export async function POST(req: NextRequest) {
  try {
    const supabase = getSupabase();
    if (!supabase) {
      return NextResponse.json(
        { error: "Service unavailable." },
        { status: 503 }
      );
    }

    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Look up software_keys with status "used" and signup_type "client"
    const { data: keys, error: keysErr } = await supabase
      .from("software_keys")
      .select("*")
      .eq("status", "used");

    if (keysErr || !keys) {
      return NextResponse.json(
        { error: "Unable to verify credentials." },
        { status: 500 }
      );
    }

    // Find matching client credentials
    const matchingKey = keys.find((k: Record<string, unknown>) => {
      const meta = k.metadata as Record<string, string> | null;
      if (!meta) return false;
      if (meta.signup_type !== "client") return false;
      return (
        meta.signup_email?.toLowerCase() === normalizedEmail &&
        meta.signup_password === password
      );
    });

    if (!matchingKey) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    const meta = matchingKey.metadata as Record<string, string>;

    // Get agency name if linked
    let agencyName = "";
    if (matchingKey.agency_id) {
      const { data: agency } = await supabase
        .from("agencies")
        .select("name")
        .eq("id", matchingKey.agency_id)
        .single();
      if (agency) agencyName = agency.name;
    }

    return NextResponse.json({
      success: true,
      client: {
        name: meta.signup_name || "",
        email: meta.signup_email || "",
        agency_name: agencyName,
        client_id: matchingKey.client_id || null,
      },
    });
  } catch (err) {
    console.error("Client login error:", err);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
