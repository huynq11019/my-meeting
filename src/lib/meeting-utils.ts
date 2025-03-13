import { createClient } from "../../supabase/client";
import { Database } from "@/types/database.types";

export type Meeting = Database["public"]["Tables"]["meetings"]["Row"];
export type MeetingParticipant =
  Database["public"]["Tables"]["meeting_participants"]["Row"];
export type MeetingSession =
  Database["public"]["Tables"]["meeting_sessions"]["Row"];

// Generate a random meeting ID
export const generateMeetingId = (): string => {
  return Math.random().toString(36).substring(2, 10);
};

// Create a new meeting
export const createMeeting = async ({
  name,
  description,
  isRecurring,
  recurrencePattern,
  startTime,
  duration,
  settings,
}: {
  name: string;
  description?: string;
  isRecurring?: boolean;
  recurrencePattern?: string;
  startTime?: Date;
  duration?: number;
  settings?: {
    waitingRoom?: boolean;
    requirePassword?: boolean;
    autoRecord?: boolean;
  };
}) => {
  const supabase = createClient();
  const meetingId = generateMeetingId();

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    throw new Error("User not authenticated");
  }

  const { data, error } = await supabase
    .from("meetings")
    .insert({
      name,
      description,
      meeting_id: meetingId,
      host_id: userData.user.id,
      is_recurring: isRecurring,
      recurrence_pattern: recurrencePattern,
      start_time: startTime?.toISOString(),
      duration,
      settings: settings || {
        waitingRoom: true,
        requirePassword: false,
        autoRecord: false,
      },
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Error creating meeting: ${error.message}`);
  }

  return data;
};

// Get meeting by ID
export const getMeetingById = async (meetingId: string) => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("meetings")
    .select("*")
    .eq("meeting_id", meetingId)
    .single();

  if (error) {
    throw new Error(`Error fetching meeting: ${error.message}`);
  }

  return data;
};

// Get all meetings for the current user
export const getUserMeetings = async () => {
  const supabase = createClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    throw new Error("User not authenticated");
  }

  // Get meetings where user is host
  const { data: hostedMeetings, error: hostedError } = await supabase
    .from("meetings")
    .select("*")
    .eq("host_id", userData.user.id);

  if (hostedError) {
    throw new Error(`Error fetching hosted meetings: ${hostedError.message}`);
  }

  // Get meetings where user is participant
  const { data: participantMeetings, error: participantError } = await supabase
    .from("meeting_participants")
    .select("meeting_id, meetings(*)")
    .eq("user_id", userData.user.id);

  if (participantError) {
    throw new Error(
      `Error fetching participant meetings: ${participantError.message}`,
    );
  }

  // Combine and return unique meetings
  const participantMeetingsData = participantMeetings
    .filter((item) => item.meetings)
    .map((item) => item.meetings as Meeting);

  return [...hostedMeetings, ...participantMeetingsData];
};

// Start a meeting session
export const startMeetingSession = async (meetingId: string) => {
  const supabase = createClient();

  try {
    // First get the meeting UUID from the meeting_id
    const { data: meeting, error: meetingError } = await supabase
      .from("meetings")
      .select("id")
      .eq("meeting_id", meetingId)
      .single();

    if (meetingError || !meeting) {
      // For instant meetings, create the meeting first
      const { data: newMeeting, error: createError } = await supabase
        .from("meetings")
        .insert({
          name: "Instant Meeting",
          meeting_id: meetingId,
          host_id: (await supabase.auth.getUser()).data.user?.id || "",
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (createError || !newMeeting) {
        throw new Error(
          `Error creating instant meeting: ${createError?.message}`,
        );
      }

      // Create a new session with the new meeting
      const { data: session, error: sessionError } = await supabase
        .from("meeting_sessions")
        .insert({
          meeting_id: newMeeting.id,
          is_active: true,
          started_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (sessionError) {
        throw new Error(
          `Error starting meeting session: ${sessionError.message}`,
        );
      }

      return { data: session, error: null };
    }

    // Create a new session with existing meeting
    const { data: session, error: sessionError } = await supabase
      .from("meeting_sessions")
      .insert({
        meeting_id: meeting.id,
        is_active: true,
        started_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (sessionError) {
      throw new Error(
        `Error starting meeting session: ${sessionError.message}`,
      );
    }

    return { data: session, error: null };
  } catch (error: any) {
    console.error("Error in startMeetingSession:", error);
    return { data: null, error: error.message };
  }
};

// End a meeting session
export const endMeetingSession = async (sessionId: string) => {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("meeting_sessions")
    .update({
      ended_at: new Date().toISOString(),
      is_active: false,
    })
    .eq("id", sessionId)
    .select()
    .single();

  if (error) {
    throw new Error(`Error ending meeting session: ${error.message}`);
  }

  return data;
};

// Join a meeting as a participant
export const joinMeeting = async (meetingId: string) => {
  const supabase = createClient();

  try {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) {
      throw new Error("User not authenticated");
    }

    // First get the meeting UUID from the meeting_id
    const { data: meeting, error: meetingError } = await supabase
      .from("meetings")
      .select("id")
      .eq("meeting_id", meetingId)
      .single();

    if (meetingError || !meeting) {
      // For instant meetings, create the meeting first
      const { data: newMeeting, error: createError } = await supabase
        .from("meetings")
        .insert({
          name: "Instant Meeting",
          meeting_id: meetingId,
          host_id: userData.user.id,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (createError || !newMeeting) {
        throw new Error(
          `Error creating instant meeting: ${createError?.message}`,
        );
      }

      // Add user as participant to the new meeting
      const { data, error } = await supabase
        .from("meeting_participants")
        .insert({
          meeting_id: newMeeting.id,
          user_id: userData.user.id,
          status: "joined",
          joined_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Error adding participant: ${error.message}`);
      }

      return data;
    }

    // Check if user is already a participant
    const { data: existingParticipant, error: participantError } =
      await supabase
        .from("meeting_participants")
        .select("*")
        .eq("meeting_id", meeting.id)
        .eq("user_id", userData.user.id)
        .maybeSingle();

    if (participantError) {
      throw new Error(
        `Error checking participant: ${participantError.message}`,
      );
    }

    if (existingParticipant) {
      // Update existing participant
      const { data, error } = await supabase
        .from("meeting_participants")
        .update({
          status: "joined",
          joined_at: new Date().toISOString(),
          left_at: null,
        })
        .eq("id", existingParticipant.id)
        .select()
        .single();

      if (error) {
        throw new Error(`Error updating participant: ${error.message}`);
      }

      return data;
    } else {
      // Add new participant
      const { data, error } = await supabase
        .from("meeting_participants")
        .insert({
          meeting_id: meeting.id,
          user_id: userData.user.id,
          status: "joined",
          joined_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Error adding participant: ${error.message}`);
      }

      return data;
    }
  } catch (error: any) {
    console.error("Error in joinMeeting:", error);
    // Return a minimal object that won't break the application
    return { id: "error", status: "error" };
  }
};

// Leave a meeting
export const leaveMeeting = async (meetingId: string) => {
  const supabase = createClient();

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    throw new Error("User not authenticated");
  }

  // First get the meeting UUID from the meeting_id
  const { data: meeting, error: meetingError } = await supabase
    .from("meetings")
    .select("id")
    .eq("meeting_id", meetingId)
    .single();

  if (meetingError || !meeting) {
    throw new Error(`Meeting not found: ${meetingError?.message}`);
  }

  // Update participant status
  const { data, error } = await supabase
    .from("meeting_participants")
    .update({
      status: "left",
      left_at: new Date().toISOString(),
    })
    .eq("meeting_id", meeting.id)
    .eq("user_id", userData.user.id)
    .select()
    .single();

  if (error) {
    throw new Error(`Error leaving meeting: ${error.message}`);
  }

  return data;
};

// Get participants for a meeting
export const getMeetingParticipants = async (meetingId: string) => {
  const supabase = createClient();

  // First get the meeting UUID from the meeting_id
  const { data: meeting, error: meetingError } = await supabase
    .from("meetings")
    .select("id")
    .eq("meeting_id", meetingId)
    .single();

  if (meetingError || !meeting) {
    throw new Error(`Meeting not found: ${meetingError?.message}`);
  }

  const { data, error } = await supabase
    .from("meeting_participants")
    .select("*, users(id, name, full_name, email, avatar_url)")
    .eq("meeting_id", meeting.id);

  if (error) {
    throw new Error(`Error fetching participants: ${error.message}`);
  }

  return data;
};
