-- ═══════════════════════════════════════════════════════════
-- AlgoFintech Trade Copier — Migration V2
-- Adds live account data columns + client/agency info
-- ═══════════════════════════════════════════════════════════

-- Add live PnL columns (synced from NinjaTrader every 2s)
ALTER TABLE copier_accounts ADD COLUMN IF NOT EXISTS unrealized DOUBLE PRECISION DEFAULT 0;
ALTER TABLE copier_accounts ADD COLUMN IF NOT EXISTS realized DOUBLE PRECISION DEFAULT 0;
ALTER TABLE copier_accounts ADD COLUMN IF NOT EXISTS net_liquidation DOUBLE PRECISION DEFAULT 0;
ALTER TABLE copier_accounts ADD COLUMN IF NOT EXISTS position_qty INTEGER DEFAULT 0;
ALTER TABLE copier_accounts ADD COLUMN IF NOT EXISTS total_pnl DOUBLE PRECISION DEFAULT 0;

-- Add client/agency name columns (resolved from client_accounts join)
ALTER TABLE copier_accounts ADD COLUMN IF NOT EXISTS client_name TEXT DEFAULT '';
ALTER TABLE copier_accounts ADD COLUMN IF NOT EXISTS agency_name TEXT DEFAULT '';
