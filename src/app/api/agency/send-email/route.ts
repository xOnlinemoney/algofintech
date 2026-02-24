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

export const dynamic = "force-dynamic";

/**
 * Replace {{placeholder}} tokens in a string with values from a map.
 */
function interpolate(
  template: string,
  fields: Record<string, string>
): string {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return fields[key] !== undefined ? fields[key] : match;
  });
}

/**
 * Build an HTML email from plain text body.
 * Converts newlines to <br>, wraps in a clean responsive template.
 */
function buildHtml(body: string, agencyName: string, primaryColor: string): string {
  const htmlBody = body
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\n/g, "<br>");

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Email from ${agencyName}</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background-color:${primaryColor};padding:24px 32px;">
              <h1 style="margin:0;color:#ffffff;font-size:20px;font-weight:700;">${agencyName}</h1>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:32px;color:#374151;font-size:15px;line-height:1.7;">
              ${htmlBody}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:20px 32px;border-top:1px solid #e5e7eb;color:#9ca3af;font-size:12px;">
              Sent by ${agencyName}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function POST(req: NextRequest) {
  try {
    const supabase = getSupabase();
    if (!supabase)
      return NextResponse.json({ error: "Service unavailable." }, { status: 503 });

    const body = await req.json();
    const { agency_id, template_type, to_email, to_name, dynamic_fields } = body;

    if (!agency_id || !template_type || !to_email) {
      return NextResponse.json(
        { error: "agency_id, template_type, and to_email are required." },
        { status: 400 }
      );
    }

    // 1. Load agency + settings
    const { data: agency, error: agencyErr } = await supabase
      .from("agencies")
      .select("name, settings, primary_color")
      .eq("id", agency_id)
      .single();

    if (agencyErr || !agency) {
      return NextResponse.json({ error: "Agency not found." }, { status: 404 });
    }

    const settings = agency.settings || {};
    const templates = settings.email_templates || {};
    const template = templates[template_type];

    if (!template || !template.enabled) {
      return NextResponse.json(
        { error: `Email template "${template_type}" is not enabled.` },
        { status: 400 }
      );
    }

    // 2. Interpolate template
    const fields: Record<string, string> = {
      agency_name: agency.name || "Our Agency",
      support_email: settings.support_email || settings.reply_to_email || "",
      ...dynamic_fields,
    };

    const subject = interpolate(template.subject || "Message from " + agency.name, fields);
    const textBody = interpolate(template.body || "", fields);
    const htmlBody = buildHtml(textBody, agency.name || "Agency", agency.primary_color || "#3b82f6");

    // 3. Build nodemailer transport
    let transportConfig: nodemailer.TransportOptions;

    if (settings.smtp_host) {
      // Agency's custom SMTP
      const port = Number(settings.smtp_port) || 587;
      transportConfig = {
        host: settings.smtp_host,
        port,
        secure: port === 465,
        auth: {
          user: settings.smtp_user || "",
          pass: settings.smtp_pass || "",
        },
        ...(port === 587 ? { requireTLS: true } : {}),
      } as nodemailer.TransportOptions;
    } else if (process.env.DEFAULT_SMTP_HOST) {
      // Platform default SMTP
      const port = Number(process.env.DEFAULT_SMTP_PORT) || 587;
      transportConfig = {
        host: process.env.DEFAULT_SMTP_HOST,
        port,
        secure: port === 465,
        auth: {
          user: process.env.DEFAULT_SMTP_USER || "",
          pass: process.env.DEFAULT_SMTP_PASS || "",
        },
        ...(port === 587 ? { requireTLS: true } : {}),
      } as nodemailer.TransportOptions;
    } else {
      return NextResponse.json(
        { error: "No email configuration found. Please configure SMTP in settings or set DEFAULT_SMTP env vars." },
        { status: 500 }
      );
    }

    const transporter = nodemailer.createTransport(transportConfig);

    // 4. Send email
    const fromEmail =
      settings.smtp_from_email ||
      settings.smtp_user ||
      settings.reply_to_email ||
      process.env.DEFAULT_SMTP_FROM ||
      "noreply@algofintech.com";
    const fromName = settings.sender_name || agency.name || "Agency";

    const info = await transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to: to_name ? `"${to_name}" <${to_email}>` : to_email,
      replyTo: settings.reply_to_email || fromEmail,
      subject,
      text: textBody,
      html: htmlBody,
    });

    console.log("Email sent:", info.messageId);

    return NextResponse.json({
      success: true,
      message_id: info.messageId,
    });
  } catch (err) {
    console.error("Send email error:", err);
    return NextResponse.json(
      { error: `Failed to send email: ${(err as Error).message}` },
      { status: 500 }
    );
  }
}
