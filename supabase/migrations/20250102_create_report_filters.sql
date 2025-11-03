-- Create report_filters table for saved filter presets
CREATE TABLE IF NOT EXISTS report_filters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  filters JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index
CREATE INDEX IF NOT EXISTS idx_report_filters_user_id ON report_filters(user_id);

-- Enable Row Level Security
ALTER TABLE report_filters ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own report filters" ON report_filters
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own report filters" ON report_filters
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own report filters" ON report_filters
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own report filters" ON report_filters
  FOR DELETE USING (auth.uid() = user_id);
