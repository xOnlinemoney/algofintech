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

    // Validate required fields
    if (!first_name || !last_name || !email || !password || !license_key) {
      return NextResponse.json(
        { error: "All fields are required." },
        { status: 400 }
      );
    }

    const normalizedKey = license_key.trim().toUpperCase();

    // 1. Look up the license key in software_keys
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

    // Check key status — must be active
    if (keyRecord.status === "used") {
      return NextResponse.json(
        { error: "This license key has already been used." },
        { status: 400 }
      );
    }
    if (keyRecord.status === "revoked") {
      return NextResponse.json(
        { error: "This license key has been revoked." },
        { status: 400 }
      );
    }
    if (keyRecord.status === "expired") {
      return NextResponse.json(
        { error: "This license key has expired." },
        { status: 400 }
      );
    }
    if (keyRecord.status !== "active") {
      return NextResponse.json(
        { error: "This license key is not valid." },
        { status: 400 }
      );
    }

    // Ensure this key is linked to an agency
    if (!keyRecord.agency_id) {
      return NextResponse.json(
        { error: "This license key is not associated with an agency." },
        { status: 400 }
      );
    }

    // 2. Fetch the agency
    const { data: agency, error: agencyErr } = await supabase
      .from("agencies")
      .select("*")
      .eq("id", keyRecord.agency_id)
      .single();

    if (agencyErr || !agency) {
      return NextResponse.json(
        { error: "Agency not found for this license key." },
        { status: 400 }
      );
    }

    // 3. Mark the license key as "used"
    await supabase
      .from("software_keys")
      .update({ status: "used" })
      .eq("id", keyRecord.id);

    // 4. Update agency metadata if needed (store contact info on the key)
    const existingMetadata = keyRecord.metadata || {};
    await supabase
      .from("software_keys")
      .update({
        metadata: {
          ...existingMetadata,
          signup_name: `${first_name} ${last_name}`,
          signup_email: email,
          signed_up_at: new Date().toISOString(),
        },
      })
      .eq("id", keyRecord.id);

    return NextResponse.json(
      {
        success: true,
        agency: {
          id: agency.id,
          name: agency.name,
          slug: agency.slug,
        },
        message: "Agency signup successful!",
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Agency signup error:", err);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
