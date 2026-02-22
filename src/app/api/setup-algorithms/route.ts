import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * ONE-TIME setup endpoint to create the algorithms table.
 * Hit GET /api/setup-algorithms to create the table, then use /api/seed to populate it.
 */
export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const log: string[] = [];

    // Try creating table via RPC
    const { error: rpcError } = await supabase.rpc("exec_sql", {
      query: `
        CREATE TABLE IF NOT EXISTS algorithms (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          agency_id UUID REFERENCES agencies(id) ON DELETE CASCADE,
          name TEXT NOT NULL,
          slug TEXT NOT NULL UNIQUE,
          description TEXT,
          category TEXT,
          status TEXT DEFAULT 'active',
          risk_level TEXT,
          roi TEXT,
          drawdown TEXT,
          win_rate TEXT,
          sharpe_ratio DECIMAL(5,2),
          pairs TEXT,
          agencies_count INT DEFAULT 0,
          clients_count INT DEFAULT 0,
          last_updated TIMESTAMPTZ DEFAULT NOW(),
          created_at TIMESTAMPTZ DEFAULT NOW()
        );
      `,
    });

    if (rpcError) {
      log.push(`RPC failed: ${rpcError.message}`);
      log.push("Please create the algorithms table manually in Supabase SQL editor:");
      log.push(`
CREATE TABLE IF NOT EXISTS algorithms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id UUID REFERENCES agencies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  category TEXT,
  status TEXT DEFAULT 'active',
  risk_level TEXT,
  roi TEXT,
  drawdown TEXT,
  win_rate TEXT,
  sharpe_ratio DECIMAL(5,2),
  pairs TEXT,
  agencies_count INT DEFAULT 0,
  clients_count INT DEFAULT 0,
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
      `.trim());
    } else {
      log.push("Algorithms table created successfully!");
    }

    return NextResponse.json({ log }, { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
