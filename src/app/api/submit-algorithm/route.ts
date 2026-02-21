import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey || supabaseUrl === "https://your-project.supabase.co") {
      return NextResponse.json(
        { error: "Supabase is not configured yet. Please add your Supabase credentials to .env.local" },
        { status: 503 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const body = await req.json();

    const {
      full_name,
      email,
      phone,
      firm_name,
      strategy_name,
      asset_class,
      strategy_type,
      description,
      video_url,
    } = body;

    // Basic validation
    if (!full_name || !email || !strategy_name || !asset_class || !strategy_type || !description) {
      return NextResponse.json(
        { error: "Missing required fields." },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("algorithm_submissions")
      .insert([
        {
          full_name,
          email,
          phone: phone || null,
          firm_name: firm_name || null,
          strategy_name,
          asset_class,
          strategy_type,
          description,
          video_url: video_url || null,
          status: "pending_review",
          submitted_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json(
        { error: "Failed to submit. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Algorithm submitted successfully!", data },
      { status: 201 }
    );
  } catch (err) {
    console.error("API error:", err);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
