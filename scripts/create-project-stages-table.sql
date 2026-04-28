-- Create project_stages table (Details - stage data per project)
CREATE TABLE IF NOT EXISTS project_stages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  stage_code TEXT NOT NULL CHECK (stage_code IN ('PD', 'S0', 'S1', 'S2', 'S3', 'S4', 'S5', 'S6')),
  status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed', 'blocked')),
  nodes_data JSONB DEFAULT '[]'::jsonb,
  edges_data JSONB DEFAULT '[]'::jsonb,
  evidence_data JSONB DEFAULT '{}'::jsonb,
  notes TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure unique stage per project
  UNIQUE(project_id, stage_code)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_project_stages_project_id ON project_stages(project_id);
CREATE INDEX IF NOT EXISTS idx_project_stages_stage_code ON project_stages(stage_code);
CREATE INDEX IF NOT EXISTS idx_project_stages_status ON project_stages(status);

-- Enable RLS
ALTER TABLE project_stages ENABLE ROW LEVEL SECURITY;

-- RLS Policies - users can only access stages of their own projects
CREATE POLICY "Users can view their project stages"
  ON project_stages FOR SELECT
  USING (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert stages to their projects"
  ON project_stages FOR INSERT
  WITH CHECK (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their project stages"
  ON project_stages FOR UPDATE
  USING (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their project stages"
  ON project_stages FOR DELETE
  USING (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );

-- Function to auto-create stages when a project is created
CREATE OR REPLACE FUNCTION create_project_stages()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO project_stages (project_id, stage_code)
  VALUES 
    (NEW.id, 'PD'),
    (NEW.id, 'S0'),
    (NEW.id, 'S1'),
    (NEW.id, 'S2'),
    (NEW.id, 'S3'),
    (NEW.id, 'S4'),
    (NEW.id, 'S5'),
    (NEW.id, 'S6');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-create stages on new project
DROP TRIGGER IF EXISTS trigger_create_project_stages ON projects;
CREATE TRIGGER trigger_create_project_stages
  AFTER INSERT ON projects
  FOR EACH ROW
  EXECUTE FUNCTION create_project_stages();

-- Update snapshots table to link to projects (if not already done)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'snapshots' AND column_name = 'project_id'
  ) THEN
    ALTER TABLE snapshots ADD COLUMN project_id UUID REFERENCES projects(id) ON DELETE SET NULL;
    CREATE INDEX idx_snapshots_project_id ON snapshots(project_id);
  END IF;
END $$;

-- Add current_stage to projects table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'projects' AND column_name = 'current_stage'
  ) THEN
    ALTER TABLE projects ADD COLUMN current_stage TEXT DEFAULT 'S0' CHECK (current_stage IN ('PD', 'S0', 'S1', 'S2', 'S3', 'S4', 'S5', 'S6'));
  END IF;
END $$;
