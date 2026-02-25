import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key || url === "https://your-project.supabase.co") return null;
  return createClient(url, key);
}

// POST: Create a new chat conversation
export async function POST(req: NextRequest) {
  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ error: "No Supabase" }, { status: 503 });
  }

  try {
    const { client_id, client_name, client_email, agency_id } = await req.json();

    if (!client_id || !agency_id) {
      return NextResponse.json(
        { error: "client_id and agency_id are required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("chat_conversations")
      .insert({
        client_id,
        client_name: client_name || "Unknown",
        client_email: client_email || null,
        agency_id,
        status: "ai", // starts with AI handling
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error("Create conversation error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ conversation: data });
  } catch (err) {
    console.error("Conversation POST error:", err);
    return NextResponse.json({ error: "Failed to create conversation" }, { status: 500 });
  }
}

// GET: List conversations for an agency (admin inbox)
export async function GET(req: NextRequest) {
  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ error: "No Supabase" }, { status: 503 });
  }

  try {
    const agencyId = req.nextUrl.searchParams.get("agency_id");
    const status = req.nextUrl.searchParams.get("status"); // "live", "ai", "closed"

    if (!agencyId) {
      return NextResponse.json({ error: "agency_id required" }, { status: 400 });
    }

    let query = supabase
      .from("chat_conversations")
      .select("*")
      .eq("agency_id", agencyId)
      .order("updated_at", { ascending: false });

    if (status) {
      query = query.eq("status", status);
    }

    const { data, error } = await query.limit(100);

    if (error) {
      console.error("List conversations error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ conversations: data || [] });
  } catch (err) {
    console.error("Conversations GET error:", err);
    return NextResponse.json({ error: "Failed to list conversations" }, { status: 500 });
  }
}

// PUT: Update conversation status (e.g., escalate to live, close)
export async function PUT(req: NextRequest) {
  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ error: "No Supabase" }, { status: 503 });
  }

  try {
    const { conversation_id, status } = await req.json();

    if (!conversation_id || !status) {
      return NextResponse.json(
        { error: "conversation_id and status are required" },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("chat_conversations")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", conversation_id);

    if (error) {
      console.error("Update conversation error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: "Updated" });
  } catch (err) {
    console.error("Conversation PUT error:", err);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}
