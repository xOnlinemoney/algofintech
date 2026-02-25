import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { KNOWLEDGE_BASE } from "@/lib/knowledge-base";

export const dynamic = "force-dynamic";
export const maxDuration = 30; // Allow up to 30 seconds for AI response

// ─── AI Chat Agent powered by Claude Haiku 4.5 ─────────────
// Uses the full knowledge base as context and ONLY answers from it.
// Returns structured responses with optional page links.

// Map of relevant dashboard pages for the AI to reference
const PAGE_LINKS: Record<string, { label: string; href: string }> = {
  accounts: { label: "Go to Accounts", href: "/client-dashboard/accounts" },
  "connect-guide": { label: "View Connection Guide", href: "/client-dashboard/connect-guide" },
  "prop-firm-guide": { label: "View Prop Firm Guide", href: "/client-dashboard/prop-firm-guide" },
  performance: { label: "View Performance", href: "/client-dashboard/performance" },
  activity: { label: "View Trading Activity", href: "/client-dashboard/activity" },
  payments: { label: "Go to Payments", href: "/client-dashboard/payments" },
  dashboard: { label: "Go to Dashboard", href: "/client-dashboard" },
  faq: { label: "View FAQ", href: "/client-dashboard/faq" },
  "connect-account": { label: "Connect New Account", href: "/client-dashboard/accounts?connect=1" },
};

function getAnthropicClient(): Anthropic | null {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;
  return new Anthropic({ apiKey });
}

const SYSTEM_PROMPT = `You are the AI support assistant for Analytic Algo, a professional algorithmic trading service. You help clients by answering their questions using ONLY the information provided in the knowledge base below.

CRITICAL RULES:
1. ONLY answer questions using information from the knowledge base provided. Never make up information or use outside knowledge.
2. If the question cannot be answered from the knowledge base, respond with EXACTLY: {"found": false}
3. Keep responses friendly, clear, and concise — like you're talking to someone who may not know anything about trading.
4. Use simple language. Avoid jargon unless it's defined in the knowledge base.
5. NEVER mention that you're reading from a knowledge base or reference any internal documents.
6. When relevant, suggest which page the client should visit by including a "link_key" in your response.
7. Do NOT say things like "according to our knowledge base" or "based on the information provided."
8. Speak as a natural support agent — as if you personally know the service.
9. NEVER mention "breaking any rules" or similar phrases — instead say things like "within the firm's guidelines."
10. For questions about connecting accounts, prop firms, payments, or performance — always include the relevant link.

RESPONSE FORMAT:
Always respond with valid JSON in this exact format:
{"found": true, "answer": "Your helpful answer here", "link_key": "optional-page-key"}

Available link_key values: accounts, connect-guide, prop-firm-guide, performance, activity, payments, dashboard, faq, connect-account

If no link is relevant, omit the link_key field.
If you truly cannot answer from the knowledge base, respond with: {"found": false}

KNOWLEDGE BASE:
${KNOWLEDGE_BASE}`;

export async function POST(req: NextRequest) {
  try {
    const { question } = await req.json();

    if (!question || typeof question !== "string") {
      return NextResponse.json({ error: "question is required" }, { status: 400 });
    }

    const client = getAnthropicClient();

    if (!client) {
      // Fallback: no API key configured
      return NextResponse.json({
        found: false,
        message: "I'm temporarily unable to process your question. Would you like to speak with a live support agent?",
        results: [],
      });
    }

    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: question,
        },
      ],
    });

    // Extract text from response
    const textBlock = response.content.find((block) => block.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      return NextResponse.json({
        found: false,
        message: "I had trouble understanding that. Could you rephrase your question?",
        results: [],
      });
    }

    // Parse the JSON response from Claude
    let parsed: { found: boolean; answer?: string; link_key?: string };
    try {
      // Clean any markdown code fences from the response
      let cleanText = textBlock.text.trim();
      if (cleanText.startsWith("```")) {
        cleanText = cleanText.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
      }
      parsed = JSON.parse(cleanText);
    } catch {
      // If Claude didn't return valid JSON, try to use the raw text as an answer
      const rawText = textBlock.text.trim();
      if (rawText.length > 10 && !rawText.includes('"found": false') && !rawText.includes('"found":false')) {
        parsed = { found: true, answer: rawText };
      } else {
        parsed = { found: false };
      }
    }

    if (!parsed.found || !parsed.answer) {
      return NextResponse.json({
        found: false,
        message:
          "I couldn't find an answer to your question in our knowledge base. Would you like to connect with a live support agent who can help you?",
        results: [],
      });
    }

    // Build the result with optional link
    const result: {
      question: string;
      answer: string;
      category: string;
      score: number;
      link?: { label: string; href: string };
    } = {
      question: question,
      answer: parsed.answer,
      category: "AI Response",
      score: 100,
    };

    // Attach link if AI suggested one
    if (parsed.link_key && PAGE_LINKS[parsed.link_key]) {
      result.link = PAGE_LINKS[parsed.link_key];
    }

    return NextResponse.json({
      found: true,
      results: [result],
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error("Chat AI error:", errorMessage, err);
    return NextResponse.json({
      found: false,
      message:
        "I'm having trouble right now. Would you like to connect with a live support agent?",
      results: [],
      debug: process.env.NODE_ENV === "development" ? errorMessage : undefined,
    });
  }
}
