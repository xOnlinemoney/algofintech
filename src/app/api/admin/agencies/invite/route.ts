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

/** Generate a unique license key: AFT8-XXXX-XXXX-XXXX */
function generateAgencyLicenseKey(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const segment = () =>
    Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  return `AFT8-${segment()}-${segment()}-${segment()}`;
}

/** Generate a slug from name */
function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 50);
}

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
    const {
      agency_name,
      contact_name,
      contact_email,
      contact_phone,
      website_url,
      internal_notes,
      sold_by,
      plan,
      link_expiration,
    } = body;

    // Validate required fields
    if (!agency_name || !contact_name || !contact_email || !sold_by || !plan) {
      return NextResponse.json(
        { error: "Agency name, contact name, contact email, sold by, and plan are required." },
        { status: 400 }
      );
    }

    // Generate slug
    let slug = slugify(agency_name);

    // Check if slug already exists — if so, append a number
    const { data: existingSlug } = await supabase
      .from("agencies")
      .select("id")
      .eq("slug", slug)
      .single();

    if (existingSlug) {
      slug = `${slug}-${Date.now().toString(36).slice(-4)}`;
    }

    // 1. Create the agency
    const { data: newAgency, error: agencyErr } = await supabase
      .from("agencies")
      .insert({
        name: agency_name,
        slug,
        plan: plan || "starter",
      })
      .select("id, name, slug, plan, created_at")
      .single();

    if (agencyErr || !newAgency) {
      console.error("Agency insert error:", agencyErr);
      return NextResponse.json(
        { error: `Failed to create agency: ${agencyErr?.message || "Unknown error"}` },
        { status: 500 }
      );
    }

    // 2. Generate a unique license key
    let licenseKey: string;
    let attempts = 0;
    do {
      licenseKey = generateAgencyLicenseKey();
      const { data: existingKey } = await supabase
        .from("software_keys")
        .select("id")
        .eq("license_key", licenseKey)
        .single();
      if (!existingKey) break;
      attempts++;
    } while (attempts < 10);

    // 3. Insert the license key into software_keys table
    const { error: keyErr } = await supabase.from("software_keys").insert({
      license_key: licenseKey,
      status: "active",
      agency_id: newAgency.id,
      // Store metadata in the key record
      metadata: {
        contact_name,
        contact_email,
        contact_phone: contact_phone || null,
        website_url: website_url || null,
        internal_notes: internal_notes || null,
        sold_by,
        link_expiration: link_expiration || "30 days",
        type: "agency_invite",
      },
    });

    if (keyErr) {
      console.error("License key insert error:", keyErr);
      // Try without metadata if the column doesn't exist
      const { error: keyErr2 } = await supabase.from("software_keys").insert({
        license_key: licenseKey,
        status: "active",
        agency_id: newAgency.id,
      });
      if (keyErr2) {
        console.error("License key insert fallback error:", keyErr2);
      }
    }

    return NextResponse.json(
      {
        success: true,
        agency: newAgency,
        license_key: licenseKey,
        message: "Agency created and invitation ready.",
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("Admin agency invite error:", err);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
