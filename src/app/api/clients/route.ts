import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import nodemailer from "nodemailer";

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key || url === "https://your-project.supabase.co") return null;
  return createClient(url, key);
}

// ─── GET: Fetch clients for a specific agency ──────────────
export async function GET(req: NextRequest) {
  try {
    const supabase = getSupabase();
    if (!supabase) {
      return NextResponse.json({ error: "Supabase not configured." }, { status: 503 });
    }

    // Filter by agency_id if provided — otherwise return empty
    const agencyId = req.nextUrl.searchParams.get("agency_id");

    let query = supabase
      .from("clients")
      .select("*")
      .order("created_at", { ascending: true });

    if (agencyId) {
      query = query.eq("agency_id", agencyId);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Supabase query error:", error);
      return NextResponse.json({ error: "Failed to fetch clients." }, { status: 500 });
    }

    return NextResponse.json({ data: data || [] }, { status: 200 });
  } catch (err) {
    console.error("API error:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

// ─── Helper: Generate a unique software key (XXXX-XXXX-XXXX-XXXX) ───
function generateSoftwareKey(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I to avoid confusion
  const segment = () =>
    Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  return `${segment()}-${segment()}-${segment()}-${segment()}`;
}

// ─── POST: Create a new client ──────────────────────────
export async function POST(req: NextRequest) {
  try {
    const supabase = getSupabase();
    if (!supabase) {
      return NextResponse.json({ error: "Supabase not configured." }, { status: 503 });
    }

    const body = await req.json();
    const { name, first_name, last_name, email, phone, max_accounts, agency_id, license_key, send_email } = body;
    // Support both combined "name" and split first/last — prefer split if available
    const resolvedName = (first_name && last_name)
      ? `${first_name.trim()} ${last_name.trim()}`
      : (name || "").trim();

    if (!resolvedName || !email) {
      return NextResponse.json({ error: "Name and email are required." }, { status: 400 });
    }

    // Use the agency_id passed from the client, or fall back to looking up by slug
    let resolvedAgencyId = agency_id;
    if (!resolvedAgencyId) {
      const { data: agency, error: agencyErr } = await supabase
        .from("agencies")
        .select("id")
        .eq("slug", "algofintech")
        .single();

      if (agencyErr || !agency) {
        return NextResponse.json(
          { error: "Agency not found. Please provide agency_id." },
          { status: 404 }
        );
      }
      resolvedAgencyId = agency.id;
    }

    // Generate a unique display ID (CL-XXXX)
    let clientId: string;
    let attempts = 0;
    do {
      clientId = `CL-${Math.floor(1000 + Math.random() * 9000)}`;
      const { data: existing } = await supabase
        .from("clients")
        .select("id")
        .eq("client_id", clientId)
        .eq("agency_id", resolvedAgencyId)
        .single();
      if (!existing) break;
      attempts++;
    } while (attempts < 20);

    // Use pre-generated license key if provided, otherwise generate one
    let softwareKey: string;
    if (license_key && typeof license_key === "string" && license_key.trim()) {
      softwareKey = license_key.trim();
      // Verify it doesn't already exist
      const { data: existingKey } = await supabase
        .from("software_keys")
        .select("id")
        .eq("license_key", softwareKey)
        .single();
      if (existingKey) {
        // Key collision — generate a new one
        softwareKey = generateSoftwareKey();
      }
    } else {
      let keyAttempts = 0;
      softwareKey = generateSoftwareKey();
      do {
        const { data: existingKey } = await supabase
          .from("software_keys")
          .select("id")
          .eq("license_key", softwareKey)
          .single();
        if (!existingKey) break;
        softwareKey = generateSoftwareKey();
        keyAttempts++;
      } while (keyAttempts < 20);
    }

    // Random gradient for avatar
    const gradients = [
      "from-blue-600 to-indigo-600",
      "from-emerald-600 to-teal-600",
      "from-purple-600 to-pink-600",
      "from-orange-500 to-red-500",
      "from-cyan-600 to-blue-600",
      "from-indigo-600 to-purple-600",
      "from-rose-500 to-pink-500",
      "from-amber-500 to-orange-500",
    ];
    const gradient = gradients[Math.floor(Math.random() * gradients.length)];

    const row = {
      client_id: clientId,
      agency_id: resolvedAgencyId,
      name: resolvedName,
      email,
      phone: phone || null,
      avatar_gradient: gradient,
      status: "active",
      liquidity: 0,
      total_pnl: 0,
      pnl_percentage: 0,
      active_strategies: 0,
      risk_level: "medium",
      broker: null,
      max_accounts: max_accounts || null, // NULL = unlimited
      software_key: softwareKey,
    };

    const { data, error } = await supabase
      .from("clients")
      .insert([row])
      .select()
      .single();

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json(
        { error: `Failed to create client: ${error.message}` },
        { status: 500 }
      );
    }

    // Also store the key in the software_keys table
    await supabase.from("software_keys").insert([
      {
        client_id: data.id,
        agency_id: resolvedAgencyId,
        license_key: softwareKey,
        status: "active",
      },
    ]);

    // Send onboarding email if requested (non-blocking — don't fail client creation)
    let emailSent = false;
    let emailError = "";
    if (send_email) {
      try {
        // Look up agency settings to check if template is enabled
        const { data: agency } = await supabase
          .from("agencies")
          .select("name, slug, settings, primary_color")
          .eq("id", resolvedAgencyId)
          .single();

        const settings = agency?.settings || {};
        const templates = settings.email_templates || {};
        const onboarding = templates.client_onboarding;

        if (!onboarding?.enabled) {
          emailError = "Email template is not enabled.";
          console.log("Onboarding email skipped — template not enabled");
        } else {
          // Build the signup URL + domain
          const customDomain = settings.custom_domain;
          const agencySlug = agency?.slug || settings.slug || agency?.name?.toLowerCase().replace(/\s+/g, "") || "";
          const domain = customDomain || (agencySlug ? `${agencySlug}.algofintech.com` : "algofintech.com");
          const signupUrl = `https://${domain}/client-signup`;

          // Split name for first/last
          const nameParts = resolvedName.split(" ");
          const fName = first_name?.trim() || nameParts[0] || "";
          const lName = last_name?.trim() || nameParts.slice(1).join(" ") || "";

          // Interpolate template fields
          const dynamicFields: Record<string, string> = {
            client_name: resolvedName,
            client_email: email,
            license_key: softwareKey,
            signup_url: signupUrl,
            agency_name: agency?.name || "Our Agency",
            support_email: settings.support_email || settings.reply_to_email || "",
            client_first_name: fName,
            client_last_name: lName,
            first_name: fName,
            last_name: lName,
            client_license_key: softwareKey,
            agency_domain: domain,
            domain: domain,
          };

          let subject = onboarding.subject || `Welcome from ${agency?.name || "Agency"}`;
          let textBody = onboarding.body || "";
          for (const [key, val] of Object.entries(dynamicFields)) {
            subject = subject.replace(new RegExp(`\\{\\{${key}\\}\\}`, "g"), val);
            textBody = textBody.replace(new RegExp(`\\{\\{${key}\\}\\}`, "g"), val);
          }

          // Build HTML email
          const agencyName = agency?.name || "Agency";
          const primaryColor = agency?.primary_color || "#3b82f6";
          const htmlBody = textBody.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br>");
          const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head><body style="margin:0;padding:0;background-color:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;"><table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;padding:40px 20px;"><tr><td align="center"><table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);"><tr><td style="background-color:${primaryColor};padding:24px 32px;"><h1 style="margin:0;color:#ffffff;font-size:20px;font-weight:700;">${agencyName}</h1></td></tr><tr><td style="padding:32px;color:#374151;font-size:15px;line-height:1.7;">${htmlBody}</td></tr><tr><td style="padding:20px 32px;border-top:1px solid #e5e7eb;color:#9ca3af;font-size:12px;">Sent by ${agencyName}</td></tr></table></td></tr></table></body></html>`;

          // Build nodemailer transport — inline instead of calling the separate API
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          let transportConfig: any;

          if (settings.smtp_host) {
            const port = Number(settings.smtp_port) || 587;
            transportConfig = {
              host: settings.smtp_host,
              port,
              secure: port === 465,
              auth: {
                user: settings.smtp_user || "",
                pass: settings.smtp_pass || "",
              },
            };
            // Gmail / port 587 needs STARTTLS
            if (port === 587) {
              transportConfig.requireTLS = true;
            }
          } else if (process.env.DEFAULT_SMTP_HOST) {
            const port = Number(process.env.DEFAULT_SMTP_PORT) || 587;
            transportConfig = {
              host: process.env.DEFAULT_SMTP_HOST,
              port,
              secure: port === 465,
              auth: {
                user: process.env.DEFAULT_SMTP_USER || "",
                pass: process.env.DEFAULT_SMTP_PASS || "",
              },
            };
            if (port === 587) {
              transportConfig.requireTLS = true;
            }
          } else {
            emailError = "No SMTP configuration found. Please configure SMTP in Settings → Domain & Email.";
            console.error("Email skipped — no SMTP config");
          }

          if (transportConfig) {
            console.log("SMTP config:", { host: transportConfig.host, port: transportConfig.port, user: transportConfig.auth?.user, secure: transportConfig.secure });

            const transporter = nodemailer.createTransport(transportConfig);

            // Verify SMTP connection before sending
            try {
              await transporter.verify();
              console.log("SMTP connection verified successfully");
            } catch (verifyErr) {
              console.error("SMTP verification failed:", verifyErr);
              emailError = `SMTP connection failed: ${(verifyErr as Error).message}`;
            }

            if (!emailError) {
              const fromEmail = settings.smtp_from_email || settings.smtp_user || settings.reply_to_email || process.env.DEFAULT_SMTP_FROM || "noreply@algofintech.com";
              const fromName = settings.sender_name || agencyName;

              const info = await transporter.sendMail({
                from: `"${fromName}" <${fromEmail}>`,
                to: `"${resolvedName}" <${email}>`,
                replyTo: settings.reply_to_email || fromEmail,
                subject,
                text: textBody,
                html,
              });

              console.log("Email sent successfully! Message ID:", info.messageId);
              emailSent = true;
            }
          }
        }
      } catch (emailErr) {
        const errMsg = (emailErr as Error).message || String(emailErr);
        console.error("Failed to send onboarding email:", errMsg);
        emailError = `Email failed: ${errMsg}`;
      }
    }

    return NextResponse.json({
      message: "Client created!",
      data,
      email_sent: emailSent,
      email_error: emailError || undefined,
    }, { status: 201 });
  } catch (err) {
    console.error("API error:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
