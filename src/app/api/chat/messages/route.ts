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

// POST: Send a message in a conversation
export async function POST(req: NextRequest) {
  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ error: "No Supabase" }, { status: 503 });
  }

  try {
    const { conversation_id, sender, sender_name, content } = await req.json();

    if (!conversation_id || !sender || !content) {
      return NextResponse.json(
        { error: "conversation_id, sender, and content are required" },
        { status: 400 }
      );
    }

    // sender = "client" | "ai" | "agent"
    const { data, error } = await supabase
      .from("chat_messages")
      .insert({
        conversation_id,
        sender,
        sender_name: sender_name || (sender === "ai" ? "AI Assistant" : "Support Agent"),
        content,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error("Send message error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Update conversation's updated_at
    await supabase
      .from("chat_conversations")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", conversation_id);

    return NextResponse.json({ message: data });
  } catch (err) {
    console.error("Message POST error:", err);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}

// GET: Get messages for a conversation
export async function GET(req: NextRequest) {
  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ error: "No Supabase" }, { status: 503 });
  }

  try {
    const conversationId = req.nextUrl.searchParams.get("conversation_id");

    if (!conversationId) {
      return NextResponse.json(
        { error: "conversation_id required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Get messages error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ messages: data || [] });
  } catch (err) {
    console.error("Messages GET error:", err);
    return NextResponse.json({ error: "Failed to get messages" }, { status: 500 });
  }
}
