-- ═══════════════════════════════════════════════════════════════
-- AlgoFintech Trade Copier — Supabase Tables
-- Run this in the Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════

-- Trade events log — every fill detected on master + copies sent
CREATE TABLE IF NOT EXISTS copier_trade_events (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  master_account  TEXT NOT NULL,
  instrument      TEXT NOT NULL,
  action          TEXT NOT NULL,         -- Buy, Sell, BuyToCover, SellShort
  quantity        INT NOT NULL,
  fill_price      DOUBLE PRECISION NOT NULL,
  fill_time       TIMESTAMPTZ NOT NULL,
  execution_id    TEXT UNIQUE,           -- NT execution ID for dedup
  slaves_copied   JSONB DEFAULT '[]',    -- Array of {account, qty, status}
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Copier account config — which accounts are active + contract sizes
CREATE TABLE IF NOT EXISTS copier_accounts (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  account_name    TEXT NOT NULL UNIQUE,  -- NinjaTrader account name
  is_master       BOOLEAN DEFAULT FALSE,
  is_active       BOOLEAN DEFAULT FALSE,
  contract_size   INT DEFAULT 1,
  agency_id       UUID REFERENCES agencies(id),
  client_id       UUID REFERENCES clients(id),
  status          TEXT DEFAULT 'disconnected',  -- connected, disconnected, error
  last_trade      TEXT,
  trades_copied   INT DEFAULT 0,
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_copier_events_master ON copier_trade_events(master_account);
CREATE INDEX IF NOT EXISTS idx_copier_events_time   ON copier_trade_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_copier_accounts_active ON copier_accounts(is_active);

-- Enable RLS
ALTER TABLE copier_trade_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE copier_accounts ENABLE ROW LEVEL SECURITY;

-- Allow service role full access
CREATE POLICY "Service role full access on copier_trade_events"
  ON copier_trade_events FOR ALL
  USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access on copier_accounts"
  ON copier_accounts FOR ALL
  USING (true) WITH CHECK (true);
