import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    has_vercel_token: !!process.env.VERCEL_API_TOKEN,
    has_vercel_project_id: !!process.env.VERCEL_PROJECT_ID,
    token_length: (process.env.VERCEL_API_TOKEN || "").length,
    project_id_value: process.env.VERCEL_PROJECT_ID || "(empty)",
    supabase_configured: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
  });
}
