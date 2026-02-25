import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key || url === "https://your-project.supabase.co") return null;
  return createClient(url, key);
}

export const dynamic = "force-dynamic";

/* GET — list all closer links */
export async function GET() {
  try {
    const supabase = getSupabase();
    if (!supabase) return NextResponse.json({ error: "Supabase not configured." }, { status: 503 });

    const { data: links, error } = await supabase
      .from("closer_links")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Enrich with agency names and client names
    const agencyIds = [...new Set((links || []).map((l) => l.agency_id))];
    const allClientIds = [...new Set((links || []).flatMap((l) => l.client_ids || []))];

    const agencyMap: Record<string, string> = {};
    const clientMap: Record<string, string> = {};

    if (agencyIds.length > 0) {
      const { data: agencies } = await supabase
        .from("agencies")
        .select("id, name")
        .in("id", agencyIds);
      for (const a of agencies || []) agencyMap[a.id] = a.name;
    }

    if (allClientIds.length > 0) {
      const { data: clients } = await supabase
        .from("clients")
        .select("id, name")
        .in("id", allClientIds);
      for (const c of clients || []) clientMap[c.id] = c.name;
    }

    const enriched = (links || []).map((link) => ({
      ...link,
      agency_name: agencyMap[link.agency_id] || "Unknown",
      client_names: (link.client_ids || []).map((id: string) => ({
        id,
        name: clientMap[id] || "Unknown",
      })),
    }));

    return NextResponse.json({ links: enriched }, { status: 200 });
  } catch (err) {
    console.error("Closer links list error:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

/* POST — create a new closer link */
export async function POST(req: NextRequest) {
  try {
    const supabase = getSupabase();
    if (!supabase) return NextResponse.json({ error: "Supabase not configured." }, { status: 503 });

    const body = await req.json();
    const { name, agency_id, client_ids, expires_at } = body;

    if (!name || !agency_id || !client_ids || client_ids.length === 0) {
      return NextResponse.json(
        { error: "name, agency_id, and at least one client_id are required." },
        { status: 400 }
      );
    }

    // Generate a secure random token
    const token = crypto.randomBytes(24).toString("base64url");

    const { data, error } = await supabase
      .from("closer_links")
      .insert({
        token,
        agency_id,
        name,
        client_ids,
        expires_at: expires_at || null,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ link: data }, { status: 201 });
  } catch (err) {
    console.error("Closer link create error:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
