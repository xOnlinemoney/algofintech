import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key || url === "https://your-project.supabase.co") return null;
  return createClient(url, key);
}

export const dynamic = "force-dynamic";

/* PUT — update a closer link */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = getSupabase();
    if (!supabase) return NextResponse.json({ error: "Supabase not configured." }, { status: 503 });

    const body = await req.json();
    const updates: Record<string, unknown> = {};

    if (body.name !== undefined) updates.name = body.name;
    if (body.client_ids !== undefined) updates.client_ids = body.client_ids;
    if (body.is_active !== undefined) updates.is_active = body.is_active;
    if (body.expires_at !== undefined) updates.expires_at = body.expires_at;
    updates.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from("closer_links")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ link: data }, { status: 200 });
  } catch (err) {
    console.error("Closer link update error:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

/* DELETE — remove a closer link */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = getSupabase();
    if (!supabase) return NextResponse.json({ error: "Supabase not configured." }, { status: 503 });

    const { error } = await supabase
      .from("closer_links")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: "Deleted." }, { status: 200 });
  } catch (err) {
    console.error("Closer link delete error:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
