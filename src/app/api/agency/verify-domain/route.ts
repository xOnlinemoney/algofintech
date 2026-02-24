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

const VERCEL_API = "https://api.vercel.com";

function getVercelConfig() {
  const token = process.env.VERCEL_API_TOKEN;
  const projectId = process.env.VERCEL_PROJECT_ID;
  if (!token || !projectId) return null;
  return { token, projectId };
}

// Resolve all DNS records for a domain
async function getDnsRecords(domain: string) {
  const results: {
    cname: string[];
    a: string[];
    aaaa: string[];
    ns: string[];
    errors: string[];
  } = { cname: [], a: [], aaaa: [], ns: [], errors: [] };

  // Check CNAME
  try {
    results.cname = await dns.resolveCname(domain);
  } catch (e: unknown) {
    const code = (e as { code?: string }).code;
    if (code !== "ENODATA" && code !== "ENOTFOUND") {
      results.errors.push(`CNAME lookup: ${code}`);
    }
  }

  // Check A records
  try {
    results.a = await dns.resolve4(domain);
  } catch (e: unknown) {
    const code = (e as { code?: string }).code;
    if (code !== "ENODATA" && code !== "ENOTFOUND") {
      results.errors.push(`A record lookup: ${code}`);
    }
  }

  // Check AAAA records
  try {
    results.aaaa = await dns.resolve6(domain);
  } catch (e: unknown) {
    const code = (e as { code?: string }).code;
    if (code !== "ENODATA" && code !== "ENOTFOUND") {
      results.errors.push(`AAAA record lookup: ${code}`);
    }
  }

  // Check NS (for the parent domain)
  const parts = domain.split(".");
  const parentDomain = parts.slice(-2).join(".");
  try {
    results.ns = await dns.resolveNs(parentDomain);
  } catch {
    // Ignore NS errors
  }

  return results;
}

/**
 * POST /api/agency/verify-domain
 * Body: { agency_id: string, domain: string }
 *
 * 1. Gets the expected DNS target from Vercel's domain API
 * 2. Performs real DNS lookups to check what's actually configured
 * 3. Compares and returns detailed diagnostics
 * 4. Updates the agency_domains record
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

    const now = new Date().toISOString();
    const domainLower = domain.toLowerCase();

    // ── Step 1: Ensure domain is registered on Vercel project ──
    // First try to get the domain's config from Vercel
    let expectedTarget: string | null = null;
    let vercelVerified = false;

    const getDomainRes = await fetch(
      `${VERCEL_API}/v9/projects/${vercel.projectId}/domains/${encodeURIComponent(domainLower)}`,
      {
        headers: { Authorization: `Bearer ${vercel.token}` },
      }
    );

    if (getDomainRes.ok) {
      const domainData = await getDomainRes.json();
      vercelVerified = domainData.verified === true;

      // Get the expected CNAME target from verification info
      if (domainData.verification && domainData.verification.length > 0) {
        const v = domainData.verification[0];
        expectedTarget = v.value || null;
      }
    } else if (getDomainRes.status === 404) {
      // Domain not on project yet — add it
      const addRes = await fetch(
        `${VERCEL_API}/v10/projects/${vercel.projectId}/domains`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${vercel.token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name: domainLower }),
        }
      );

      if (addRes.ok) {
        const addData = await addRes.json();
        vercelVerified = addData.verified === true;
        if (addData.verification && addData.verification.length > 0) {
          expectedTarget = addData.verification[0].value || null;
        }
      }
    }

    // If we still don't have an expected target, try triggering verify
    if (!expectedTarget && !vercelVerified) {
      const verifyRes = await fetch(
        `${VERCEL_API}/v9/projects/${vercel.projectId}/domains/${encodeURIComponent(domainLower)}/verify`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${vercel.token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (verifyRes.ok) {
        const verifyData = await verifyRes.json();
        vercelVerified = verifyData.verified === true;
        if (verifyData.verification && verifyData.verification.length > 0) {
          expectedTarget = verifyData.verification[0].value || null;
        }
      }
    }

    // Fallback target
    if (!expectedTarget && !vercelVerified) {
      expectedTarget = "cname.vercel-dns.com";
    }

    // ── Step 2: Pull actual DNS records ──
    const dnsRecords = await getDnsRecords(domainLower);

    // ── Step 3: Analyze what we found ──
    const issues: string[] = [];
    const findings: {
      type: string;
      host: string;
      value: string;
      status: "correct" | "incorrect" | "info";
    }[] = [];

    const hasAnyCname = dnsRecords.cname.length > 0;
    const hasAnyA = dnsRecords.a.length > 0;
    const hasAnyAAAA = dnsRecords.aaaa.length > 0;
    const hasAnyRecord = hasAnyCname || hasAnyA || hasAnyAAAA;

    // Check CNAME records
    for (const cname of dnsRecords.cname) {
      const isCorrect = expectedTarget
        ? cname.toLowerCase().replace(/\.$/, "") === expectedTarget.toLowerCase().replace(/\.$/, "")
        : cname.toLowerCase().includes("vercel");

      findings.push({
        type: "CNAME",
        host: domainLower,
        value: cname,
        status: isCorrect ? "correct" : "incorrect",
      });

      if (!isCorrect) {
        issues.push(
          `CNAME record is pointing to "${cname}" but it should point to "${expectedTarget}".`
        );
      }
    }

    // Check A records
    for (const ip of dnsRecords.a) {
      const isVercelIp = ip === "76.76.21.21" || ip.startsWith("76.76.");
      findings.push({
        type: "A",
        host: domainLower,
        value: ip,
        status: isVercelIp ? "info" : "incorrect",
      });

      if (!isVercelIp && hasAnyCname) {
        // Both CNAME and A exist — conflict
        issues.push(
          `Conflicting records detected: You have both a CNAME and an A record (${ip}). A CNAME record cannot coexist with other record types for the same hostname. Remove the A record.`
        );
      } else if (!isVercelIp && !hasAnyCname) {
        issues.push(
          `A record is pointing to ${ip} which is not a Vercel IP address. Your domain is pointing somewhere else. Please update it.`
        );
      }
    }

    // Check AAAA records for conflicts
    for (const ip of dnsRecords.aaaa) {
      findings.push({
        type: "AAAA",
        host: domainLower,
        value: ip,
        status: "info",
      });

      if (hasAnyCname) {
        issues.push(
          `Conflicting records: AAAA record (${ip}) found alongside a CNAME record. CNAME records cannot coexist with other record types. Remove the AAAA record.`
        );
      }
    }

    // No records at all
    if (!hasAnyRecord) {
      issues.push(
        `No DNS records found for ${domainLower}. The CNAME record has not been added yet, or DNS has not propagated. Please add a CNAME record pointing to "${expectedTarget}" at your domain registrar.`
      );
    }

    // ── Step 4: Determine final status ──
    const correctCname = dnsRecords.cname.some((c) => {
      const normalized = c.toLowerCase().replace(/\.$/, "");
      return (
        (expectedTarget && normalized === expectedTarget.toLowerCase().replace(/\.$/, "")) ||
        normalized.includes("vercel")
      );
    });

    const isVerified = vercelVerified || (correctCname && issues.length === 0);
    const newStatus = isVerified ? "verified" : issues.length === 0 && hasAnyRecord ? "pending" : "failed";

    // If we verified via Vercel but DNS looks good locally, also trigger Vercel verify
    if (correctCname && !vercelVerified) {
      // Trigger Vercel verification
      await fetch(
        `${VERCEL_API}/v9/projects/${vercel.projectId}/domains/${encodeURIComponent(domainLower)}/verify`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${vercel.token}`,
            "Content-Type": "application/json",
          },
        }
      ).catch(() => {});
    }

    // Update DB
    const updateData: Record<string, unknown> = {
      status: newStatus,
      last_check: now,
    };
    if (expectedTarget) {
      updateData.cname_target = expectedTarget;
    }
    if (isVerified) {
      updateData.verified_at = now;
    }
    await supabase
      .from("agency_domains")
      .update(updateData)
      .eq("id", domainRecord.id);

    // ── Step 5: Build response message ──
    let message: string;
    if (isVerified) {
      message = "Domain verified and active! SSL certificate will be provisioned automatically.";
    } else if (!hasAnyRecord) {
      message = `No DNS records found for ${domainLower}. Add a CNAME record at your domain registrar.`;
    } else if (issues.length > 0) {
      message = issues[0]; // Primary issue
    } else {
      message = "DNS records detected but still propagating. This can take up to 48 hours. Try again in a few minutes.";
    }

    return NextResponse.json({
      success: isVerified,
      status: newStatus,
      domain: domainLower,
      message,
      expected_target: expectedTarget,
      dns_records: findings,
      issues,
      nameservers: dnsRecords.ns,
      vercel_verified: vercelVerified,
      checked_at: now,
    });
  } catch (err) {
    console.error("Domain verification error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
