-- Migration v3: Command queue + copier state for web-based copier control

-- Command queue: website writes commands, NinjaTrader polls and executes
CREATE TABLE IF NOT EXISTS copier_commands (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  command TEXT NOT NULL,
  payload JSONB DEFAULT '{}',
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now(),
  executed_at TIMESTAMPTZ
);

-- Single-row state tracker for copier running status
CREATE TABLE IF NOT EXISTS copier_state (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  is_running BOOLEAN DEFAULT false,
  master_account TEXT DEFAULT '',
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Insert default state row
INSERT INTO copier_state (id, is_running, master_account)
VALUES (1, false, '')
ON CONFLICT (id) DO NOTHING;

-- Index for fast pending command lookups
CREATE INDEX IF NOT EXISTS idx_copier_commands_status ON copier_commands (status) WHERE status = 'pending';
