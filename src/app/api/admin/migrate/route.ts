import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/migrate
 * Runs database migrations:
 * 1. Adds metadata JSONB column to software_keys (for login/signup)
 * 2. Updates algorithms status constraint to allow draft/beta
 */
export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const log: string[] = [];

    // ── Migration 1: Add metadata JSONB column to software_keys ──
    const { error: metaErr } = await supabase.rpc("exec_sql", {
      query: `ALTER TABLE software_keys ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;`,
    });

    if (metaErr) {
      log.push(`metadata column migration error: ${metaErr.message}`);
      log.push("--- You may need to run this SQL manually in Supabase SQL Editor: ---");
      log.push(`ALTER TABLE software_keys ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;`);
    } else {
      log.push("Added metadata JSONB column to software_keys (or already exists).");
    }

    // ── Migration 2: Add settings JSONB column to agencies ──
    const { error: settingsErr } = await supabase.rpc("exec_sql", {
      query: `ALTER TABLE agencies ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{}'::jsonb;`,
    });

    if (settingsErr) {
      log.push(`settings column migration error: ${settingsErr.message}`);
      log.push("--- You may need to run this SQL manually in Supabase SQL Editor: ---");
      log.push(`ALTER TABLE agencies ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{}'::jsonb;`);
    } else {
      log.push("Added settings JSONB column to agencies (or already exists).");
    }

    // ── Migration 3: Update algorithms status constraint ──
    const { error: dropError } = await supabase.rpc("exec_sql", {
      query: `ALTER TABLE algorithms DROP CONSTRAINT IF EXISTS algorithms_status_check;`,
    });

    if (dropError) {
      log.push(`Drop constraint error: ${dropError.message}`);
      log.push("--- You may need to run this SQL manually in Supabase SQL Editor: ---");
      log.push(`ALTER TABLE algorithms DROP CONSTRAINT IF EXISTS algorithms_status_check;`);
      log.push(`ALTER TABLE algorithms ADD CONSTRAINT algorithms_status_check CHECK (status IN ('active', 'paused', 'deprecated', 'draft', 'beta'));`);
    } else {
      log.push("Dropped old status constraint.");

      const { error: addError } = await supabase.rpc("exec_sql", {
        query: `ALTER TABLE algorithms ADD CONSTRAINT algorithms_status_check CHECK (status IN ('active', 'paused', 'deprecated', 'draft', 'beta'));`,
      });

      if (addError) {
        log.push(`Add constraint error: ${addError.message}`);
      } else {
        log.push("Added new status constraint with draft/beta support.");
      }
    }

    // ── Migration 4: Add status column to agencies ──
    const agencyStatusMigrations = [
      `ALTER TABLE agencies ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active';`,
      `ALTER TABLE agencies ADD COLUMN IF NOT EXISTS contact_name TEXT;`,
      `ALTER TABLE agencies ADD COLUMN IF NOT EXISTS contact_email TEXT;`,
      `ALTER TABLE agencies ADD COLUMN IF NOT EXISTS contact_phone TEXT;`,
      `ALTER TABLE agencies ADD COLUMN IF NOT EXISTS sold_by TEXT;`,
      `ALTER TABLE agencies ADD COLUMN IF NOT EXISTS website TEXT;`,
      `ALTER TABLE agencies ADD COLUMN IF NOT EXISTS monthly_fee NUMERIC DEFAULT 0;`,
      `ALTER TABLE agencies ADD COLUMN IF NOT EXISTS admin_notes TEXT;`,
    ];

    for (const sql of agencyStatusMigrations) {
      const { error: migErr } = await supabase.rpc("exec_sql", { query: sql });
      if (migErr) {
        log.push(`Migration error (${sql.slice(0, 50)}...): ${migErr.message}`);
      } else {
        log.push(`OK: ${sql.slice(0, 60)}...`);
      }
    }

    return NextResponse.json({ log }, { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
