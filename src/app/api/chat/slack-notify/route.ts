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

// POST: Send a Slack notification when a client requests live support
export async function POST(req: NextRequest) {
  try {
    const { agency_id, client_name, client_email, question, conversation_id } =
      await req.json();

    if (!agency_id) {
      return NextResponse.json({ error: "agency_id required" }, { status: 400 });
    }

    // Look up agency's Slack webhook URL from settings
    const supabase = getSupabase();
    let slackWebhookUrl: string | null = null;

    if (supabase) {
      const { data: agency } = await supabase
        .from("agencies")
        .select("settings")
        .eq("id", agency_id)
        .single();

      slackWebhookUrl = agency?.settings?.slack_webhook_url || null;
    }

    // Also check for a global env fallback
    if (!slackWebhookUrl) {
      slackWebhookUrl = process.env.SLACK_WEBHOOK_URL || null;
    }

    if (!slackWebhookUrl) {
      // No Slack configured — that's okay, just skip
      return NextResponse.json({
        sent: false,
        reason: "No Slack webhook configured",
      });
    }

    // Build Slack message
    const slackPayload = {
      text: `:speech_balloon: *New Live Support Request*`,
      blocks: [
        {
          type: "header",
          text: {
            type: "plain_text",
            text: "New Live Chat Request",
            emoji: true,
          },
        },
        {
          type: "section",
          fields: [
            {
              type: "mrkdwn",
              text: `*Client:*\n${client_name || "Unknown"}`,
            },
            {
              type: "mrkdwn",
              text: `*Email:*\n${client_email || "N/A"}`,
            },
          ],
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*Question:*\n> ${question || "Client requested live support"}`,
          },
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*Conversation ID:*\n\`${conversation_id || "N/A"}\``,
          },
        },
        {
          type: "actions",
          elements: [
            {
              type: "button",
              text: {
                type: "plain_text",
                text: "Open Chat Inbox",
                emoji: true,
              },
              style: "primary",
              url: `${process.env.NEXT_PUBLIC_APP_URL || "https://algofintech.com"}/dashboard/chat`,
            },
          ],
        },
      ],
    };

    const resp = await fetch(slackWebhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(slackPayload),
    });

    if (!resp.ok) {
      console.error("Slack webhook error:", await resp.text());
      return NextResponse.json({ sent: false, reason: "Slack API error" });
    }

    return NextResponse.json({ sent: true });
  } catch (err) {
    console.error("Slack notify error:", err);
    return NextResponse.json({ sent: false, reason: "Internal error" });
  }
}
