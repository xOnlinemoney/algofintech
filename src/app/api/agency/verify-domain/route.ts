import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import dns from "dns/promises";

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key || url === "https://your-project.supabase.co") return null;
  return createClient(url, key);
}

export const dynamic = "force-dynamic";

const EXPECTED_CNAME = "cname.algofintech.com";

/**
 * POST /api/agency/verify-domain
 * Body: { agency_id: string, domain: string }
 *
 * Performs a DNS CNAME lookup on the provided domain and checks
 * if it points to our CNAME target. Updates the agency_domains record.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { agency_id, domain } = body;

    if (!agency_id || !domain) {
      return NextResponse.json(
        { error: "agency_id and domain are required" },
        { status: 400 }
      );
    }

    const supabase = getSupabase();
    if (!supabase) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 });
    }

    // Verify the domain belongs to this agency
    const { data: domainRecord, error: lookupErr } = await supabase
      .from("agency_domains")
      .select("*")
      .eq("agency_id", agency_id)
      .eq("domain", domain.toLowerCase())
      .single();

    if (lookupErr || !domainRecord) {
      return NextResponse.json(
        { error: "Domain not found for this agency. Save your settings first." },
        { status: 404 }
      );
    }

    // Perform DNS CNAME lookup
    let dnsResult: {
      success: boolean;
      found_cname: string | null;
      error_code: string | null;
      message: string;
    };

    try {
      const records = await dns.resolveCname(domain.toLowerCase());
      const found = records[0] || null;
      const isCorrect = records.some(
        (r) => r.toLowerCase() === EXPECTED_CNAME.toLowerCase()
      );

      if (isCorrect) {
        dnsResult = {
          success: true,
          found_cname: found,
          error_code: null,
          message: "DNS records verified successfully! Your domain is ready.",
        };
      } else {
        dnsResult = {
          success: false,
          found_cname: found,
          error_code: "WRONG_CNAME",
          message: `CNAME record found but points to "${found}" instead of "${EXPECTED_CNAME}". Please update your DNS records.`,
        };
      }
    } catch (dnsErr: unknown) {
      const code = (dnsErr as { code?: string }).code || "UNKNOWN";
      let message = "DNS verification failed.";

      if (code === "ENOTFOUND" || code === "ENODATA") {
        message =
          "No CNAME record found for this domain. Please add a CNAME record pointing to " +
          EXPECTED_CNAME +
          " and try again. DNS changes can take up to 48 hours to propagate.";
      } else if (code === "ETIMEOUT") {
        message =
          "DNS lookup timed out. This might be a temporary issue — please try again in a few minutes.";
      } else {
        message = `DNS lookup error (${code}). Please check your domain configuration and try again.`;
      }

      dnsResult = {
        success: false,
        found_cname: null,
        error_code: code,
        message,
      };
    }

    // Update the domain record
    const now = new Date().toISOString();
    const newStatus = dnsResult.success ? "verified" : "failed";

    const updateData: Record<string, unknown> = {
      status: newStatus,
      last_check: now,
    };

    if (dnsResult.success) {
      updateData.verified_at = now;
    }

    await supabase
      .from("agency_domains")
      .update(updateData)
      .eq("id", domainRecord.id);

    return NextResponse.json({
      success: dnsResult.success,
      status: newStatus,
      domain,
      expected_cname: EXPECTED_CNAME,
      found_cname: dnsResult.found_cname,
      message: dnsResult.message,
      checked_at: now,
    });
  } catch (err) {
    console.error("Domain verification error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
