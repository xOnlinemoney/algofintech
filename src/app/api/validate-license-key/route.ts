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

// ─── POST: Validate a software license key ───────────────
export async function POST(req: NextRequest) {
  try {
    const supabase = getSupabase();
    if (!supabase) {
      return NextResponse.json(
        { valid: false, error: "Service unavailable." },
        { status: 503 }
      );
    }

    const body = await req.json();
    const { license_key } = body;

    if (!license_key || typeof license_key !== "string") {
      return NextResponse.json(
        { valid: false, error: "License key is required." },
        { status: 400 }
      );
    }

    // Normalize: uppercase and trim
    const normalizedKey = license_key.trim().toUpperCase();

    // Check the software_keys table
    const { data, error } = await supabase
      .from("software_keys")
      .select("id, status, client_id")
      .eq("license_key", normalizedKey)
      .single();

    if (error || !data) {
      return NextResponse.json({ valid: false, message: "Invalid license key." });
    }

    if (data.status === "used") {
      return NextResponse.json({
        valid: false,
        message: "This license key has already been used.",
      });
    }

    if (data.status === "revoked") {
      return NextResponse.json({
        valid: false,
        message: "This license key has been revoked.",
      });
    }

    if (data.status === "expired") {
      return NextResponse.json({
        valid: false,
        message: "This license key has expired.",
      });
    }

    // Key is active and valid
    return NextResponse.json({
      valid: true,
      message: "License key is valid.",
    });
  } catch (err) {
    console.error("Validate key error:", err);
    return NextResponse.json(
      { valid: false, error: "Internal server error." },
      { status: 500 }
    );
  }
}
