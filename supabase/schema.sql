-- ============================================================
-- AlgoFinTech — Supabase Database Schema
-- ============================================================
-- Run this SQL in your Supabase SQL Editor (Dashboard → SQL Editor)
-- This creates all tables needed for the platform.
--
-- Hierarchy:
--   agencies
--     ├── agency_users        (owners / staff who log in)
--     ├── algorithms          (trading algorithms available on platform)
--     ├── agency_saved_algorithms  (which algos the agency has activated)
--     ├── clients             (end-clients managed by the agency)
--     │     └── client_accounts   (broker accounts connected by each client)
--     │           └── copy_settings   (copy-trading config per account)
--     ├── platform_updates    (changelog / news posts)
--     └── announcements       (system announcements)
-- ============================================================

-- ─── 1. AGENCIES ─────────────────────────────────────────────
-- The top-level entity: a white-label agency firm
CREATE TABLE IF NOT EXISTS agencies (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  slug          TEXT NOT NULL UNIQUE,           -- subdomain: "algostack" → algostack.algofintech.com
  plan          TEXT NOT NULL DEFAULT 'starter' CHECK (plan IN ('starter', 'pro', 'enterprise')),
  logo_url      TEXT,
  primary_color TEXT DEFAULT '#3b82f6',         -- brand color hex
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_agencies_slug ON agencies(slug);


-- ─── 1b. AGENCY DOMAINS ─────────────────────────────────────
-- Custom domains that agencies connect for white-label client access
CREATE TABLE IF NOT EXISTS agency_domains (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id     UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  domain        TEXT NOT NULL UNIQUE,                -- e.g. "client.theiragency.com"
  status        TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'active', 'failed')),
  cname_target  TEXT NOT NULL DEFAULT 'cname.algofintech.com',
  verified_at   TIMESTAMPTZ,
  last_check    TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_agency_domains_agency ON agency_domains(agency_id);
CREATE INDEX idx_agency_domains_domain ON agency_domains(domain);
CREATE INDEX idx_agency_domains_status ON agency_domains(status);


-- ─── 2. AGENCY USERS ────────────────────────────────────────
-- People who log in to manage the agency dashboard
CREATE TABLE IF NOT EXISTS agency_users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id     UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  auth_user_id  UUID UNIQUE,                   -- links to Supabase Auth (auth.users.id)
  name          TEXT NOT NULL,
  email         TEXT NOT NULL,
  role          TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('owner', 'admin', 'viewer')),
  avatar_url    TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_agency_users_agency ON agency_users(agency_id);
CREATE UNIQUE INDEX idx_agency_users_email_agency ON agency_users(agency_id, email);


-- ─── 3. ALGORITHMS ──────────────────────────────────────────
-- Trading algorithms available on the platform (global catalog)
CREATE TABLE IF NOT EXISTS algorithms (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug          TEXT NOT NULL UNIQUE,           -- URL path: "forex-alpha-scalp-fx"
  name          TEXT NOT NULL,
  description   TEXT,
  category      TEXT NOT NULL CHECK (category IN ('Forex', 'Crypto', 'Stocks', 'Futures')),
  image_url     TEXT,
  roi           TEXT,                           -- e.g. "+142%"
  drawdown      TEXT,                           -- e.g. "8.4%"
  win_rate      TEXT,                           -- e.g. "68%"
  status        TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'deprecated')),
  -- Performance detail (JSONB for flexibility)
  metrics       JSONB,                          -- {total_return, win_rate, profit_factor, ...}
  monthly_returns JSONB,                        -- [{year, months[], ytd}]
  info          JSONB,                          -- {timeframe, min_account, instruments, trades_per_month}
  equity_chart  JSONB,                          -- {labels[], data[]}
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_algorithms_category ON algorithms(category);
CREATE INDEX idx_algorithms_status ON algorithms(status);


-- ─── 4. AGENCY SAVED ALGORITHMS ─────────────────────────────
-- Join table: which algorithms each agency has activated / saved
-- These are the ones that appear in the sidebar AND in the
-- strategy dropdown on the Manage Accounts page
CREATE TABLE IF NOT EXISTS agency_saved_algorithms (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id     UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  algorithm_id  UUID NOT NULL REFERENCES algorithms(id) ON DELETE CASCADE,
  saved_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(agency_id, algorithm_id)
);

CREATE INDEX idx_agency_saved_algos_agency ON agency_saved_algorithms(agency_id);


-- ─── 5. CLIENTS ─────────────────────────────────────────────
-- End-clients managed by an agency
CREATE TABLE IF NOT EXISTS clients (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id       TEXT NOT NULL,                -- display ID: "CL-7829"
  agency_id       UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  email           TEXT NOT NULL,
  phone           TEXT,
  avatar_url      TEXT,
  avatar_gradient TEXT,                         -- CSS gradient: "from-blue-600 to-indigo-600"
  status          TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending', 'suspended')),
  liquidity       NUMERIC(14,2) DEFAULT 0,     -- total account value
  total_pnl       NUMERIC(14,2) DEFAULT 0,
  pnl_percentage  NUMERIC(8,2) DEFAULT 0,
  active_strategies INT DEFAULT 0,
  risk_level      TEXT DEFAULT 'medium' CHECK (risk_level IN ('low', 'medium', 'high')),
  broker          TEXT,                         -- primary broker name
  joined_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_active     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_clients_client_id_agency ON clients(agency_id, client_id);
CREATE INDEX idx_clients_agency ON clients(agency_id);
CREATE INDEX idx_clients_status ON clients(status);


-- ─── 6. CLIENT ACCOUNTS ─────────────────────────────────────
-- Broker accounts connected by each client (the rows in Manage Accounts table)
CREATE TABLE IF NOT EXISTS client_accounts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id       UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  agency_id       UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  account_name    TEXT NOT NULL,                -- e.g. "slave - tradovate - BLUERJPYWBEO"
  account_label   TEXT,                         -- e.g. "tradovate Demo / BLUERJPYWBEO (USD)"
  platform        TEXT NOT NULL,                -- "Tradovate", "MetaTrader 4", "MetaTrader 5", "Binance", "Schwab"
  account_type    TEXT NOT NULL CHECK (account_type IN ('Demo', 'Real')),
  account_number  TEXT NOT NULL,                -- broker account number
  plan            TEXT,                         -- subscription plan
  currency        TEXT NOT NULL DEFAULT 'USD',
  balance         NUMERIC(14,2) DEFAULT 0,
  credit          NUMERIC(14,2) DEFAULT 0,
  equity          NUMERIC(14,2) DEFAULT 0,
  free_margin     NUMERIC(14,2) DEFAULT 0,
  open_trades     INT DEFAULT 0,
  asset_class     TEXT,                         -- "Forex", "Futures", "Crypto", "Stocks"
  algorithm_id    UUID REFERENCES algorithms(id) ON DELETE SET NULL,  -- assigned strategy/algorithm
  is_active       BOOLEAN NOT NULL DEFAULT false,
  status          TEXT NOT NULL DEFAULT 'off' CHECK (status IN ('active', 'off', 'error', 'syncing')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_client_accounts_client ON client_accounts(client_id);
CREATE INDEX idx_client_accounts_agency ON client_accounts(agency_id);
CREATE INDEX idx_client_accounts_algorithm ON client_accounts(algorithm_id);
CREATE UNIQUE INDEX idx_client_accounts_number ON client_accounts(client_id, platform, account_number);


-- ─── 7. COPY SETTINGS ───────────────────────────────────────
-- Copy-trading configuration for each client account
-- One row per account — stores all 5 tabs of settings
CREATE TABLE IF NOT EXISTS copy_settings (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id      UUID NOT NULL UNIQUE REFERENCES client_accounts(id) ON DELETE CASCADE,

  -- Tab 1: Copy Settings
  copier_status   TEXT DEFAULT 'inherited' CHECK (copier_status IN ('off', 'inherited', 'on', 'open_only', 'close_only')),
  risk_factor     TEXT DEFAULT 'fixed_lot' CHECK (risk_factor IN ('fixed_lot', 'lot_multiplier', 'equity_percentage', 'mirror_master')),
  risk_value      NUMERIC(10,4) DEFAULT 0.01,
  reverse_trading BOOLEAN DEFAULT false,
  copy_pending    TEXT DEFAULT 'inherited' CHECK (copy_pending IN ('off', 'inherited', 'on')),
  smart_price_adj TEXT DEFAULT 'inherited' CHECK (smart_price_adj IN ('off', 'inherited', 'on')),

  -- Tab 3: Position Management
  copy_sl         TEXT DEFAULT 'inherited' CHECK (copy_sl IN ('off', 'inherited', 'on')),
  copy_tp         TEXT DEFAULT 'inherited' CHECK (copy_tp IN ('off', 'inherited', 'on')),
  copy_sl_updates TEXT DEFAULT 'inherited' CHECK (copy_sl_updates IN ('off', 'inherited', 'on')),
  copy_tp_updates TEXT DEFAULT 'inherited' CHECK (copy_tp_updates IN ('off', 'inherited', 'on')),
  max_risk_value  NUMERIC(10,4),
  max_risk_unit   TEXT DEFAULT '%' CHECK (max_risk_unit IN ('%', 'Pips', 'Points')),
  fixed_sl_value  NUMERIC(10,4),
  fixed_sl_unit   TEXT DEFAULT '%',
  fixed_tp_value  NUMERIC(10,4),
  fixed_tp_unit   TEXT DEFAULT '%',
  min_sl_value    NUMERIC(10,4),
  min_sl_unit     TEXT DEFAULT '%',
  min_tp_value    NUMERIC(10,4),
  min_tp_unit     TEXT DEFAULT '%',
  max_sl_value    NUMERIC(10,4),
  max_sl_unit     TEXT DEFAULT '%',
  max_tp_value    NUMERIC(10,4),
  max_tp_unit     TEXT DEFAULT '%',
  offset_sl_value NUMERIC(10,4),
  offset_sl_unit  TEXT DEFAULT '%',
  offset_tp_value NUMERIC(10,4),
  offset_tp_unit  TEXT DEFAULT '%',
  offset_pending_value NUMERIC(10,4),
  offset_pending_unit  TEXT DEFAULT '%',

  -- Tab 4: Order Filter
  min_lot_size    NUMERIC(10,4) DEFAULT 0.01,
  max_lot_size    NUMERIC(10,4) DEFAULT 100,
  allowed_symbols TEXT,                         -- comma-separated or null for all
  excluded_symbols TEXT,                        -- comma-separated

  -- Tab 5: Advanced Settings
  max_slippage    INT DEFAULT 3,                -- in pips
  max_retries     INT DEFAULT 3,
  trade_comment   TEXT,
  magic_number    INT DEFAULT 0,
  copy_sltp_mods  BOOLEAN DEFAULT true,

  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- ─── 8. SYMBOLS MAPPING ─────────────────────────────────────
-- Tab 2 of Copy Settings: master → slave symbol mapping
CREATE TABLE IF NOT EXISTS symbols_mapping (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id      UUID NOT NULL REFERENCES client_accounts(id) ON DELETE CASCADE,
  master_symbol   TEXT NOT NULL,                -- e.g. "EURUSD"
  slave_symbol    TEXT NOT NULL,                -- e.g. "EURUSD.pro"
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_symbols_mapping_account ON symbols_mapping(account_id);


-- ─── 9. ALGORITHM RELEASES ──────────────────────────────────
-- New algorithm release announcements (New Algorithms page)
CREATE TABLE IF NOT EXISTS algorithm_releases (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  algorithm_id    UUID NOT NULL REFERENCES algorithms(id) ON DELETE CASCADE,
  released_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_featured     BOOLEAN DEFAULT false,
  features        JSONB DEFAULT '[]',           -- [{icon, label}]
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_algorithm_releases_algo ON algorithm_releases(algorithm_id);


-- ─── 10. PLATFORM UPDATES ───────────────────────────────────
-- Changelog entries (Platform Updates page)
CREATE TABLE IF NOT EXISTS platform_updates (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category        TEXT NOT NULL,                -- "New Feature", "Bug Fix", etc.
  version         TEXT,                         -- e.g. "v2.4.0"
  title           TEXT NOT NULL,
  description     TEXT NOT NULL,
  is_featured     BOOLEAN DEFAULT false,
  image_url       TEXT,
  tags            JSONB DEFAULT '[]',           -- [{label}]
  cta_label       TEXT,
  cta_href        TEXT,
  published_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_platform_updates_date ON platform_updates(published_at DESC);


-- ─── 11. ANNOUNCEMENTS ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS announcements (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title           TEXT NOT NULL,
  description     TEXT NOT NULL,
  priority        TEXT NOT NULL DEFAULT 'General' CHECK (priority IN ('Critical', 'Important', 'General', 'Maintenance')),
  category_label  TEXT,                         -- "Security Alert", "Policy Update", etc.
  icon            TEXT DEFAULT 'megaphone',     -- lucide icon name
  is_banner       BOOLEAN DEFAULT false,
  affected_system TEXT,
  attachment_label TEXT,
  attachment_href TEXT,
  cta_label       TEXT,
  cta_href        TEXT,
  published_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_announcements_date ON announcements(published_at DESC);
CREATE INDEX idx_announcements_priority ON announcements(priority);


-- ─── 12. INDUSTRY NEWS ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS industry_news (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title           TEXT NOT NULL,
  description     TEXT NOT NULL,
  category        TEXT NOT NULL,                -- "Market Analysis", "Crypto", etc.
  image_url       TEXT,
  image_gradient  TEXT,                         -- fallback CSS gradient
  author_name     TEXT NOT NULL,
  author_avatar_gradient TEXT,
  source          TEXT,                         -- "Reuters", "Bloomberg", etc.
  read_time       TEXT DEFAULT '5 min read',
  is_featured     BOOLEAN DEFAULT false,
  published_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_industry_news_date ON industry_news(published_at DESC);
CREATE INDEX idx_industry_news_category ON industry_news(category);


-- ─── 13. ALGORITHM SUBMISSION (Earn with your Algo page) ────
CREATE TABLE IF NOT EXISTS algorithm_submissions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  developer_name  TEXT NOT NULL,
  email           TEXT NOT NULL,
  algorithm_name  TEXT NOT NULL,
  category        TEXT NOT NULL,
  description     TEXT,
  backtest_url    TEXT,
  agreed_terms    BOOLEAN NOT NULL DEFAULT false,
  status          TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'approved', 'rejected')),
  submitted_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- ─── 14. MASTER ACCOUNTS ──────────────────────────────────────
-- Master trading accounts used as copy-trading sources for algorithms
CREATE TABLE IF NOT EXISTS master_accounts (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform          TEXT NOT NULL DEFAULT 'mt5',       -- mt4, mt5, ctrader, dxtrade, binance, coinbase
  broker            TEXT,                               -- IC Markets, Pepperstone, etc.
  server            TEXT,                               -- e.g. ICMarkets-Server
  login             TEXT,                               -- account ID / login number
  password_encrypted TEXT,                              -- encrypted password (encrypt in production!)
  account_type      TEXT NOT NULL DEFAULT 'live' CHECK (account_type IN ('demo', 'live')),
  nickname          TEXT,                               -- friendly name
  status            TEXT NOT NULL DEFAULT 'connected' CHECK (status IN ('connected', 'disconnected', 'paused', 'error')),
  settings          JSONB DEFAULT '{}',                 -- {connection_timeout, max_retries, auto_reconnect, notes}
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_master_accounts_platform ON master_accounts(platform);
CREATE INDEX idx_master_accounts_status ON master_accounts(status);

CREATE TRIGGER trg_master_accounts_updated_at BEFORE UPDATE ON master_accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- ============================================================
-- ROW LEVEL SECURITY (RLS) — Enable for production
-- ============================================================
-- Uncomment these when you have Supabase Auth wired up.
-- Each policy ensures agencies can only see their own data.

/*
ALTER TABLE agencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE agency_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE copy_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE symbols_mapping ENABLE ROW LEVEL SECURITY;
ALTER TABLE agency_saved_algorithms ENABLE ROW LEVEL SECURITY;

-- Example policy: agency users can only see their own agency's clients
CREATE POLICY "Agency users see own clients" ON clients
  FOR SELECT USING (
    agency_id IN (
      SELECT agency_id FROM agency_users
      WHERE auth_user_id = auth.uid()
    )
  );

-- Example policy: agency users can only manage their own accounts
CREATE POLICY "Agency users manage own client accounts" ON client_accounts
  FOR ALL USING (
    agency_id IN (
      SELECT agency_id FROM agency_users
      WHERE auth_user_id = auth.uid()
    )
  );
*/


-- ============================================================
-- HELPER FUNCTIONS
-- ============================================================

-- Auto-generate client display IDs like "CL-7829"
CREATE OR REPLACE FUNCTION generate_client_display_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.client_id IS NULL OR NEW.client_id = '' THEN
    NEW.client_id := 'CL-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_client_display_id
  BEFORE INSERT ON clients
  FOR EACH ROW
  EXECUTE FUNCTION generate_client_display_id();

-- Auto-update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_agencies_updated_at BEFORE UPDATE ON agencies FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_agency_domains_updated_at BEFORE UPDATE ON agency_domains FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_agency_users_updated_at BEFORE UPDATE ON agency_users FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_algorithms_updated_at BEFORE UPDATE ON algorithms FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_clients_updated_at BEFORE UPDATE ON clients FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_client_accounts_updated_at BEFORE UPDATE ON client_accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_copy_settings_updated_at BEFORE UPDATE ON copy_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at();
