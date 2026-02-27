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

// ─── POST /api/sync-accounts ────────────────────────────
// Called by NinjaTrader when copier starts/stops or slave toggles change.
// Upserts master + slave accounts into Supabase automatically.
app.post("/api/sync-accounts", async (req, res) => {
  try {
    const { MasterAccount, SlaveAccounts, IsRunning } = req.body;

    console.log(
      `[Sync] ${IsRunning ? "STARTED" : "STOPPED"} — Master: ${MasterAccount}, Slaves: ${
        SlaveAccounts ? SlaveAccounts.length : 0
      }`
    );

    // Upsert master account
    if (MasterAccount) {
      const { error: masterErr } = await supabase
        .from("copier_accounts")
        .upsert(
          {
            account_name: MasterAccount,
            is_master: true,
            is_active: false, // master doesn't receive copies
            status: IsRunning ? "connected" : "disconnected",
            contract_size: 1,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "account_name" }
        );

      if (masterErr) {
        console.error("[Supabase] Master upsert error:", masterErr.message);
      }
    }

    // Upsert each slave account
    if (SlaveAccounts && SlaveAccounts.length > 0) {
      for (const slave of SlaveAccounts) {
        const { error: slaveErr } = await supabase
          .from("copier_accounts")
          .upsert(
            {
              account_name: slave.AccountName,
              is_master: false,
              is_active: slave.IsActive,
              status: slave.IsActive && IsRunning ? "connected" : "disconnected",
              contract_size: slave.ContractSize || 1,
              trades_copied: slave.TradesCopied || 0,
              last_trade: slave.LastTrade || null,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "account_name" }
          );

        if (slaveErr) {
          console.error(
            `[Supabase] Slave upsert error (${slave.AccountName}):`,
            slaveErr.message
          );
        }
      }
    }

    // If stopped, mark all accounts as disconnected
    if (!IsRunning && MasterAccount) {
      await supabase
        .from("copier_accounts")
        .update({ status: "disconnected", updated_at: new Date().toISOString() })
        .eq("account_name", MasterAccount);
    }

    res.json({ success: true });
  } catch (err) {
    console.error("[API] Sync error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─── GET /api/check-changes ─────────────────────────────
// Lightweight endpoint for NinjaTrader to detect dashboard changes.
// Returns hasChanges:true if any copier_accounts.updated_at > ?since
app.get("/api/check-changes", async (req, res) => {
  try {
    const since = req.query.since;
    if (!since) {
      return res.status(400).json({ error: "Missing ?since parameter" });
    }

    // Find accounts updated after the given timestamp
    const { data, error } = await supabase
      .from("copier_accounts")
      .select("*")
      .gt("updated_at", since)
      .order("updated_at", { ascending: false });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    const hasChanges = data && data.length > 0;
    const latestChange = hasChanges ? data[0].updated_at : since;

    res.json({
      hasChanges,
      latestChange,
      accounts: hasChanges ? data : [],
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── GET /api/client-names ───────────────────────────────
// Given a list of account numbers, return the client name for each.
// NinjaTrader calls this to populate the Client Name column.
// Query: ?accounts=APEX123,APEX456,BSKE789
app.get("/api/client-names", async (req, res) => {
  try {
    const accountsParam = req.query.accounts;
    if (!accountsParam) {
      return res.status(400).json({ error: "Missing ?accounts parameter" });
    }

    const accountNumbers = accountsParam.split(",").map((a) => a.trim());

    // Join client_accounts + clients to get names
    const { data, error } = await supabase
      .from("client_accounts")
      .select("account_number, clients(name, client_id)")
      .in("account_number", accountNumbers);

    if (error) {
      console.error("[API] client-names error:", error.message);
      return res.status(500).json({ error: error.message });
    }

    // Build a map: account_number -> client_name
    const result = {};
    if (data) {
      for (const row of data) {
        const clientName =
          row.clients && row.clients.name ? row.clients.name : "";
        result[row.account_number] = clientName;
      }
    }

    res.json({ clients: result });
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
