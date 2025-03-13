-- Create meetings table
CREATE TABLE IF NOT EXISTS meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  meeting_id TEXT NOT NULL UNIQUE,
  host_id UUID NOT NULL REFERENCES auth.users(id),
  is_recurring BOOLEAN DEFAULT false,
  recurrence_pattern TEXT,
  start_time TIMESTAMPTZ,
  duration INTEGER,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  settings JSONB DEFAULT '{"waitingRoom": true, "requirePassword": false, "autoRecord": false}'::jsonb
);

-- Create participants table
CREATE TABLE IF NOT EXISTS meeting_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  status TEXT DEFAULT 'pending',
  joined_at TIMESTAMPTZ,
  left_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(meeting_id, user_id)
);

-- Create meeting_sessions table for active meetings
CREATE TABLE IF NOT EXISTS meeting_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ DEFAULT now(),
  ended_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  participant_count INTEGER DEFAULT 0
);

-- Enable RLS
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_sessions ENABLE ROW LEVEL SECURITY;

-- Policies for meetings
DROP POLICY IF EXISTS "Users can view their own meetings" ON meetings;
CREATE POLICY "Users can view their own meetings"
  ON meetings FOR SELECT
  USING (auth.uid() = host_id);

DROP POLICY IF EXISTS "Users can insert their own meetings" ON meetings;
CREATE POLICY "Users can insert their own meetings"
  ON meetings FOR INSERT
  WITH CHECK (auth.uid() = host_id);

DROP POLICY IF EXISTS "Users can update their own meetings" ON meetings;
CREATE POLICY "Users can update their own meetings"
  ON meetings FOR UPDATE
  USING (auth.uid() = host_id);

DROP POLICY IF EXISTS "Users can delete their own meetings" ON meetings;
CREATE POLICY "Users can delete their own meetings"
  ON meetings FOR DELETE
  USING (auth.uid() = host_id);

-- Policies for meeting_participants
DROP POLICY IF EXISTS "Users can view meetings they're invited to" ON meeting_participants;
CREATE POLICY "Users can view meetings they're invited to"
  ON meeting_participants FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() IN (
    SELECT host_id FROM meetings m WHERE m.id = meeting_id
  ));

DROP POLICY IF EXISTS "Users can join meetings they're invited to" ON meeting_participants;
CREATE POLICY "Users can join meetings they're invited to"
  ON meeting_participants FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own participation" ON meeting_participants;
CREATE POLICY "Users can update their own participation"
  ON meeting_participants FOR UPDATE
  USING (auth.uid() = user_id);

-- Policies for meeting_sessions
DROP POLICY IF EXISTS "Users can view meeting sessions they're part of" ON meeting_sessions;
CREATE POLICY "Users can view meeting sessions they're part of"
  ON meeting_sessions FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM meeting_participants mp 
    WHERE mp.meeting_id = meeting_sessions.meeting_id AND mp.user_id = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM meetings m 
    WHERE m.id = meeting_sessions.meeting_id AND m.host_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Hosts can manage meeting sessions" ON meeting_sessions;
CREATE POLICY "Hosts can manage meeting sessions"
  ON meeting_sessions FOR ALL
  USING (EXISTS (
    SELECT 1 FROM meetings m 
    WHERE m.id = meeting_sessions.meeting_id AND m.host_id = auth.uid()
  ));

-- Enable realtime for all tables
alter publication supabase_realtime add table meetings;
alter publication supabase_realtime add table meeting_participants;
alter publication supabase_realtime add table meeting_sessions;
