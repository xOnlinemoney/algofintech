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

function parsePnl(raw: string): number {
  // "$395.00" → 395, "($50.00)" or "-$50.00" → -50
  const cleaned = raw.replace(/[$,\s]/g, "");
  const negative = cleaned.includes("(") || cleaned.startsWith("-");
  const num = parseFloat(cleaned.replace(/[()\\-]/g, ""));
  return negative ? -num : num;
}

function parseTimestamp(raw: string): string {
  // "02/24/2026 10:23:47" → ISO string
  const trimmed = raw.trim();
  const [datePart, timePart] = trimmed.split(" ");
  if (!datePart || !timePart) return new Date().toISOString();
  const [month, day, year] = datePart.split("/");
  return new Date(`${year}-${month}-${day}T${timePart}`).toISOString();
}

function parseCSVLine(line: string): string[] {
  // Simple CSV parser — split by comma and trim
  return line.split(",").map((v) => v.trim());
}

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
    const accountId = formData.get("account_id") as string | null;

    if (!file || !accountId) {
      return NextResponse.json(
        { error: "file and account_id are required." },
        { status: 400 }
      );
    }

    // Look up the account
    const { data: account, error: accErr } = await supabase
      .from("client_accounts")
      .select("id, client_id, agency_id, platform, account_number, account_label, balance")
      .eq("id", accountId)
      .single();

    if (accErr || !account) {
      return NextResponse.json(
        { error: "Account not found." },
        { status: 404 }
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
        { error: "CSV file must have a header row and at least one data row." },
        { status: 400 }
      );
    }

    // Skip header row
    const header = parseCSVLine(lines[0]);
    // Find column indices (flexible matching)
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

    // Fallback: if headers don't match, assume standard Tradovate order
    if (Object.keys(colIndex).length < 8) {
      colNames.forEach((name, i) => {
        colIndex[name] = i;
      });
    }

    // Get existing trade_ids for this account to skip duplicates
    const { data: existingTrades } = await supabase
      .from("client_trading_activity")
      .select("trade_id")
      .eq("account_id", accountId);

    const existingIds = new Set(
      (existingTrades || []).map((t: { trade_id: string }) => t.trade_id)
    );

    const rows: Record<string, unknown>[] = [];
    const errors: string[] = [];
    let skippedCount = 0;

    for (let i = 1; i < lines.length; i++) {
      try {
        const cols = parseCSVLine(lines[i]);
        if (cols.length < 10) {
          errors.push(`Row ${i}: insufficient columns`);
          continue;
        }

        const buyFillId = cols[colIndex["buyFillId"]] || "";
        const sellFillId = cols[colIndex["sellFillId"]] || "";
        const tradeId = `${buyFillId}-${sellFillId}`;

        if (existingIds.has(tradeId)) {
          skippedCount++;
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
          account_id: accountId,
          client_id: account.client_id,
          agency_id: account.agency_id,
          trade_id: tradeId,
          symbol: symbol,
          symbol_category: "Futures",
          trade_type: tradeType,
          entry_price: buyPrice,
          exit_price: sellPrice,
          position_size: String(qty),
          pnl: pnl,
          net_pnl: pnl,
          pnl_pct: 0,
          commission: 0,
          swap: 0,
          status: "Closed",
          duration: duration,
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
        errors.push(`Row ${i}: ${String(rowErr)}`);
      }
    }

    let importedCount = 0;

    if (rows.length > 0) {
      // Insert in batches of 50
      for (let b = 0; b < rows.length; b += 50) {
        const batch = rows.slice(b, b + 50);
        const { error: insertErr } = await supabase
          .from("client_trading_activity")
          .insert(batch);

        if (insertErr) {
          errors.push(`Batch insert error: ${insertErr.message}`);
        } else {
          importedCount += batch.length;
        }
      }

      // Update account balance with cumulative PnL
      const totalPnl = rows.reduce(
        (sum, r) => sum + (Number(r.pnl) || 0),
        0
      );
      const currentBalance = Number(account.balance) || 0;
      await supabase
        .from("client_accounts")
        .update({
          balance: currentBalance + totalPnl,
          equity: currentBalance + totalPnl,
          updated_at: new Date().toISOString(),
        })
        .eq("id", accountId);
    }

    return NextResponse.json({
      success: true,
      imported_count: importedCount,
      skipped_count: skippedCount,
      total_rows: lines.length - 1,
      errors,
    });
  } catch (err) {
    console.error("Import trades error:", err);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
