-- Seesaw (SFM) — self-hosted schema. Replaces Supabase (auth + tables).
-- Safe to run more than once.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ── Users (replaces auth.users) ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email           TEXT NOT NULL UNIQUE,
  password_hash   TEXT,                       -- NULL = Google-only account
  app_metadata    JSONB NOT NULL DEFAULT '{}'::jsonb,  -- { role, is_active }
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_sign_in_at TIMESTAMPTZ
);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ── Projects ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS projects (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name             TEXT NOT NULL,
  company_name     TEXT,
  company_logo_url TEXT,
  product_owner    TEXT,
  product_manager  TEXT,
  budget           TEXT,
  duration         TEXT,
  github_repo      TEXT,
  github_token     TEXT,
  current_stage    TEXT DEFAULT 'S0' CHECK (current_stage IN ('PD','S0','S1','S2','S3','S4','S5','S6')),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ── Project stages ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS project_stages (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id    UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  stage_code    TEXT NOT NULL CHECK (stage_code IN ('PD','S0','S1','S2','S3','S4','S5','S6')),
  status        TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started','in_progress','completed','blocked')),
  nodes_data    JSONB DEFAULT '[]'::jsonb,
  edges_data    JSONB DEFAULT '[]'::jsonb,
  evidence_data JSONB DEFAULT '{}'::jsonb,
  notes         TEXT,
  started_at    TIMESTAMPTZ,
  completed_at  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (project_id, stage_code)
);
CREATE INDEX IF NOT EXISTS idx_project_stages_project_id ON project_stages(project_id);

CREATE OR REPLACE FUNCTION create_project_stages()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO project_stages (project_id, stage_code)
  VALUES (NEW.id,'PD'),(NEW.id,'S0'),(NEW.id,'S1'),(NEW.id,'S2'),
         (NEW.id,'S3'),(NEW.id,'S4'),(NEW.id,'S5'),(NEW.id,'S6')
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS trigger_create_project_stages ON projects;
CREATE TRIGGER trigger_create_project_stages AFTER INSERT ON projects
  FOR EACH ROW EXECUTE FUNCTION create_project_stages();

-- ── Snapshots (saved workflows) ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS snapshots (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  data       JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_snapshots_user_id ON snapshots(user_id);
CREATE INDEX IF NOT EXISTS idx_snapshots_project_id ON snapshots(project_id);
DROP TRIGGER IF EXISTS update_snapshots_updated_at ON snapshots;
CREATE TRIGGER update_snapshots_updated_at BEFORE UPDATE ON snapshots
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ── API keys ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS api_keys (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  key_hash     TEXT NOT NULL UNIQUE,
  key_prefix   TEXT NOT NULL,
  is_active    BOOLEAN NOT NULL DEFAULT TRUE,
  expires_at   TIMESTAMPTZ,
  last_used_at TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON api_keys(user_id);

-- ── Kanban leftovers counted by the admin stats page ────────────────
CREATE TABLE IF NOT EXISTS columns (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title      TEXT,
  position   INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS tasks (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  column_id  UUID REFERENCES columns(id) ON DELETE CASCADE,
  title      TEXT,
  data       JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
