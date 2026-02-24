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
    const { agency_id, name, email, role, department, invited_by } = body;

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

    return NextResponse.json({
      success: true,
      member,
      invite,
      invite_token: token,
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
