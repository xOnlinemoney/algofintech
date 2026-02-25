-- Closer Links — token-based access for sales closers to view client data
CREATE TABLE IF NOT EXISTS closer_links (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token       TEXT NOT NULL UNIQUE,
  agency_id   UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  client_ids  UUID[] NOT NULL DEFAULT '{}',
  is_active   BOOLEAN NOT NULL DEFAULT true,
  expires_at  TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_closer_links_token ON closer_links(token);
CREATE INDEX idx_closer_links_agency ON closer_links(agency_id);
