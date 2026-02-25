-- ─── Chat Conversations Table ──────────────────────────────
-- Stores chat sessions between clients and the support system
CREATE TABLE IF NOT EXISTS chat_conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id TEXT NOT NULL,
  client_name TEXT NOT NULL DEFAULT 'Unknown',
  client_email TEXT,
  agency_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'ai' CHECK (status IN ('ai', 'live', 'closed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast agency lookups
CREATE INDEX IF NOT EXISTS idx_chat_conversations_agency
  ON chat_conversations(agency_id, status, updated_at DESC);

-- Index for client lookups
CREATE INDEX IF NOT EXISTS idx_chat_conversations_client
  ON chat_conversations(client_id, created_at DESC);

-- ─── Chat Messages Table ───────────────────────────────────
-- Stores individual messages within a conversation
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES chat_conversations(id) ON DELETE CASCADE,
  sender TEXT NOT NULL CHECK (sender IN ('client', 'ai', 'agent')),
  sender_name TEXT NOT NULL DEFAULT 'Unknown',
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fetching messages in a conversation
CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation
  ON chat_messages(conversation_id, created_at ASC);

-- ─── Enable RLS ────────────────────────────────────────────
ALTER TABLE chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Allow service role full access (our API uses service role key)
CREATE POLICY "Service role full access conversations"
  ON chat_conversations FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role full access messages"
  ON chat_messages FOR ALL
  USING (true)
  WITH CHECK (true);
