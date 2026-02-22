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

    // Look up software_keys where metadata contains the signup email
    // We search for keys with status "used" (meaning someone signed up with them)
    const { data: keys, error: keysErr } = await supabase
      .from("software_keys")
      .select("*")
      .eq("status", "used");

    if (keysErr || !keys) {
      console.error("Agency login: failed to fetch keys:", keysErr);
      return NextResponse.json(
        { error: "Unable to verify credentials." },
        { status: 500 }
      );
    }

    // Find the key that matches this email and password
    // Also handle legacy signups where password wasn't stored yet
    let matchingKey = null;
    let needsPasswordBackfill = false;

    for (const k of keys) {
      const meta = (k as Record<string, unknown>).metadata as Record<string, string> | null;
      if (!meta) continue;
      if (meta.signup_email?.toLowerCase() !== normalizedEmail) continue;
      // Skip client signups — only match agency signups
      if (meta.signup_type === "client") continue;

      if (meta.signup_password === password) {
        matchingKey = k;
        break;
      }
      // Legacy signup: email matches but no password was stored
      // Accept the provided password and backfill it
      if (!meta.signup_password) {
        matchingKey = k;
        needsPasswordBackfill = true;
        break;
      }
    }

    if (!matchingKey) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    // Backfill password for legacy signups
    if (needsPasswordBackfill) {
      const existingMeta = (matchingKey as Record<string, unknown>).metadata || {};
      await supabase
        .from("software_keys")
        .update({
          metadata: {
            ...(existingMeta as Record<string, unknown>),
            signup_password: password,
          },
        })
        .eq("id", (matchingKey as Record<string, unknown>).id);
    }

    // Get agency info via direct lookup
    const meta = (matchingKey as Record<string, unknown>).metadata as Record<string, string>;
    const agencyId = (matchingKey as Record<string, unknown>).agency_id as string;

    let agencyInfo = { id: agencyId || "", name: "Agency", slug: "" };
    if (agencyId) {
      const { data: ag } = await supabase
        .from("agencies")
        .select("*")
        .eq("id", agencyId)
        .single();
      if (ag) {
        agencyInfo = { id: ag.id, name: ag.name, slug: ag.slug };
      }
    }

    return NextResponse.json({
      success: true,
      agency: agencyInfo,
      user: {
        name: meta.signup_name || "",
        email: meta.signup_email || "",
      },
    });
  } catch (err) {
    console.error("Agency login error:", err);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
