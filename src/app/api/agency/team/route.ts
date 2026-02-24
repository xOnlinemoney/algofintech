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

// ─── GET: Fetch all team members for an agency ──────────────
export async function GET(req: NextRequest) {
  try {
    const supabase = getSupabase();
    if (!supabase)
      return NextResponse.json({ error: "Service unavailable." }, { status: 503 });

    const agencyId = req.nextUrl.searchParams.get("agency_id");
    if (!agencyId)
      return NextResponse.json({ error: "agency_id is required." }, { status: 400 });

    // Fetch team members
    const { data: members, error: membersErr } = await supabase
      .from("agency_team_members")
      .select("*")
      .eq("agency_id", agencyId)
      .order("created_at", { ascending: true });

    if (membersErr) {
      console.error("Failed to fetch team members:", membersErr);
      return NextResponse.json({ error: "Failed to fetch team members." }, { status: 500 });
    }

    // Fetch pending invites
    const { data: invites, error: invitesErr } = await supabase
      .from("agency_invites")
      .select("*")
      .eq("agency_id", agencyId)
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    if (invitesErr) {
      console.error("Failed to fetch invites:", invitesErr);
    }

    // Fetch client assignments for each member
    const memberIds = (members || []).map((m: Record<string, unknown>) => m.id);
    let assignments: Record<string, unknown>[] = [];
    if (memberIds.length > 0) {
      const { data: assignData } = await supabase
        .from("agency_member_clients")
        .select("member_id, client_id")
        .in("member_id", memberIds);
      assignments = assignData || [];
    }

    // Group assignments by member_id
    const assignmentMap: Record<string, string[]> = {};
    for (const a of assignments) {
      const mid = a.member_id as string;
      if (!assignmentMap[mid]) assignmentMap[mid] = [];
      assignmentMap[mid].push(a.client_id as string);
    }

    // Enrich members with client count
    const enrichedMembers = (members || []).map((m: Record<string, unknown>) => ({
      ...m,
      assigned_clients: assignmentMap[m.id as string] || [],
      assigned_client_count: (assignmentMap[m.id as string] || []).length,
    }));

    return NextResponse.json({
      members: enrichedMembers,
      invites: invites || [],
    });
  } catch (err) {
    console.error("Team API error:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

// ─── POST: Invite a new team member ─────────────────────────
export async function POST(req: NextRequest) {
  try {
    const supabase = getSupabase();
    if (!supabase)
      return NextResponse.json({ error: "Service unavailable." }, { status: 503 });

    const body = await req.json();
    const { agency_id, name, first_name, last_name, email, role, department, invited_by, send_email } = body;

    if (!agency_id || !name || !email || !role) {
      return NextResponse.json(
        { error: "agency_id, name, email, and role are required." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check if email already exists as team member
    const { data: existing } = await supabase
      .from("agency_team_members")
      .select("id")
      .eq("agency_id", agency_id)
      .eq("email", normalizedEmail)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: "A team member with this email already exists." },
        { status: 409 }
      );
    }

    // Check if there's already a pending invite
    const { data: existingInvite } = await supabase
      .from("agency_invites")
      .select("id")
      .eq("agency_id", agency_id)
      .eq("email", normalizedEmail)
      .eq("status", "pending")
      .single();

    if (existingInvite) {
      return NextResponse.json(
        { error: "An invitation is already pending for this email." },
        { status: 409 }
      );
    }

    // Generate invite token
    const token = crypto.randomUUID().replace(/-/g, "") + crypto.randomUUID().replace(/-/g, "");

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

    // Create team member with pending status
    const { data: member, error: memberErr } = await supabase
      .from("agency_team_members")
      .insert([
        {
          agency_id,
          name,
          email: normalizedEmail,
          role,
          department: department || null,
          avatar_gradient: gradient,
          status: "pending",
        },
      ])
      .select()
      .single();

    if (memberErr) {
      console.error("Failed to create team member:", memberErr);
      return NextResponse.json(
        { error: `Failed to invite: ${memberErr.message}` },
        { status: 500 }
      );
    }

    // Create invite record
    const { data: invite, error: inviteErr } = await supabase
      .from("agency_invites")
      .insert([
        {
          agency_id,
          email: normalizedEmail,
          name,
          role,
          department: department || null,
          token,
          invited_by: invited_by || null,
          status: "pending",
        },
      ])
      .select()
      .single();

    if (inviteErr) {
      console.error("Failed to create invite:", inviteErr);
    }

    // Send invitation email if requested
    let emailSent = false;
    let emailError = "";
    if (send_email) {
      try {
        // Load agency settings for template + SMTP
        const { data: agency } = await supabase
          .from("agencies")
          .select("name, slug, settings, primary_color")
          .eq("id", agency_id)
          .single();

        const agencySettings = agency?.settings || {};
        const templates = agencySettings.email_templates || {};
        const tmpl = templates.team_invite;

        if (!tmpl?.enabled) {
          emailError = "Team invite email template is not enabled.";
          console.log("Team invite email skipped — template not enabled");
        } else {
          // Build invite/login URL
          const customDomain = agencySettings.custom_domain;
          const agencySlug = agency?.slug || agencySettings.slug || "";
          const domain = customDomain || (agencySlug ? `${agencySlug}.algofintech.com` : "algofintech.com");
          const inviteUrl = `https://${domain}/agency-login`;

          // Role display names
          const roleLabels: Record<string, string> = {
            admin: "Admin",
            sales: "Sales Rep",
            support: "Support / VA",
            developer: "IT / Developer",
          };

          const fName = first_name?.trim() || name.split(" ")[0] || "";
          const lName = last_name?.trim() || name.split(" ").slice(1).join(" ") || "";

          const dynamicFields: Record<string, string> = {
            member_first_name: fName,
            member_last_name: lName,
            member_name: name,
            member_email: normalizedEmail,
            member_role: roleLabels[role] || role,
            member_department: department || "—",
            invite_url: inviteUrl,
            agency_name: agency?.name || "Our Agency",
            agency_domain: domain,
            support_email: agencySettings.support_email || agencySettings.reply_to_email || "",
          };

          let subject = tmpl.subject || `You've been invited to join ${agency?.name || "our team"}`;
          let textBody = tmpl.body || "";
          for (const [k, v] of Object.entries(dynamicFields)) {
            subject = subject.replace(new RegExp(`\\{\\{${k}\\}\\}`, "g"), v);
            textBody = textBody.replace(new RegExp(`\\{\\{${k}\\}\\}`, "g"), v);
          }

          // Build HTML
          const agencyName = agency?.name || "Agency";
          const primaryColor = agency?.primary_color || "#3b82f6";
          const htmlBody = textBody.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br>");
          const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head><body style="margin:0;padding:0;background-color:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;"><table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;padding:40px 20px;"><tr><td align="center"><table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);"><tr><td style="background-color:${primaryColor};padding:24px 32px;"><h1 style="margin:0;color:#ffffff;font-size:20px;font-weight:700;">${agencyName}</h1></td></tr><tr><td style="padding:32px;color:#374151;font-size:15px;line-height:1.7;">${htmlBody}</td></tr><tr><td style="padding:20px 32px;border-top:1px solid #e5e7eb;color:#9ca3af;font-size:12px;">Sent by ${agencyName}</td></tr></table></td></tr></table></body></html>`;

          // Build SMTP transport
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          let transportConfig: any;
          if (agencySettings.smtp_host) {
            const port = Number(agencySettings.smtp_port) || 587;
            const smtpPass = (agencySettings.smtp_pass || "").replace(/\s/g, "");
            transportConfig = {
              host: agencySettings.smtp_host,
              port,
              secure: port === 465,
              auth: { user: (agencySettings.smtp_user || "").trim(), pass: smtpPass },
              ...(port === 587 ? { requireTLS: true } : {}),
            };
          } else if (process.env.DEFAULT_SMTP_HOST) {
            const port = Number(process.env.DEFAULT_SMTP_PORT) || 587;
            transportConfig = {
              host: process.env.DEFAULT_SMTP_HOST,
              port,
              secure: port === 465,
              auth: { user: process.env.DEFAULT_SMTP_USER || "", pass: process.env.DEFAULT_SMTP_PASS || "" },
              ...(port === 587 ? { requireTLS: true } : {}),
            };
          } else {
            emailError = "No SMTP configuration found.";
          }

          if (transportConfig && !emailError) {
            const transporter = nodemailer.createTransport(transportConfig);
            await transporter.verify();

            const fromEmail = agencySettings.smtp_from_email || agencySettings.smtp_user || agencySettings.reply_to_email || process.env.DEFAULT_SMTP_FROM || "noreply@algofintech.com";
            const fromName = agencySettings.sender_name || agencyName;

            const info = await transporter.sendMail({
              from: `"${fromName}" <${fromEmail}>`,
              to: `"${name}" <${normalizedEmail}>`,
              replyTo: agencySettings.reply_to_email || fromEmail,
              subject,
              text: textBody,
              html,
            });
            console.log("Team invite email sent:", info.messageId);
            emailSent = true;
          }
        }
      } catch (emailErr) {
        const errMsg = (emailErr as Error).message || String(emailErr);
        console.error("Failed to send team invite email:", errMsg);
        emailError = `Email failed: ${errMsg}`;
      }
    }

    return NextResponse.json({
      success: true,
      member,
      invite,
      invite_token: token,
      email_sent: emailSent,
      email_error: emailError || undefined,
    }, { status: 201 });
  } catch (err) {
    console.error("Team invite error:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

// ─── PUT: Update a team member (role, status, department, clients) ───
export async function PUT(req: NextRequest) {
  try {
    const supabase = getSupabase();
    if (!supabase)
      return NextResponse.json({ error: "Service unavailable." }, { status: 503 });

    const body = await req.json();
    const { member_id, agency_id, role, status, department, assigned_client_ids } = body;

    if (!member_id || !agency_id) {
      return NextResponse.json(
        { error: "member_id and agency_id are required." },
        { status: 400 }
      );
    }

    // Build update payload
    const updates: Record<string, unknown> = {};
    if (role) updates.role = role;
    if (status) updates.status = status;
    if (department !== undefined) updates.department = department;

    if (Object.keys(updates).length > 0) {
      const { error: updateErr } = await supabase
        .from("agency_team_members")
        .update(updates)
        .eq("id", member_id)
        .eq("agency_id", agency_id);

      if (updateErr) {
        console.error("Failed to update team member:", updateErr);
        return NextResponse.json(
          { error: `Failed to update: ${updateErr.message}` },
          { status: 500 }
        );
      }
    }

    // Update client assignments if provided
    if (Array.isArray(assigned_client_ids)) {
      // Remove all existing assignments
      await supabase
        .from("agency_member_clients")
        .delete()
        .eq("member_id", member_id);

      // Insert new assignments
      if (assigned_client_ids.length > 0) {
        const rows = assigned_client_ids.map((cid: string) => ({
          member_id,
          client_id: cid,
        }));
        await supabase.from("agency_member_clients").insert(rows);
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Team update error:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

// ─── DELETE: Remove a team member ────────────────────────────
export async function DELETE(req: NextRequest) {
  try {
    const supabase = getSupabase();
    if (!supabase)
      return NextResponse.json({ error: "Service unavailable." }, { status: 503 });

    const memberId = req.nextUrl.searchParams.get("member_id");
    const agencyId = req.nextUrl.searchParams.get("agency_id");

    if (!memberId || !agencyId) {
      return NextResponse.json(
        { error: "member_id and agency_id are required." },
        { status: 400 }
      );
    }

    // Prevent deleting owner
    const { data: member } = await supabase
      .from("agency_team_members")
      .select("role")
      .eq("id", memberId)
      .eq("agency_id", agencyId)
      .single();

    if (member?.role === "owner") {
      return NextResponse.json(
        { error: "Cannot remove the agency owner." },
        { status: 403 }
      );
    }

    // Delete member (cascades to agency_member_clients)
    const { error } = await supabase
      .from("agency_team_members")
      .delete()
      .eq("id", memberId)
      .eq("agency_id", agencyId);

    if (error) {
      console.error("Failed to delete team member:", error);
      return NextResponse.json(
        { error: `Failed to remove: ${error.message}` },
        { status: 500 }
      );
    }

    // Also revoke any pending invites for this email
    const { data: memberData } = await supabase
      .from("agency_team_members")
      .select("email")
      .eq("id", memberId)
      .single();

    if (memberData?.email) {
      await supabase
        .from("agency_invites")
        .update({ status: "revoked" })
        .eq("agency_id", agencyId)
        .eq("email", memberData.email)
        .eq("status", "pending");
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Team delete error:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
