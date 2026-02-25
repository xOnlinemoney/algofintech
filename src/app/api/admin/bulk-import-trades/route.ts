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
  // Handle quoted fields (commas inside quotes)
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }
  result.push(current.trim());
  return result;
}

/* eslint-disable @typescript-eslint/no-explicit-any */

type AccountResult = {
  account_number: string;
  account_id: string | null;
  account_label: string | null;
  agency_name: string | null;
  client_name: string | null;
  imported_count: number;
  skipped_count: number;
  total_rows: number;
  errors: string[];
  status: "success" | "error" | "unmatched";
};

/**
 * Master CSV Bulk Import
 *
 * Accepts a single CSV with ALL trades for ALL accounts.
 * Required columns: account_number + standard Tradovate columns
 * Optional columns: agency, client (for display/validation only)
 *
 * The API groups rows by account_number, looks up each account,
 * inserts trades, recalculates balances, and returns per-account results.
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
    const file = formData.get("file") as File | null;
    const algorithmName = (formData.get("algorithm_name") as string) || null;
    const algorithmColor = (formData.get("algorithm_color") as string) || "#6366f1";

    if (!file || !file.name.endsWith(".csv")) {
      return NextResponse.json(
        { error: "A CSV file is required." },
        { status: 400 }
      );
    }

    // Parse CSV
    const text = await file.text();
    const lines = text
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    if (lines.length < 2) {
      return NextResponse.json(
        { error: "CSV must have a header row and at least one data row." },
        { status: 400 }
      );
    }

    // Parse header — find column indices
    const header = parseCSVLine(lines[0]);
    const colIndex: Record<string, number> = {};

    // All possible column names we look for
    const knownCols = [
      "account_number", "account", "agency", "agency_name", "client", "client_name",
      "symbol", "_priceFormat", "_priceFormatType", "_tickSize",
      "buyFillId", "sellFillId", "qty", "buyPrice", "sellPrice",
      "pnl", "boughtTimestamp", "soldTimestamp", "duration",
    ];

    header.forEach((h, i) => {
      const normalized = h.toLowerCase().replace(/[\s_-]+/g, "");
      for (const col of knownCols) {
        const colNorm = col.toLowerCase().replace(/[\s_-]+/g, "");
        if (normalized === colNorm) {
          colIndex[col] = i;
          break;
        }
      }
    });

    // Determine the account column (account_number or account)
    const accountCol = colIndex["account_number"] ?? colIndex["account"] ?? -1;
    if (accountCol === -1) {
      return NextResponse.json(
        {
          error:
            'CSV must have an "account_number" or "account" column to identify which account each trade belongs to.',
        },
        { status: 400 }
      );
    }

    // Agency & client columns (optional, for display)
    const agencyCol = colIndex["agency"] ?? colIndex["agency_name"] ?? -1;
    const clientCol = colIndex["client"] ?? colIndex["client_name"] ?? -1;

    // Group rows by account number
    const rowsByAccount = new Map<
      string,
      { lineIndex: number; cols: string[]; agencyName: string; clientName: string }[]
    >();

    for (let i = 1; i < lines.length; i++) {
      const cols = parseCSVLine(lines[i]);
      const acctNum = (cols[accountCol] || "").trim().toUpperCase().replace(/[-\s]/g, "");
      if (!acctNum) continue;

      if (!rowsByAccount.has(acctNum)) {
        rowsByAccount.set(acctNum, []);
      }
      rowsByAccount.get(acctNum)!.push({
        lineIndex: i,
        cols,
        agencyName: agencyCol >= 0 ? (cols[agencyCol] || "").trim() : "",
        clientName: clientCol >= 0 ? (cols[clientCol] || "").trim() : "",
      });
    }

    if (rowsByAccount.size === 0) {
      return NextResponse.json(
        { error: "No valid rows found. Ensure the account_number column has values." },
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

    // Fetch client & agency names for display
    const clientIds = [...new Set((allAccounts || []).map((a: any) => a.client_id).filter(Boolean))];
    const agencyIds = [...new Set((allAccounts || []).map((a: any) => a.agency_id).filter(Boolean))];

    const clientNameMap: Record<string, string> = {};
    const agencyNameMap: Record<string, string> = {};

    if (clientIds.length > 0) {
      const { data: clients } = await supabase
        .from("clients")
        .select("id, name")
        .in("id", clientIds);
      for (const c of clients || []) clientNameMap[c.id] = c.name;
    }

    if (agencyIds.length > 0) {
      const { data: agencies } = await supabase
        .from("agencies")
        .select("id, name")
        .in("id", agencyIds);
      for (const a of agencies || []) agencyNameMap[a.id] = a.name;
    }

    // Process each account group
    const results: AccountResult[] = [];
    let totalImported = 0;
    let totalSkipped = 0;
    let accountsProcessed = 0;
    let accountsFailed = 0;
    const affectedAccountIds = new Set<string>();

    for (const [acctNum, tradeRows] of rowsByAccount) {
      const result: AccountResult = {
        account_number: acctNum,
        account_id: null,
        account_label: null,
        agency_name: tradeRows[0]?.agencyName || null,
        client_name: tradeRows[0]?.clientName || null,
        imported_count: 0,
        skipped_count: 0,
        total_rows: tradeRows.length,
        errors: [],
        status: "success",
      };

      // Look up account
      const account = accountMap.get(acctNum);
      if (!account) {
        result.status = "unmatched";
        result.errors.push(`No account found matching "${acctNum}" in the system.`);
        accountsFailed++;
        results.push(result);
        continue;
      }

      result.account_id = account.id;
      result.account_label = account.account_label || account.account_number;
      // Use DB names if CSV didn't provide them
      if (!result.client_name) {
        result.client_name = clientNameMap[account.client_id] || null;
      }
      if (!result.agency_name) {
        result.agency_name = agencyNameMap[account.agency_id] || null;
      }

      // Get existing trade_ids for duplicate detection
      const { data: existingTrades } = await supabase
        .from("client_trading_activity")
        .select("trade_id")
        .eq("account_id", account.id)
        .limit(100000);

      const existingIds = new Set(
        (existingTrades || []).map((t: { trade_id: string }) => t.trade_id)
      );

      const rows: Record<string, unknown>[] = [];

      for (const { lineIndex, cols } of tradeRows) {
        try {
          const buyFillId = cols[colIndex["buyFillId"]] || cols[colIndex["buyFillId"]] || "";
          const sellFillId = cols[colIndex["sellFillId"]] || "";

          if (!buyFillId || !sellFillId) {
            result.errors.push(`Row ${lineIndex + 1}: missing buyFillId or sellFillId`);
            continue;
          }

          const tradeId = `${buyFillId.trim()}-${sellFillId.trim()}`;

          if (existingIds.has(tradeId)) {
            result.skipped_count++;
            continue;
          }

          const symbol = (cols[colIndex["symbol"]] || "Unknown").trim();
          const buyPrice = parseFloat(cols[colIndex["buyPrice"]] || "0");
          const sellPrice = parseFloat(cols[colIndex["sellPrice"]] || "0");
          const pnl = parsePnl(cols[colIndex["pnl"]] || "0");
          const qty = parseInt(cols[colIndex["qty"]] || "1", 10);
          const boughtTs = cols[colIndex["boughtTimestamp"]] || "";
          const soldTs = cols[colIndex["soldTimestamp"]] || "";
          const duration = (cols[colIndex["duration"]] || "").trim();
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
            algorithm_name: algorithmName || null,
            algorithm_color: algorithmName ? algorithmColor : "#6366f1",
            entry_order_type: "Market",
            exit_order_type: "Market",
            notes: null,
            tags: [],
          });

          existingIds.add(tradeId);
        } catch (rowErr) {
          result.errors.push(`Row ${lineIndex + 1}: ${String(rowErr)}`);
        }
      }

      // Insert trades in batches of 50
      if (rows.length > 0) {
        for (let b = 0; b < rows.length; b += 50) {
          const batch = rows.slice(b, b + 50);
          const { error: insertErr } = await supabase
            .from("client_trading_activity")
            .insert(batch);

          if (insertErr) {
            result.errors.push(`Insert error: ${insertErr.message}`);
          } else {
            result.imported_count += batch.length;
          }
        }
        affectedAccountIds.add(account.id);
      }

      totalImported += result.imported_count;
      totalSkipped += result.skipped_count;

      if (result.imported_count > 0 || result.skipped_count > 0) {
        accountsProcessed++;
      } else if (result.errors.length > 0 && result.imported_count === 0) {
        result.status = "error";
        accountsFailed++;
      } else {
        accountsProcessed++;
      }

      results.push(result);
    }

    // Recalculate balances for all affected accounts
    for (const accountId of affectedAccountIds) {
      const { data: allTradesForBalance } = await supabase
        .from("client_trading_activity")
        .select("pnl")
        .eq("account_id", accountId)
        .limit(100000);
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
        total_rows: lines.length - 1,
        accounts_found: accountsProcessed,
        accounts_failed: accountsFailed,
        unique_accounts: rowsByAccount.size,
      },
    });
  } catch (err) {
    console.error("Bulk import error:", err);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
