import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Executes raw SQL against the Supabase PostgreSQL database
 * using the pg-meta REST endpoint (available with service role key).
 */
async function execSQL(
  projectRef: string,
  serviceRoleKey: string,
  sql: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const url = `https://${projectRef}.supabase.co/pg/query`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
        "X-Supabase-Api-Version": "2024-01-01",
      },
      body: JSON.stringify({ query: sql }),
    });

    if (!res.ok) {
      const text = await res.text();
      return { success: false, error: `HTTP ${res.status}: ${text.slice(0, 200)}` };
    }

    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

/**
 * GET /api/admin/migrate
 * Runs database migrations using Supabase's pg-meta SQL endpoint.
 */
export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { error: "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY" },
        { status: 503 }
      );
    }

    // Extract project ref from URL (e.g. "https://xahsdbdtfjxstnkehmke.supabase.co" → "xahsdbdtfjxstnkehmke")
    const projectRef = supabaseUrl.replace("https://", "").split(".")[0];
    const log: string[] = [];

    // All migrations to run
    const migrations = [
      // Migration 1: software_keys metadata
      `ALTER TABLE software_keys ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;`,
      // Migration 2: agencies settings
      `ALTER TABLE agencies ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{}'::jsonb;`,
      // Migration 3: agencies status and contact fields
      `ALTER TABLE agencies ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';`,
      `ALTER TABLE agencies ADD COLUMN IF NOT EXISTS contact_name TEXT;`,
      `ALTER TABLE agencies ADD COLUMN IF NOT EXISTS contact_email TEXT;`,
      `ALTER TABLE agencies ADD COLUMN IF NOT EXISTS contact_phone TEXT;`,
      `ALTER TABLE agencies ADD COLUMN IF NOT EXISTS sold_by TEXT;`,
      `ALTER TABLE agencies ADD COLUMN IF NOT EXISTS website TEXT;`,
      `ALTER TABLE agencies ADD COLUMN IF NOT EXISTS monthly_fee NUMERIC DEFAULT 0;`,
      `ALTER TABLE agencies ADD COLUMN IF NOT EXISTS admin_notes TEXT;`,
      // Migration 4: client_accounts encrypted credential columns
      `ALTER TABLE client_accounts ADD COLUMN IF NOT EXISTS username_encrypted TEXT;`,
      `ALTER TABLE client_accounts ADD COLUMN IF NOT EXISTS password_encrypted TEXT;`,
    ];

    // Try pg-meta endpoint first
    let pgMetaWorks = false;
    const testResult = await execSQL(projectRef, serviceRoleKey, "SELECT 1;");
    if (testResult.success) {
      pgMetaWorks = true;
      log.push("Connected to database via pg-meta endpoint.");
    } else {
      log.push(`pg-meta endpoint not available: ${testResult.error}`);
    }

    if (pgMetaWorks) {
      // Run each migration
      for (const sql of migrations) {
        const result = await execSQL(projectRef, serviceRoleKey, sql);
        if (result.success) {
          log.push(`OK: ${sql.slice(0, 70)}...`);
        } else {
          log.push(`ERROR: ${sql.slice(0, 50)}... → ${result.error}`);
        }
      }
    } else {
      // Fallback: output SQL for manual execution
      log.push("");
      log.push("=== MANUAL MIGRATION REQUIRED ===");
      log.push("The automatic migration endpoint is not available.");
      log.push("Please run the following SQL in your Supabase SQL Editor");
      log.push(`(https://supabase.com/dashboard/project/${projectRef}/sql/new):`);
      log.push("");
      log.push("-- Copy everything below this line --");
      log.push(migrations.join("\n"));
      log.push("-- End of migration SQL --");
    }

    return NextResponse.json({ log }, { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
