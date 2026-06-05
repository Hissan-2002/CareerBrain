-- CareerBrain Database Schema
-- Run this in the Supabase SQL Editor to initialize the database.
-- Also create a private storage bucket named "cvs" via the Supabase dashboard.

-- ─── Extensions ───────────────────────────────────────────────────────────────

CREATE EXTENSION IF NOT EXISTS vector;

-- ─── Tables ───────────────────────────────────────────────────────────────────

-- Career profiles (one per user, upserted on brain build)
CREATE TABLE IF NOT EXISTS career_profiles (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  structured_json   JSONB NOT NULL,
  github_username   TEXT,
  completeness_score INT DEFAULT 0,
  raw_cv_text       TEXT,
  raw_github_text   TEXT,
  updated_at        TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- Raw documents ingested (cv, github, note)
CREATE TABLE IF NOT EXISTS documents (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type        TEXT NOT NULL CHECK (type IN ('cv', 'github', 'note')),
  raw_text    TEXT NOT NULL,
  filename    TEXT,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- Chunked + embedded pieces of documents
-- gemini-embedding-001 produces 3072-dimension vectors
CREATE TABLE IF NOT EXISTS chunks (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  content     TEXT NOT NULL,
  embedding   vector(3072),
  section     TEXT,
  metadata    JSONB,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- Note: HNSW index max is 2000 dims; gemini-embedding-001 is 3072 dims.
-- Sequential scan is fast enough for personal-scale chunk counts (<1000 rows per user).

-- Job analyses
CREATE TABLE IF NOT EXISTS job_analyses (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  job_title           TEXT,
  company             TEXT,
  job_text            TEXT NOT NULL,
  fit_score           INT,
  result_json         JSONB,
  retrieved_chunk_ids UUID[],
  created_at          TIMESTAMPTZ DEFAULT now()
);

-- Chat messages
CREATE TABLE IF NOT EXISTS chat_messages (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role                TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content             TEXT NOT NULL,
  retrieved_chunk_ids UUID[],
  created_at          TIMESTAMPTZ DEFAULT now()
);

-- ─── Row Level Security ───────────────────────────────────────────────────────

ALTER TABLE career_profiles  ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents        ENABLE ROW LEVEL SECURITY;
ALTER TABLE chunks           ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_analyses     ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages    ENABLE ROW LEVEL SECURITY;

-- career_profiles: users can only read/write their own row
CREATE POLICY "Users access own career_profiles"
  ON career_profiles FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- documents: users can only read/write their own rows
CREATE POLICY "Users access own documents"
  ON documents FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- chunks: users can only read/write their own rows
CREATE POLICY "Users access own chunks"
  ON chunks FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- job_analyses: users can only read/write their own rows
CREATE POLICY "Users access own job_analyses"
  ON job_analyses FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- chat_messages: users can only read/write their own rows
CREATE POLICY "Users access own chat_messages"
  ON chat_messages FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ─── Helper function: vector similarity search ────────────────────────────────

-- Used by /api/analyze and /api/chat to retrieve relevant chunks
CREATE OR REPLACE FUNCTION match_chunks(
  query_embedding   vector(3072),
  match_user_id     UUID,
  match_count       INT DEFAULT 8
)
RETURNS TABLE (
  id          UUID,
  content     TEXT,
  section     TEXT,
  metadata    JSONB,
  similarity  FLOAT
)
LANGUAGE sql STABLE
AS $$
  SELECT
    c.id,
    c.content,
    c.section,
    c.metadata,
    1 - (c.embedding <=> query_embedding) AS similarity
  FROM chunks c
  WHERE c.user_id = match_user_id
    AND c.embedding IS NOT NULL
  ORDER BY c.embedding <=> query_embedding
  LIMIT match_count;
$$;

-- ─── Storage ──────────────────────────────────────────────────────────────────
-- Create a private bucket named "cvs" in the Supabase dashboard.
-- Files are stored as: {user_id}/{filename}
-- Example storage policy (run after creating the bucket):

-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('cvs', 'cvs', false)
-- ON CONFLICT DO NOTHING;

-- CREATE POLICY "Users manage own CVs"
--   ON storage.objects FOR ALL
--   USING (bucket_id = 'cvs' AND auth.uid()::text = (storage.foldername(name))[1])
--   WITH CHECK (bucket_id = 'cvs' AND auth.uid()::text = (storage.foldername(name))[1]);
