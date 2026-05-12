-- Run this in your Supabase project → SQL Editor

-- Participants table
CREATE TABLE IF NOT EXISTS participants (
  id          TEXT PRIMARY KEY,
  data        JSONB        NOT NULL,
  updated_at  TIMESTAMPTZ  DEFAULT NOW()
);

-- Index for fast timestamp ordering
CREATE INDEX IF NOT EXISTS participants_updated_at_idx ON participants (updated_at DESC);

-- Row Level Security: enable it but allow all operations
-- The app handles its own auth; the anon key is safe here
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow_all" ON participants
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Optional: view for quick inspection in Supabase dashboard
CREATE OR REPLACE VIEW participant_summary AS
SELECT
  id,
  data->>'name'                                        AS name,
  data->>'email'                                       AS email,
  data->>'orderGroup'                                  AS order_group,
  data->>'pref'                                        AS theme_preference,
  (data->>'completed')::boolean                        AS completed,
  jsonb_array_length(COALESCE(data->'experiments','[]')) AS sessions,
  updated_at
FROM participants
WHERE data->>'role' != 'admin'
ORDER BY updated_at DESC;
