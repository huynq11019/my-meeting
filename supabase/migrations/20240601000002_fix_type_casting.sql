-- Fix type casting issues in meetings tables

-- Update meeting_participants table to handle UUID comparison correctly
ALTER TABLE meeting_participants
  DROP CONSTRAINT IF EXISTS meeting_participants_meeting_id_fkey,
  ADD CONSTRAINT meeting_participants_meeting_id_fkey
    FOREIGN KEY (meeting_id)
    REFERENCES meetings(id);

-- Update meeting_sessions table to handle UUID comparison correctly
ALTER TABLE meeting_sessions
  DROP CONSTRAINT IF EXISTS meeting_sessions_meeting_id_fkey,
  ADD CONSTRAINT meeting_sessions_meeting_id_fkey
    FOREIGN KEY (meeting_id)
    REFERENCES meetings(id);

-- Add explicit type casting in functions or triggers if needed
CREATE OR REPLACE FUNCTION get_meeting_by_meeting_id(meeting_code TEXT)
RETURNS UUID AS $$
DECLARE
  meeting_uuid UUID;
BEGIN
  SELECT id INTO meeting_uuid FROM meetings WHERE meeting_id = meeting_code;
  RETURN meeting_uuid;
END;
$$ LANGUAGE plpgsql;

-- Enable realtime for all meeting tables
ALTER PUBLICATION supabase_realtime ADD TABLE meetings;
ALTER PUBLICATION supabase_realtime ADD TABLE meeting_participants;
ALTER PUBLICATION supabase_realtime ADD TABLE meeting_sessions;
