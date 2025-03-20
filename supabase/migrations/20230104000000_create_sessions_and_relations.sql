-- Create sessions table
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create index for faster token lookups
CREATE INDEX IF NOT EXISTS sessions_token_idx ON sessions (token);
CREATE INDEX IF NOT EXISTS sessions_expires_at_idx ON sessions (expires_at);

-- Add foreign key constraints to existing tables
-- For tickets table
ALTER TABLE tickets 
ADD CONSTRAINT fk_tickets_user 
FOREIGN KEY (user_id) 
REFERENCES auth.users(id) 
ON DELETE CASCADE;

-- For messages table
ALTER TABLE messages 
ADD CONSTRAINT fk_messages_user 
FOREIGN KEY (user_id) 
REFERENCES auth.users(id) 
ON DELETE CASCADE;

-- For conversations table
ALTER TABLE conversations 
ADD CONSTRAINT fk_conversations_user 
FOREIGN KEY (user_id) 
REFERENCES auth.users(id) 
ON DELETE CASCADE;

-- For devices table
ALTER TABLE devices 
ADD CONSTRAINT fk_devices_user 
FOREIGN KEY (user_id) 
REFERENCES auth.users(id) 
ON DELETE CASCADE;

-- For articles table (if it has a user_id column)
ALTER TABLE articles 
ADD COLUMN IF NOT EXISTS user_id TEXT,
ADD CONSTRAINT fk_articles_user 
FOREIGN KEY (user_id) 
REFERENCES auth.users(id) 
ON DELETE SET NULL;

-- Create RLS policies for sessions
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- Policy for users to see only their own sessions
CREATE POLICY sessions_user_select ON sessions 
  FOR SELECT USING (auth.uid() = user_id);

-- Policy for users to insert their own sessions
CREATE POLICY sessions_user_insert ON sessions 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy for users to delete their own sessions
CREATE POLICY sessions_user_delete ON sessions 
  FOR DELETE USING (auth.uid() = user_id);