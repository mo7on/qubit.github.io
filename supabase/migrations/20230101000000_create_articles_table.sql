-- Create articles table
CREATE TABLE IF NOT EXISTS articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for faster queries by category
CREATE INDEX IF NOT EXISTS articles_category_idx ON articles (category);

-- Create index for timestamp queries
CREATE INDEX IF NOT EXISTS articles_created_at_idx ON articles (created_at DESC);

-- Add RLS (Row Level Security) policies
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

-- Policy for anyone to read articles
CREATE POLICY articles_select ON articles 
  FOR SELECT USING (true);