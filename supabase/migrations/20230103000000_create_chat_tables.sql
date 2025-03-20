-- Create conversations table
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'closed')),
  message_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  content TEXT NOT NULL,
  is_user BOOLEAN NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS conversations_user_id_idx ON conversations (user_id);
CREATE INDEX IF NOT EXISTS conversations_status_idx ON conversations (status);
CREATE INDEX IF NOT EXISTS messages_conversation_id_idx ON messages (conversation_id);
CREATE INDEX IF NOT EXISTS messages_created_at_idx ON messages (created_at);

-- Add RLS (Row Level Security) policies
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Policy for users to see only their own conversations
CREATE POLICY conversations_user_select ON conversations 
  FOR SELECT USING (auth.uid()::text = user_id);

-- Policy for users to insert their own conversations
CREATE POLICY conversations_user_insert ON conversations 
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- Policy for users to update only their own conversations
CREATE POLICY conversations_user_update ON conversations 
  FOR UPDATE USING (auth.uid()::text = user_id);

-- Policy for users to see only messages from their conversations
CREATE POLICY messages_user_select ON messages 
  FOR SELECT USING (
    user_id = auth.uid()::text OR
    conversation_id IN (
      SELECT id FROM conversations WHERE user_id = auth.uid()::text
    )
  );

-- Policy for users to insert messages only in their conversations
CREATE POLICY messages_user_insert ON messages 
  FOR INSERT WITH CHECK (
    user_id = auth.uid()::text AND
    conversation_id IN (
      SELECT id FROM conversations 
      WHERE user_id = auth.uid()::text AND status = 'active'
    )
  );

-- Create function to update conversation message count and timestamp
CREATE OR REPLACE FUNCTION update_conversation_on_message_insert()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the conversation's message count and timestamp
  UPDATE conversations
  SET 
    message_count = message_count + 1,
    updated_at = NOW(),
    -- If message count reaches 10, close the conversation
    status = CASE WHEN message_count + 1 >= 10 THEN 'closed' ELSE status END
  WHERE id = NEW.conversation_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update conversation on message insert
CREATE TRIGGER update_conversation_trigger
AFTER INSERT ON messages
FOR EACH ROW
EXECUTE FUNCTION update_conversation_on_message_insert();