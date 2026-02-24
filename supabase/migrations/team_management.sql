-- ============================================================
-- Team Management Tables — Migration
-- ============================================================
-- Run in Supabase SQL Editor to add team management support.
-- This extends the existing schema with:
--   1. agency_team_members  (team members who can log into the agency)
--   2. agency_invites       (pending invitations)
--   3. agency_member_clients (which clients each team member can access)
-- ============================================================

-- ─── 1. AGENCY TEAM MEMBERS ──────────────────────────────────
-- People invited to help manage the agency (sales reps, VAs, admins, etc.)
CREATE TABLE IF NOT EXISTS agency_team_members (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id     UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  email         TEXT NOT NULL,
  password      TEXT,                                -- hashed in production; stored plain for now like software_keys pattern
  role          TEXT NOT NULL DEFAULT 'support' CHECK (role IN ('owner', 'admin', 'sales', 'support', 'developer')),
  department    TEXT,                                -- "Sales Team", "Support Team", "Management", "IT", etc.
  phone         TEXT,
  avatar_url    TEXT,
  avatar_gradient TEXT,                              -- CSS gradient for avatar
  status        TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('active', 'pending', 'inactive', 'suspended')),
  last_active   TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_agency_team_members_agency ON agency_team_members(agency_id);
CREATE UNIQUE INDEX idx_agency_team_members_email_agency ON agency_team_members(agency_id, email);
CREATE INDEX idx_agency_team_members_role ON agency_team_members(role);
CREATE INDEX idx_agency_team_members_status ON agency_team_members(status);


-- ─── 2. AGENCY INVITES ──────────────────────────────────────
-- Pending invitations sent by agency admins/owners
CREATE TABLE IF NOT EXISTS agency_invites (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id     UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  email         TEXT NOT NULL,
  name          TEXT NOT NULL,
  role          TEXT NOT NULL DEFAULT 'support' CHECK (role IN ('admin', 'sales', 'support', 'developer')),
  department    TEXT,
  token         TEXT NOT NULL UNIQUE,                -- unique invite token for accept link
  invited_by    UUID REFERENCES agency_team_members(id) ON DELETE SET NULL,
  status        TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'revoked')),
  expires_at    TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '7 days'),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_agency_invites_agency ON agency_invites(agency_id);
CREATE INDEX idx_agency_invites_token ON agency_invites(token);
CREATE INDEX idx_agency_invites_email ON agency_invites(email);


-- ─── 3. AGENCY MEMBER CLIENTS ───────────────────────────────
-- Controls which clients each team member can see/manage
-- If no rows exist for a member, they see NO clients (unless role is owner/admin = all)
CREATE TABLE IF NOT EXISTS agency_member_clients (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id     UUID NOT NULL REFERENCES agency_team_members(id) ON DELETE CASCADE,
  client_id     UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  assigned_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  assigned_by   UUID REFERENCES agency_team_members(id) ON DELETE SET NULL,
  UNIQUE(member_id, client_id)
);

CREATE INDEX idx_agency_member_clients_member ON agency_member_clients(member_id);
CREATE INDEX idx_agency_member_clients_client ON agency_member_clients(client_id);


-- ─── Triggers ────────────────────────────────────────────────
CREATE TRIGGER trg_agency_team_members_updated_at
  BEFORE UPDATE ON agency_team_members
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
