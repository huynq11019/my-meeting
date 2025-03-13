-- Create tables if they don't exist yet
CREATE TABLE IF NOT EXISTS public.meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  meeting_id TEXT NOT NULL UNIQUE,
  host_id UUID NOT NULL,
  is_recurring BOOLEAN DEFAULT FALSE,
  recurrence_pattern TEXT,
  start_time TIMESTAMP WITH TIME ZONE,
  duration INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE,
  settings JSONB
);

CREATE TABLE IF NOT EXISTS public.meeting_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID NOT NULL,
  user_id UUID NOT NULL,
  status TEXT,
  joined_at TIMESTAMP WITH TIME ZONE,
  left_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(meeting_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.meeting_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE,
  ended_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE,
  participant_count INTEGER DEFAULT 0
);

-- Add foreign key constraints
ALTER TABLE public.meetings
  ADD CONSTRAINT meetings_host_id_fkey
  FOREIGN KEY (host_id)
  REFERENCES public.users(id)
  ON DELETE CASCADE;

ALTER TABLE public.meeting_participants
  ADD CONSTRAINT meeting_participants_meeting_id_fkey
  FOREIGN KEY (meeting_id)
  REFERENCES public.meetings(id)
  ON DELETE CASCADE;

ALTER TABLE public.meeting_participants
  ADD CONSTRAINT meeting_participants_user_id_fkey
  FOREIGN KEY (user_id)
  REFERENCES public.users(id)
  ON DELETE CASCADE;

ALTER TABLE public.meeting_sessions
  ADD CONSTRAINT meeting_sessions_meeting_id_fkey
  FOREIGN KEY (meeting_id)
  REFERENCES public.meetings(id)
  ON DELETE CASCADE;

-- Enable realtime for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE meetings;
ALTER PUBLICATION supabase_realtime ADD TABLE meeting_participants;
ALTER PUBLICATION supabase_realtime ADD TABLE meeting_sessions;
