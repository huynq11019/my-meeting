import { createClient } from "../../supabase/client";

/**
 * Helper function to get a meeting UUID from a meeting ID string
 * This helps avoid type casting issues between UUID and text
 */
export async function getMeetingUUID(
  meetingId: string,
): Promise<string | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("meetings")
    .select("id")
    .eq("meeting_id", meetingId)
    .single();

  if (error || !data) {
    console.error("Error getting meeting UUID:", error);
    return null;
  }

  return data.id;
}

/**
 * Helper function to safely join a meeting using the meeting ID string
 * Handles the type conversion between UUID and text
 */
export async function safeJoinMeeting(meetingId: string, userId: string) {
  const supabase = createClient();

  // First get the meeting UUID
  const meetingUUID = await getMeetingUUID(meetingId);

  if (!meetingUUID) {
    throw new Error("Meeting not found");
  }

  // Now use the UUID for the join operation
  const { data, error } = await supabase
    .from("meeting_participants")
    .upsert(
      {
        meeting_id: meetingUUID,
        user_id: userId,
        status: "joined",
        joined_at: new Date().toISOString(),
        left_at: null,
      },
      {
        onConflict: "meeting_id,user_id",
      },
    )
    .select();

  if (error) {
    console.error("Error joining meeting:", error);
    throw new Error(`Error joining meeting: ${error.message}`);
  }

  return data;
}

/**
 * Helper function to safely create a meeting session
 * Handles the type conversion between UUID and text
 */
export async function safeCreateMeetingSession(meetingId: string) {
  const supabase = createClient();

  // First get the meeting UUID
  const meetingUUID = await getMeetingUUID(meetingId);

  if (!meetingUUID) {
    throw new Error("Meeting not found");
  }

  // Now use the UUID for the session creation
  const { data, error } = await supabase
    .from("meeting_sessions")
    .insert({
      meeting_id: meetingUUID,
      is_active: true,
      started_at: new Date().toISOString(),
    })
    .select();

  if (error) {
    console.error("Error creating meeting session:", error);
    throw new Error(`Error creating meeting session: ${error.message}`);
  }

  return data[0];
}
