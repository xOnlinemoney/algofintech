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

const VERCEL_API = "https://api.vercel.com";

function getVercelConfig() {
  const token = process.env.VERCEL_API_TOKEN;
  const projectId = process.env.VERCEL_PROJECT_ID;
  if (!token || !projectId) return null;
  return { token, projectId };
}

/**
 * POST /api/agency/verify-domain
 * Body: { agency_id: string, domain: string }
 *
 * Calls Vercel's domain verification API to check if the domain
 * is properly configured. Updates the agency_domains record.
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

    const vercel = getVercelConfig();
    if (!vercel) {
      return NextResponse.json(
        { error: "Vercel API not configured. Please add VERCEL_API_TOKEN and VERCEL_PROJECT_ID to your environment variables." },
        { status: 503 }
      );
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

    // Step 1: Trigger Vercel domain verification
    const verifyRes = await fetch(
      `${VERCEL_API}/v9/projects/${vercel.projectId}/domains/${encodeURIComponent(domain.toLowerCase())}/verify`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${vercel.token}`,
          "Content-Type": "application/json",
        },
      }
    );

    const now = new Date().toISOString();

    if (!verifyRes.ok) {
      const errData = await verifyRes.json().catch(() => ({}));

      // If domain not found on Vercel project, try adding it first
      if (verifyRes.status === 404) {
        // Try to add the domain to the Vercel project
        const addRes = await fetch(
          `${VERCEL_API}/v10/projects/${vercel.projectId}/domains`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${vercel.token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ name: domain.toLowerCase() }),
          }
        );

        if (addRes.ok) {
          const addData = await addRes.json();

          // Domain was added — check if it needs verification
          if (addData.verified === false && addData.verification) {
            // Domain added but DNS not yet pointing correctly
            const verificationInfo = addData.verification[0];
            await supabase
              .from("agency_domains")
              .update({ status: "pending", last_check: now })
              .eq("id", domainRecord.id);

            return NextResponse.json({
              success: false,
              status: "pending",
              domain,
              message: `Domain added to project but DNS is not yet configured. Add a ${verificationInfo?.type || "CNAME"} record for "${verificationInfo?.domain || domain}" pointing to "${verificationInfo?.value || "cname.vercel-dns.com"}". Then click verify again.`,
              verification: addData.verification,
              checked_at: now,
            });
          }

          // Domain added and verified!
          await supabase
            .from("agency_domains")
            .update({ status: "verified", verified_at: now, last_check: now })
            .eq("id", domainRecord.id);

          return NextResponse.json({
            success: true,
            status: "verified",
            domain,
            message: "Domain verified and active! SSL certificate will be provisioned automatically.",
            checked_at: now,
          });
        }

        const addErrData = await addRes.json().catch(() => ({}));
        await supabase
          .from("agency_domains")
          .update({ status: "failed", last_check: now })
          .eq("id", domainRecord.id);

        return NextResponse.json({
          success: false,
          status: "failed",
          domain,
          message: addErrData?.error?.message || "Failed to register domain with hosting provider. Please check the domain and try again.",
          checked_at: now,
        });
      }

      // Other Vercel API errors
      await supabase
        .from("agency_domains")
        .update({ status: "failed", last_check: now })
        .eq("id", domainRecord.id);

      return NextResponse.json({
        success: false,
        status: "failed",
        domain,
        message: errData?.error?.message || "Verification failed. Please check your DNS records and try again.",
        checked_at: now,
      });
    }

    // Verification API responded OK — parse the result
    const verifyData = await verifyRes.json();

    if (verifyData.verified === true) {
      // DNS is correct and domain is verified
      await supabase
        .from("agency_domains")
        .update({ status: "verified", verified_at: now, last_check: now })
        .eq("id", domainRecord.id);

      return NextResponse.json({
        success: true,
        status: "verified",
        domain,
        message: "Domain verified successfully! SSL certificate will be provisioned automatically.",
        checked_at: now,
      });
    } else {
      // Not yet verified — provide helpful info
      const verificationInfo = verifyData.verification?.[0];
      await supabase
        .from("agency_domains")
        .update({ status: "pending", last_check: now })
        .eq("id", domainRecord.id);

      let message = "DNS records not yet detected. ";
      if (verificationInfo) {
        message += `Please ensure you have a ${verificationInfo.type} record for "${verificationInfo.domain}" pointing to "${verificationInfo.value}". `;
      }
      message += "DNS changes can take up to 48 hours to propagate.";

      return NextResponse.json({
        success: false,
        status: "pending",
        domain,
        message,
        verification: verifyData.verification,
        checked_at: now,
      });
    }
  } catch (err) {
    console.error("Domain verification error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
