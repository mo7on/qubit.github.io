-- Create devices table
CREATE TABLE IF NOT EXISTS devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL UNIQUE,
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for faster queries by user_id
CREATE INDEX IF NOT EXISTS devices_user_id_idx ON devices (user_id);

-- Add RLS (Row Level Security) policies
ALTER TABLE devices ENABLE ROW LEVEL SECURITY;

-- Policy for users to see only their own device
CREATE POLICY devices_user_select ON devices 
  FOR SELECT USING (auth.uid()::text = user_id);

-- Policy for users to insert their own device
CREATE POLICY devices_user_insert ON devices 
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- Policy for users to update only their own device
CREATE POLICY devices_user_update ON devices 
  FOR UPDATE USING (auth.uid()::text = user_id);