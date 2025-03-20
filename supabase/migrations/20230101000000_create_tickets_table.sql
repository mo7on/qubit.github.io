-- Create tickets table
CREATE TABLE IF NOT EXISTS tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'closed')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for faster queries by user_id
CREATE INDEX IF NOT EXISTS tickets_user_id_idx ON tickets (user_id);

-- Create index for status queries
CREATE INDEX IF NOT EXISTS tickets_status_idx ON tickets (status);

-- Add RLS (Row Level Security) policies
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;

-- Policy for users to see only their own tickets
CREATE POLICY tickets_user_select ON tickets 
  FOR SELECT USING (auth.uid()::text = user_id);

-- Policy for users to insert their own tickets
CREATE POLICY tickets_user_insert ON tickets 
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- Policy for users to update only their own non-closed tickets
CREATE POLICY tickets_user_update ON tickets 
  FOR UPDATE USING (
    auth.uid()::text = user_id AND 
    status <> 'closed'
  );