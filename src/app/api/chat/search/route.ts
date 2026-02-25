import { NextRequest, NextResponse } from "next/server";
import { getAllFAQItems, FAQItem } from "@/lib/faq-data";

export const dynamic = "force-dynamic";

// ─── Smart FAQ Search Engine ───────────────────────────────
// Searches ONLY the knowledge base. Returns the best match
// or indicates no match found (triggers live agent handoff).

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 1);
}

// Common stop words to ignore in matching
const STOP_WORDS = new Set([
  "i", "me", "my", "we", "our", "you", "your", "the", "a", "an", "is",
  "are", "was", "were", "be", "been", "being", "have", "has", "had",
  "do", "does", "did", "will", "would", "could", "should", "can",
  "may", "might", "shall", "to", "of", "in", "for", "on", "with",
  "at", "by", "from", "as", "into", "about", "that", "this", "it",
  "its", "or", "and", "but", "if", "so", "not", "no", "just", "also",
  "than", "too", "very", "what", "how", "when", "where", "which",
  "who", "whom", "why", "all", "each", "every", "any", "some", "up",
  "out", "there", "here", "then", "them", "they", "their",
]);

function getKeywords(text: string): string[] {
  return tokenize(text).filter((w) => !STOP_WORDS.has(w));
}

// Keyword synonyms / related terms for better matching
const SYNONYMS: Record<string, string[]> = {
  connect: ["link", "add", "attach", "setup", "set"],
  disconnect: ["remove", "unlink", "delete", "detach"],
  password: ["login", "credential", "credentials", "pass"],
  money: ["funds", "balance", "cash", "capital", "deposit"],
  cost: ["price", "pricing", "fee", "fees", "expensive", "cheap"],
  trade: ["trading", "trades", "traded"],
  profit: ["profits", "gain", "gains", "earnings", "pnl"],
  loss: ["losses", "losing", "lost", "drawdown"],
  account: ["accounts"],
  platform: ["platforms", "broker", "brokers"],
  safe: ["safety", "secure", "security", "protection"],
  pay: ["payment", "payments", "billing", "bill", "charge", "charged", "subscription"],
  cancel: ["unsubscribe", "stop", "end"],
  slow: ["loading", "performance", "speed", "lag", "laggy"],
  error: ["issue", "problem", "bug", "broken", "wrong", "fail", "failed"],
  start: ["started", "begin", "beginning", "getting"],
  prop: ["propfirm", "evaluation", "eval", "funded"],
  phone: ["mobile", "cell", "iphone", "android"],
  withdraw: ["withdrawal", "withdrawals", "cashout"],
};

function expandWithSynonyms(keywords: string[]): string[] {
  const expanded = new Set(keywords);
  for (const kw of keywords) {
    // Check if this keyword is a synonym of something
    for (const [root, syns] of Object.entries(SYNONYMS)) {
      if (kw === root || syns.includes(kw)) {
        expanded.add(root);
        for (const s of syns) expanded.add(s);
      }
    }
  }
  return Array.from(expanded);
}

function scoreFAQItem(item: FAQItem, queryKeywords: string[]): number {
  const qKeywords = getKeywords(item.q);
  const aKeywords = getKeywords(item.a);
  const allItemKeywords = new Set([...qKeywords, ...aKeywords]);

  let score = 0;

  for (const qk of queryKeywords) {
    // Exact match in question (highest weight)
    if (qKeywords.includes(qk)) {
      score += 10;
    }
    // Exact match in answer
    if (aKeywords.includes(qk)) {
      score += 3;
    }
    // Partial match (starts with)
    for (const ik of allItemKeywords) {
      if (ik !== qk && (ik.startsWith(qk) || qk.startsWith(ik))) {
        score += 2;
      }
    }
  }

  // Bonus for phrase match in question
  const queryLower = queryKeywords.join(" ");
  if (item.q.toLowerCase().includes(queryLower)) {
    score += 15;
  }

  // Normalize by number of query keywords to avoid bias toward long queries
  return queryKeywords.length > 0 ? score / queryKeywords.length : 0;
}

interface SearchResult {
  question: string;
  answer: string;
  category: string;
  score: number;
  link?: { label: string; href: string };
}

export async function POST(req: NextRequest) {
  try {
    const { question } = await req.json();

    if (!question || typeof question !== "string") {
      return NextResponse.json({ error: "question is required" }, { status: 400 });
    }

    const queryKeywords = expandWithSynonyms(getKeywords(question));

    if (queryKeywords.length === 0) {
      return NextResponse.json({
        found: false,
        message: "I'm not sure I understand your question. Would you like to speak with a support agent?",
        results: [],
      });
    }

    const allItems = getAllFAQItems();
    const scored: SearchResult[] = allItems
      .map((item) => ({
        question: item.q,
        answer: item.a,
        category: item.category,
        score: scoreFAQItem(item, queryKeywords),
        link: item.link,
      }))
      .sort((a, b) => b.score - a.score);

    // Minimum threshold to consider a "match"
    const MATCH_THRESHOLD = 4;
    const topResults = scored.filter((r) => r.score >= MATCH_THRESHOLD).slice(0, 3);

    if (topResults.length === 0) {
      return NextResponse.json({
        found: false,
        message:
          "I couldn't find an answer to your question in our knowledge base. Would you like to connect with a live support agent who can help you?",
        results: [],
      });
    }

    return NextResponse.json({
      found: true,
      results: topResults,
    });
  } catch (err) {
    console.error("Chat search error:", err);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
