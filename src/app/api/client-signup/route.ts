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
    const { first_name, last_name, email, password, license_key } = body;

    if (!first_name || !last_name || !email || !password || !license_key) {
      return NextResponse.json(
        { error: "All fields are required." },
        { status: 400 }
      );
    }

    const normalizedKey = license_key.trim().toUpperCase();

    // 1. Look up the license key
    const { data: keyRecord, error: keyErr } = await supabase
      .from("software_keys")
      .select("*")
      .eq("license_key", normalizedKey)
      .single();

    if (keyErr || !keyRecord) {
      return NextResponse.json(
        { error: "Invalid license key." },
        { status: 400 }
      );
    }

    if (keyRecord.status === "used") {
      return NextResponse.json(
        { error: "This license key has already been used." },
        { status: 400 }
      );
    }
    if (keyRecord.status !== "active") {
      return NextResponse.json(
        { error: "This license key is not valid." },
        { status: 400 }
      );
    }

    // 2. Mark the key as used and store signup info
    const existingMetadata = keyRecord.metadata || {};
    await supabase
      .from("software_keys")
      .update({
        status: "used",
        metadata: {
          ...existingMetadata,
          signup_name: `${first_name} ${last_name}`,
          signup_email: email,
          signup_password: password,
          signup_type: "client",
          signed_up_at: new Date().toISOString(),
        },
      })
      .eq("id", keyRecord.id);

    // Get agency info if the key is linked to one
    let agencyName = "";
    if (keyRecord.agency_id) {
      const { data: agency } = await supabase
        .from("agencies")
        .select("name")
        .eq("id", keyRecord.agency_id)
        .single();
      if (agency) agencyName = agency.name;
    }

    return NextResponse.json({
      success: true,
      client: {
        name: `${first_name} ${last_name}`,
        email: email,
        agency_name: agencyName,
        client_id: keyRecord.client_id || null,
      },
      message: "Client signup successful!",
    });
  } catch (err) {
    console.error("Client signup error:", err);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
