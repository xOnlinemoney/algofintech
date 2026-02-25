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

/* ── CSV helpers ──────────────────────────────────────────── */

function parsePnl(raw: string): number {
  const cleaned = raw.replace(/[$,\s]/g, "");
  const negative = cleaned.includes("(") || cleaned.startsWith("-");
  const num = parseFloat(cleaned.replace(/[()\\-]/g, ""));
  return negative ? -num : num;
}

function parseTimestamp(raw: string): string {
  const trimmed = raw.trim();
  const [datePart, timePart] = trimmed.split(" ");
  if (!datePart || !timePart) return new Date().toISOString();
  const [month, day, year] = datePart.split("/");
  return new Date(`${year}-${month}-${day}T${timePart}`).toISOString();
}

function parseCSVLine(line: string): string[] {
  return line.split(",").map((v) => v.trim());
}

function extractAccountNumber(filename: string): string | null {
  const match = filename.match(/([A-Z]{2,}[-]?\d{8,})/i);
  return match ? match[1].toUpperCase().replace(/-/g, "") : null;
}

/* eslint-disable @typescript-eslint/no-explicit-any */

type FileResult = {
  filename: string;
  account_number: string | null;
  account_id: string | null;
  account_label: string | null;
  client_name: string | null;
  imported_count: number;
  skipped_count: number;
  errors: string[];
  status: "success" | "error" | "unmatched";
};

/**
 * Multi-File Import
 *
 * Accepts multiple CSV files via FormData. Each file's filename
 * contains the account number (e.g. "APEX41449900000221-ce7aa0e7.csv").
 * The API extracts the account number, matches it, and imports trades.
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = getSupabase();
    if (!supabase) {
      return NextResponse.json(
        { error: "Supabase not configured." },
        { status: 503 }
      );
    }

    const formData = await req.formData();
    const files: File[] = [];
    for (const [, value] of formData.entries()) {
      if (value instanceof File && value.name.endsWith(".csv")) {
        files.push(value);
      }
    }

    if (files.length === 0) {
      return NextResponse.json(
        { error: "No CSV files provided." },
        { status: 400 }
      );
    }

    // Fetch all accounts for matching
    const { data: allAccounts } = await supabase
      .from("client_accounts")
      .select("id, account_number, account_label, client_id, agency_id, balance, starting_balance");

    const accountMap = new Map<string, any>();
    for (const acc of allAccounts || []) {
      if (acc.account_number) {
        const normalized = acc.account_number.toUpperCase().replace(/[-\s]/g, "");
        accountMap.set(normalized, acc);
      }
    }

    // Fetch client names for display
    const clientIds = [...new Set((allAccounts || []).map((a: any) => a.client_id).filter(Boolean))];
    const clientNameMap: Record<string, string> = {};
    if (clientIds.length > 0) {
      const { data: clients } = await supabase
        .from("clients")
        .select("id, name")
        .in("id", clientIds);
      for (const c of clients || []) clientNameMap[c.id] = c.name;
    }

    const results: FileResult[] = [];
    let totalImported = 0;
    let totalSkipped = 0;
    let filesProcessed = 0;
    let filesFailed = 0;
    const affectedAccountIds = new Set<string>();

    for (const file of files) {
      const result: FileResult = {
        filename: file.name,
        account_number: null,
        account_id: null,
        account_label: null,
        client_name: null,
        imported_count: 0,
        skipped_count: 0,
        errors: [],
        status: "success",
      };

      // Extract account number from filename
      const extracted = extractAccountNumber(file.name);
      result.account_number = extracted;

      if (!extracted) {
        result.status = "unmatched";
        result.errors.push("Could not extract account number from filename.");
        filesFailed++;
        results.push(result);
        continue;
      }

      // Look up account
      const account = accountMap.get(extracted);
      if (!account) {
        result.status = "unmatched";
        result.errors.push(`No account found matching "${extracted}".`);
        filesFailed++;
        results.push(result);
        continue;
      }

      result.account_id = account.id;
      result.account_label = account.account_label || account.account_number;
      result.client_name = clientNameMap[account.client_id] || "Unknown Client";

      // Parse CSV
      const text = await file.text();
      const lines = text.split("\n").map((l) => l.trim()).filter((l) => l.length > 0);

      if (lines.length < 2) {
        result.status = "error";
        result.errors.push("CSV must have a header and at least one data row.");
        filesFailed++;
        results.push(result);
        continue;
      }

      const header = parseCSVLine(lines[0]);
      const colIndex: Record<string, number> = {};
      const colNames = [
        "symbol", "_priceFormat", "_priceFormatType", "_tickSize",
        "buyFillId", "sellFillId", "qty", "buyPrice", "sellPrice",
        "pnl", "boughtTimestamp", "soldTimestamp", "duration",
      ];
      header.forEach((h, i) => {
        const match = colNames.find(
          (c) => c.toLowerCase() === h.toLowerCase().replace(/\s+/g, "")
        );
        if (match) colIndex[match] = i;
      });

      if (Object.keys(colIndex).length < 8) {
        colNames.forEach((name, i) => { colIndex[name] = i; });
      }

      // Get existing trade_ids for duplicate detection
      const { data: existingTrades } = await supabase
        .from("client_trading_activity")
        .select("trade_id")
        .eq("account_id", account.id);

      const existingIds = new Set(
        (existingTrades || []).map((t: { trade_id: string }) => t.trade_id)
      );

      const rows: Record<string, unknown>[] = [];

      for (let i = 1; i < lines.length; i++) {
        try {
          const cols = parseCSVLine(lines[i]);
          if (cols.length < 10) {
            result.errors.push(`Row ${i}: insufficient columns`);
            continue;
          }

          const buyFillId = cols[colIndex["buyFillId"]] || "";
          const sellFillId = cols[colIndex["sellFillId"]] || "";
          const tradeId = `${buyFillId}-${sellFillId}`;

          if (existingIds.has(tradeId)) {
            result.skipped_count++;
            continue;
          }

          const symbol = cols[colIndex["symbol"]] || "Unknown";
          const buyPrice = parseFloat(cols[colIndex["buyPrice"]] || "0");
          const sellPrice = parseFloat(cols[colIndex["sellPrice"]] || "0");
          const pnl = parsePnl(cols[colIndex["pnl"]] || "0");
          const qty = parseInt(cols[colIndex["qty"]] || "1", 10);
          const boughtTs = cols[colIndex["boughtTimestamp"]] || "";
          const soldTs = cols[colIndex["soldTimestamp"]] || "";
          const duration = cols[colIndex["duration"]] || "";
          const tradeType = buyPrice < sellPrice ? "Buy" : "Sell";

          rows.push({
            account_id: account.id,
            client_id: account.client_id,
            trade_id: tradeId,
            symbol,
            symbol_category: "Futures",
            trade_type: tradeType,
            entry_price: buyPrice,
            exit_price: sellPrice,
            position_size: String(qty),
            pnl,
            net_pnl: pnl,
            pnl_pct: 0,
            commission: 0,
            swap: 0,
            status: "Closed",
            duration,
            opened_at: parseTimestamp(boughtTs),
            closed_at: parseTimestamp(soldTs),
            algorithm_name: null,
            algorithm_color: "#6366f1",
            entry_order_type: "Market",
            exit_order_type: "Market",
            notes: null,
            tags: [],
          });

          existingIds.add(tradeId);
        } catch (rowErr) {
          result.errors.push(`Row ${i}: ${String(rowErr)}`);
        }
      }

      // Insert trades in batches
      if (rows.length > 0) {
        for (let b = 0; b < rows.length; b += 50) {
          const batch = rows.slice(b, b + 50);
          const { error: insertErr } = await supabase
            .from("client_trading_activity")
            .insert(batch);

          if (insertErr) {
            result.errors.push(`Batch insert error: ${insertErr.message}`);
          } else {
            result.imported_count += batch.length;
          }
        }
        affectedAccountIds.add(account.id);
      }

      totalImported += result.imported_count;
      totalSkipped += result.skipped_count;

      if (result.imported_count > 0 || result.skipped_count > 0) {
        filesProcessed++;
      } else if (result.errors.length > 0) {
        result.status = "error";
        filesFailed++;
      } else {
        filesProcessed++;
      }

      results.push(result);
    }

    // Recalculate balances for all affected accounts
    for (const accountId of affectedAccountIds) {
      const { data: allTradesForBalance } = await supabase
        .from("client_trading_activity")
        .select("pnl")
        .eq("account_id", accountId);
      const allPnl = (allTradesForBalance || []).reduce(
        (sum: number, t: { pnl: number }) => sum + (Number(t.pnl) || 0),
        0
      );
      const acc = (allAccounts || []).find((a: any) => a.id === accountId);
      const startBal = Number(acc?.starting_balance) || 0;
      const newBalance = startBal + allPnl;
      await supabase
        .from("client_accounts")
        .update({
          balance: newBalance,
          equity: newBalance,
          updated_at: new Date().toISOString(),
        })
        .eq("id", accountId);
    }

    return NextResponse.json({
      results,
      summary: {
        total_imported: totalImported,
        total_skipped: totalSkipped,
        files_processed: filesProcessed,
        files_failed: filesFailed,
        total_files: files.length,
      },
    });
  } catch (err) {
    console.error("Multi-import error:", err);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
