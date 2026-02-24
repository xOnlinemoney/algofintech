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

/**
 * GET /api/agency/domain-lookup?domain=client.theiragency.com
 *
 * Used by middleware to resolve a custom domain to an agency.
 * Returns agency info if the domain is verified/active, 404 otherwise.
 */
export async function GET(request: NextRequest) {
  try {
    const domain = request.nextUrl.searchParams.get("domain");
    if (!domain) {
      return NextResponse.json({ error: "domain parameter required" }, { status: 400 });
    }

    const supabase = getSupabase();
    if (!supabase) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 });
    }

    // Look up domain with verified or active status
    const { data: domainRecord, error } = await supabase
      .from("agency_domains")
      .select("id, agency_id, domain, status")
      .eq("domain", domain.toLowerCase())
      .in("status", ["verified", "active"])
      .single();

    if (error || !domainRecord) {
      return NextResponse.json({ error: "Domain not found" }, { status: 404 });
    }

    // Get agency details
    const { data: agency } = await supabase
      .from("agencies")
      .select("id, name, slug, settings")
      .eq("id", domainRecord.agency_id)
      .single();

    if (!agency) {
      return NextResponse.json({ error: "Agency not found" }, { status: 404 });
    }

    return NextResponse.json({
      agency_id: agency.id,
      agency_name: agency.name,
      agency_slug: agency.slug,
      domain: domainRecord.domain,
      status: domainRecord.status,
    });
  } catch (err) {
    console.error("Domain lookup error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
