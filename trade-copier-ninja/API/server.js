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
    const { MasterAccount, SlaveAccounts, IsRunning, PnlOnly } = req.body;

    console.log(
      `[Sync] ${PnlOnly ? "PNL" : IsRunning ? "STARTED" : "STOPPED"} — Master: ${MasterAccount}, Slaves: ${
        SlaveAccounts ? SlaveAccounts.length : 0
      }`
    );

    // Upsert master account (client/agency resolved below after lookup)
    if (MasterAccount) {
      const { error: masterErr } = await supabase
        .from("copier_accounts")
        .upsert(
          {
            account_name: MasterAccount,
            is_master: true,
            is_active: false,
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

    // Resolve client names and agency names for all accounts
    const allAccountNames = (SlaveAccounts || []).map((s) => s.AccountName);
    if (MasterAccount) allAccountNames.push(MasterAccount);

    let clientMap = {};  // account_number -> { client_name, agency_name }
    try {
      const { data: caData } = await supabase
        .from("client_accounts")
        .select("account_number, clients(name, agencies(name))")
        .in("account_number", allAccountNames);

      if (caData) {
        for (const row of caData) {
          const clientName = row.clients && row.clients.name ? row.clients.name : "";
          const agencyName = row.clients && row.clients.agencies && row.clients.agencies.name
            ? row.clients.agencies.name : "";
          clientMap[row.account_number] = { client_name: clientName, agency_name: agencyName };
        }
      }
    } catch (e) {
      console.log("[Sync] Client lookup optional, continuing:", e.message);
    }

    // Update master with client/agency if found
    if (MasterAccount && clientMap[MasterAccount]) {
      const masterResolved = clientMap[MasterAccount];
      await supabase
        .from("copier_accounts")
        .update({
          client_name: masterResolved.client_name || "",
          agency_name: masterResolved.agency_name || "",
        })
        .eq("account_name", MasterAccount);
    }

    // Upsert each slave account (now with PnL data + client/agency)
    if (SlaveAccounts && SlaveAccounts.length > 0) {
      for (const slave of SlaveAccounts) {
        const resolved = clientMap[slave.AccountName] || {};

        if (PnlOnly) {
          // PnL-only mode: only update financial data, do NOT overwrite is_active/contract_size
          // This prevents the periodic sync from stomping on website toggle changes
          const { error: slaveErr } = await supabase
            .from("copier_accounts")
            .update({
              unrealized: slave.Unrealized || 0,
              realized: slave.Realized || 0,
              net_liquidation: slave.NetLiquidation || 0,
              position_qty: slave.PositionQty || 0,
              total_pnl: slave.TotalPnl || 0,
              client_name: resolved.client_name || "",
              agency_name: resolved.agency_name || "",
              status: slave.IsActive && IsRunning ? "connected" : "disconnected",
            })
            .eq("account_name", slave.AccountName);

          if (slaveErr) {
            console.error(
              `[Supabase] Slave PnL update error (${slave.AccountName}):`,
              slaveErr.message
            );
          }
        } else {
          // Full sync: upsert everything including is_active/contract_size
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
                unrealized: slave.Unrealized || 0,
                realized: slave.Realized || 0,
                net_liquidation: slave.NetLiquidation || 0,
                position_qty: slave.PositionQty || 0,
                total_pnl: slave.TotalPnl || 0,
                client_name: resolved.client_name || "",
                agency_name: resolved.agency_name || "",
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
    }

    // If stopped, mark all accounts as disconnected
    if (!IsRunning && MasterAccount) {
      await supabase
        .from("copier_accounts")
        .update({ status: "disconnected", updated_at: new Date().toISOString() })
        .eq("account_name", MasterAccount);
    }

    // Update copier_state so dashboard knows running status
    await supabase
      .from("copier_state")
      .update({
        is_running: !!IsRunning,
        master_account: MasterAccount || "",
        updated_at: new Date().toISOString(),
      })
      .eq("id", 1);

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

// ─── GET /api/pending-commands ───────────────────────────
// NinjaTrader polls this every 5s to check for website-issued commands
// (start_copier, stop_copier, close_all_trades, set_master)
app.get("/api/pending-commands", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("copier_commands")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: true });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json({ commands: data || [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── POST /api/ack-command ──────────────────────────────
// NinjaTrader acknowledges a command after executing it
app.post("/api/ack-command", async (req, res) => {
  try {
    const { id, status, result } = req.body;
    if (!id) {
      return res.status(400).json({ error: "Missing command id" });
    }

    const { error } = await supabase
      .from("copier_commands")
      .update({
        status: status || "executed",
        executed_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    console.log(`[Command] Acknowledged: ${id} -> ${status || "executed"}`);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── GET /api/copier-state ──────────────────────────────
// Returns the current copier running state (for dashboard)
app.get("/api/copier-state", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("copier_state")
      .select("*")
      .eq("id", 1)
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json(data || { is_running: false, master_account: "" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── POST /api/update-state ─────────────────────────────
// NinjaTrader updates its running state after executing commands
app.post("/api/update-state", async (req, res) => {
  try {
    const { is_running, master_account } = req.body;

    const updates = { updated_at: new Date().toISOString() };
    if (typeof is_running === "boolean") updates.is_running = is_running;
    if (typeof master_account === "string") updates.master_account = master_account;

    const { error } = await supabase
      .from("copier_state")
      .update(updates)
      .eq("id", 1);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    console.log(`[State] Updated: running=${is_running}, master=${master_account}`);
    res.json({ success: true });
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
