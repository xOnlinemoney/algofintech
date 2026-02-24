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

// GET: fetch agency settings for the logged-in agency
export async function GET(request: NextRequest) {
  try {
    const agencyId = request.nextUrl.searchParams.get("agency_id");
    if (!agencyId) {
      return NextResponse.json({ error: "agency_id required" }, { status: 400 });
    }

    const supabase = getSupabase();
    if (!supabase) {
      return NextResponse.json({ error: "Supabase not configured." }, { status: 503 });
    }

    const { data: agency, error: agencyErr } = await supabase
      .from("agencies")
      .select("*")
      .eq("id", agencyId)
      .single();

    if (agencyErr || !agency) {
      return NextResponse.json({ error: "Agency not found." }, { status: 404 });
    }

    // Fetch license key
    const { data: softwareKeys } = await supabase
      .from("software_keys")
      .select("*")
      .eq("agency_id", agencyId)
      .order("created_at", { ascending: false });

    const agencyKey = (softwareKeys || [])[0] || null;

    // Get settings JSON (white-label config stored here)
    const settings = agency.settings || {};

    // Fetch domain status from agency_domains table
    const { data: domainRecord } = await supabase
      .from("agency_domains")
      .select("domain, status, verified_at, last_check, cname_target")
      .eq("agency_id", agencyId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    return NextResponse.json({
      agency: {
        id: agency.id,
        name: agency.name,
        slug: agency.slug,
        plan: agency.plan || "starter",
        status: agency.status || "active",
        created_at: agency.created_at,
        logo_url: agency.logo_url || null,
        primary_color: agency.primary_color || null,
        contact_email: agency.contact_email || null,
        contact_phone: agency.contact_phone || null,
        contact_name: agency.contact_name || null,
        website: agency.website || null,
        license_key: agencyKey?.license_key || null,
      },
      settings: {
        // Basic Info
        business_name: settings.business_name || agency.name || "",
        display_name: settings.display_name || "",
        // Branding
        primary_color: settings.primary_color || agency.primary_color || "#3b82f6",
        secondary_color: settings.secondary_color || "#10b981",
        bg_mode: settings.bg_mode || "dark",
        card_bg_color: settings.card_bg_color || "#0B0E14",
        // Logo
        logo_url: settings.logo_url || agency.logo_url || "",
        favicon_url: settings.favicon_url || "",
        // Domain & Email
        custom_domain: settings.custom_domain || "",
        sender_name: settings.sender_name || "",
        reply_to_email: settings.reply_to_email || "",
        use_custom_smtp: settings.use_custom_smtp || false,
        // Business Details
        business_address: settings.business_address || "",
        business_city: settings.business_city || "",
        business_state: settings.business_state || "",
        business_zip: settings.business_zip || "",
        business_country: settings.business_country || "",
        tax_id: settings.tax_id || "",
        // Support
        support_email: settings.support_email || "",
        support_phone: settings.support_phone || "",
        support_url: settings.support_url || "",
        welcome_message: settings.welcome_message || "",
        // API
        api_enabled: settings.api_enabled || false,
        webhook_url: settings.webhook_url || "",
      },
      domain: domainRecord
        ? {
            domain: domainRecord.domain,
            status: domainRecord.status,
            verified_at: domainRecord.verified_at,
            last_check: domainRecord.last_check,
            cname_target: domainRecord.cname_target,
          }
        : null,
    });
  } catch (err) {
    console.error("Agency settings GET error:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

// PUT: update agency settings
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      agency_id,
      settings: newSettings,
      contact_email,
      contact_phone,
      contact_name,
      website,
      name,
    } = body;

    if (!agency_id) {
      return NextResponse.json({ error: "agency_id required" }, { status: 400 });
    }

    const supabase = getSupabase();
    if (!supabase) {
      return NextResponse.json({ error: "Supabase not configured." }, { status: 503 });
    }

    // Build agency-level updates (columns on the agencies table)
    const agencyUpdates: Record<string, unknown> = {};
    if (name !== undefined) agencyUpdates.name = name;
    if (contact_email !== undefined) agencyUpdates.contact_email = contact_email;
    if (contact_phone !== undefined) agencyUpdates.contact_phone = contact_phone;
    if (contact_name !== undefined) agencyUpdates.contact_name = contact_name;
    if (website !== undefined) agencyUpdates.website = website;

    // Save logo_url and primary_color at agency level too
    if (newSettings?.logo_url !== undefined) agencyUpdates.logo_url = newSettings.logo_url;
    if (newSettings?.primary_color !== undefined) agencyUpdates.primary_color = newSettings.primary_color;

    // Merge new settings into existing settings JSONB column
    const { data: existing } = await supabase
      .from("agencies")
      .select("settings")
      .eq("id", agency_id)
      .single();

    const mergedSettings = { ...(existing?.settings || {}), ...newSettings };
    agencyUpdates.settings = mergedSettings;
    agencyUpdates.updated_at = new Date().toISOString();

    const { error: updateErr } = await supabase
      .from("agencies")
      .update(agencyUpdates)
      .eq("id", agency_id);

    if (updateErr) {
      console.error("Agency settings update error:", updateErr);
      return NextResponse.json(
        { error: `Failed to update settings: ${updateErr.message}` },
        { status: 500 }
      );
    }

    // Sync custom_domain to agency_domains table
    if (newSettings?.custom_domain !== undefined) {
      const domainValue = (newSettings.custom_domain || "").trim().toLowerCase();

      if (domainValue) {
        // Upsert: insert or update the domain record
        // First check if this agency already has a domain record
        const { data: existingDomain } = await supabase
          .from("agency_domains")
          .select("id, domain")
          .eq("agency_id", agency_id)
          .limit(1)
          .single();

        if (existingDomain) {
          // Update existing record
          if (existingDomain.domain !== domainValue) {
            // Domain changed — reset to pending
            await supabase
              .from("agency_domains")
              .update({
                domain: domainValue,
                status: "pending",
                verified_at: null,
                last_check: null,
              })
              .eq("id", existingDomain.id);
          }
        } else {
          // Insert new record
          await supabase.from("agency_domains").insert({
            agency_id,
            domain: domainValue,
            status: "pending",
          });
        }
      } else {
        // Domain cleared — delete the record
        await supabase
          .from("agency_domains")
          .delete()
          .eq("agency_id", agency_id);
      }
    }

    // Also sync contact info to software_keys metadata
    if (contact_name || contact_email || contact_phone) {
      const { data: existingKey } = await supabase
        .from("software_keys")
        .select("id, metadata")
        .eq("agency_id", agency_id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (existingKey) {
        const metadata = existingKey.metadata || {};
        if (contact_name !== undefined) metadata.contact_name = contact_name;
        if (contact_email !== undefined) metadata.contact_email = contact_email;
        if (contact_phone !== undefined) metadata.contact_phone = contact_phone;

        await supabase
          .from("software_keys")
          .update({ metadata })
          .eq("id", existingKey.id);
      }
    }

    return NextResponse.json({ message: "Settings saved!" }, { status: 200 });
  } catch (err) {
    console.error("Agency settings PUT error:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
