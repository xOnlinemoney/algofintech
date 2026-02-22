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

/* eslint-disable @typescript-eslint/no-explicit-any */

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = getSupabase();
    if (!supabase) {
      return NextResponse.json(
        { error: "Supabase not configured." },
        { status: 503 }
      );
    }

    // 1. Fetch the algorithm
    const { data: algo, error: algoErr } = await supabase
      .from("algorithms")
      .select("*")
      .eq("id", id)
      .single();

    if (algoErr || !algo) {
      return NextResponse.json(
        { error: "Algorithm not found." },
        { status: 404 }
      );
    }

    // 2. Count agencies using this algorithm
    let agenciesCount = 0;
    try {
      const { data: agencySaved } = await supabase
        .from("agency_saved_algorithms")
        .select("agency_id")
        .eq("algorithm_id", id);
      if (agencySaved) {
        const uniqueAgencies = new Set(agencySaved.map((r: any) => r.agency_id));
        agenciesCount = uniqueAgencies.size;
      }
    } catch {
      agenciesCount = 0;
    }

    // 3. Count clients using this algorithm
    let clientsCount = 0;
    try {
      const { data: clientAccounts } = await supabase
        .from("client_accounts")
        .select("client_id")
        .eq("algorithm_id", id);
      if (clientAccounts) {
        const uniqueClients = new Set(clientAccounts.map((r: any) => r.client_id));
        clientsCount = uniqueClients.size;
      }
    } catch {
      clientsCount = 0;
    }

    // 4. Normalize fields from JSONB
    const metrics = algo.metrics || {};
    const info = algo.info || {};

    const normalized = {
      id: algo.id,
      slug: algo.slug,
      name: algo.name,
      description: algo.description || "",
      category: algo.category || "Forex",
      image_url: algo.image_url || null,
      roi: algo.roi || metrics.total_return || metrics.roi || "0%",
      drawdown: algo.drawdown || metrics.max_drawdown || metrics.drawdown || "0%",
      win_rate: algo.win_rate || metrics.win_rate || "0%",
      sharpe_ratio: algo.sharpe_ratio ?? metrics.sharpe_ratio ?? metrics.profit_factor ?? 0,
      risk_level: algo.risk_level || info.risk_level || metrics.risk_level || "medium",
      pairs: algo.pairs || info.instruments || info.pairs || algo.category || "",
      status: algo.status || "active",
      // JSONB fields
      metrics: algo.metrics || {},
      info: algo.info || {},
      equity_chart: algo.equity_chart || null,
      monthly_returns: algo.monthly_returns || null,
      // Timestamps
      created_at: algo.created_at,
      updated_at: algo.updated_at,
      // Computed
      agencies_count: agenciesCount,
      clients_count: clientsCount,
    };

    return NextResponse.json({ algorithm: normalized }, { status: 200 });
  } catch (err) {
    console.error("Admin algorithm detail API error:", err);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = getSupabase();
    if (!supabase) {
      return NextResponse.json(
        { error: "Supabase not configured." },
        { status: 503 }
      );
    }

    const body = await request.json();

    // Build update object — only include fields that were sent
    const update: Record<string, any> = {};

    // Top-level columns
    if (body.name !== undefined) update.name = body.name;
    if (body.description !== undefined) update.description = body.description;
    if (body.category !== undefined) update.category = body.category;
    if (body.status !== undefined) update.status = body.status;
    if (body.roi !== undefined) update.roi = body.roi;
    if (body.drawdown !== undefined) update.drawdown = body.drawdown;
    if (body.win_rate !== undefined) update.win_rate = body.win_rate;
    if (body.image_url !== undefined) update.image_url = body.image_url;
    if (body.slug !== undefined) update.slug = body.slug;

    // JSONB fields
    if (body.metrics !== undefined) update.metrics = body.metrics;
    if (body.info !== undefined) update.info = body.info;
    if (body.equity_chart !== undefined) update.equity_chart = body.equity_chart;
    if (body.monthly_returns !== undefined) update.monthly_returns = body.monthly_returns;

    if (Object.keys(update).length === 0) {
      return NextResponse.json(
        { error: "No fields to update." },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("algorithms")
      .update(update)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Algorithm update error:", error);
      return NextResponse.json(
        { error: "Failed to update algorithm.", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ algorithm: data }, { status: 200 });
  } catch (err) {
    console.error("Admin algorithm update API error:", err);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = getSupabase();
    if (!supabase) {
      return NextResponse.json(
        { error: "Supabase not configured." },
        { status: 503 }
      );
    }

    const { error } = await supabase
      .from("algorithms")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Algorithm delete error:", error);
      return NextResponse.json(
        { error: "Failed to delete algorithm.", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error("Admin algorithm delete API error:", err);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
