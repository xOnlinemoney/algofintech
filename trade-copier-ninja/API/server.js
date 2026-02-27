require("dotenv").config();
const express = require("express");
const { createClient } = require("@supabase/supabase-js");

const app = express();
app.use(express.json());

const PORT = process.env.COPIER_API_PORT || 3002;

// ─── Supabase Client ─────────────────────────────────────
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// ─── POST /api/trade-events ──────────────────────────────
// Receives trade execution events from the NinjaTrader Add-On
app.post("/api/trade-events", async (req, res) => {
  try {
    const {
      MasterAccount,
      Instrument,
      Action,
      Quantity,
      FillPrice,
      FillTime,
      ExecutionId,
      SlavesCopied,
    } = req.body;

    console.log(
      `[Trade Event] ${Action} ${Quantity}x ${Instrument} @ ${FillPrice} on ${MasterAccount}`
    );

    // Insert into Supabase
    const { data, error } = await supabase
      .from("copier_trade_events")
      .insert([
        {
          master_account: MasterAccount,
          instrument: Instrument,
          action: Action,
          quantity: Quantity,
          fill_price: FillPrice,
          fill_time: FillTime || new Date().toISOString(),
          execution_id: ExecutionId,
          slaves_copied: SlavesCopied || [],
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("[Supabase] Insert error:", error.message);
      return res.status(500).json({ error: error.message });
    }

    res.json({ success: true, id: data.id });
  } catch (err) {
    console.error("[API] Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─── GET /api/trade-events ───────────────────────────────
// Fetch recent trade events (for dashboard)
app.get("/api/trade-events", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const { data, error } = await supabase
      .from("copier_trade_events")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json({ data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── GET /api/copier-accounts ────────────────────────────
// Fetch copier account config from Supabase (for NinjaTrader to pull)
app.get("/api/copier-accounts", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("copier_accounts")
      .select("*")
      .order("account_name", { ascending: true });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json({ data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── PATCH /api/copier-accounts/:id ──────────────────────
// Update account settings (active, contract_size)
app.patch("/api/copier-accounts/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const { data, error } = await supabase
      .from("copier_accounts")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json({ data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── GET /api/copier-stats ───────────────────────────────
// Get copier stats for dashboard
app.get("/api/copier-stats", async (req, res) => {
  try {
    // Total trades today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { count: tradesToday } = await supabase
      .from("copier_trade_events")
      .select("id", { count: "exact", head: true })
      .gte("created_at", today.toISOString());

    // Total active accounts
    const { count: activeAccounts } = await supabase
      .from("copier_accounts")
      .select("id", { count: "exact", head: true })
      .eq("is_active", true);

    // Last trade
    const { data: lastTrade } = await supabase
      .from("copier_trade_events")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    res.json({
      trades_today: tradesToday || 0,
      active_accounts: activeAccounts || 0,
      last_trade: lastTrade || null,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Health check ────────────────────────────────────────
app.get("/health", (req, res) => {
  res.json({ status: "ok", uptime: process.uptime() });
});

app.listen(PORT, () => {
  console.log(`[AlgoFintech Copier API] Running on port ${PORT}`);
});
