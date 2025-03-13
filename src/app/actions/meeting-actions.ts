"use server";

import { createClient } from "../../../supabase/server";
import { redirect } from "next/navigation";
import { encodedRedirect } from "@/utils/utils";

// Create a new meeting
export async function createMeetingAction(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return encodedRedirect(
      "error",
      "/sign-in",
      "You must be signed in to create a meeting",
    );
  }

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const isRecurring = formData.get("is_recurring") === "on";
  const recurrencePattern = formData.get("recurrence_pattern") as string;
  const date = formData.get("date") as string;
  const hour = formData.get("hour") as string;
  const minute = formData.get("minute") as string;
  const ampm = formData.get("ampm") as string;
  const duration = parseInt(formData.get("duration") as string, 10);
  const waitingRoom = formData.get("waiting-room") === "on";
  const requirePassword = formData.get("require-password") === "on";
  const autoRecord = formData.get("record") === "on";

  if (!name) {
    return encodedRedirect(
      "error",
      "/meetings/schedule",
      "Meeting name is required",
    );
  }

  // Generate a random meeting ID
  const meetingId = Math.random().toString(36).substring(2, 10);

  // Parse date and time if provided
  let startTime = null;
  if (date && hour && minute && ampm) {
    const hourNum =
      parseInt(hour, 10) +
      (ampm.toLowerCase() === "pm" && parseInt(hour, 10) !== 12 ? 12 : 0);
    const minuteNum = parseInt(minute, 10);
    startTime = new Date(
      `${date}T${hourNum.toString().padStart(2, "0")}:${minuteNum.toString().padStart(2, "0")}:00`,
    );
  }

  try {
    const { data, error } = await supabase
      .from("meetings")
      .insert({
        name,
        description,
        meeting_id: meetingId,
        host_id: user.id,
        is_recurring: isRecurring,
        recurrence_pattern: recurrencePattern,
        start_time: startTime?.toISOString(),
        duration,
        settings: {
          waitingRoom,
          requirePassword,
          autoRecord,
        },
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating meeting:", error);
      return encodedRedirect(
        "error",
        "/meetings/schedule",
        `Error creating meeting: ${error.message}`,
      );
    }

    return redirect(`/meetings/${meetingId}`);
  } catch (error: any) {
    console.error("Error creating meeting:", error);
    return encodedRedirect(
      "error",
      "/meetings/schedule",
      `Error creating meeting: ${error.message}`,
    );
  }
}

// Join a meeting
export async function joinMeetingAction(formData: FormData) {
  const meetingId = formData.get("meeting_id") as string;

  if (!meetingId) {
    return encodedRedirect("error", "/meetings", "Meeting ID is required");
  }

  const supabase = await createClient();

  // Check if meeting exists
  const { data: meeting, error: meetingError } = await supabase
    .from("meetings")
    .select("*")
    .eq("meeting_id", meetingId)
    .single();

  if (meetingError || !meeting) {
    return encodedRedirect("error", "/meetings", "Meeting not found");
  }

  return redirect(`/meeting/${meetingId}`);
}

// End a meeting (for hosts)
export async function endMeetingAction(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return encodedRedirect(
      "error",
      "/sign-in",
      "You must be signed in to end a meeting",
    );
  }

  const meetingId = formData.get("meeting_id") as string;
  const sessionId = formData.get("session_id") as string;

  if (!meetingId || !sessionId) {
    return encodedRedirect(
      "error",
      "/meetings",
      "Meeting ID and session ID are required",
    );
  }

  // Check if user is the host
  const { data: meeting, error: meetingError } = await supabase
    .from("meetings")
    .select("*")
    .eq("meeting_id", meetingId)
    .eq("host_id", user.id)
    .single();

  if (meetingError || !meeting) {
    return encodedRedirect(
      "error",
      `/meeting/${meetingId}`,
      "You are not authorized to end this meeting",
    );
  }

  // End the meeting session
  const { error: sessionError } = await supabase
    .from("meeting_sessions")
    .update({
      ended_at: new Date().toISOString(),
      is_active: false,
    })
    .eq("id", sessionId);

  if (sessionError) {
    return encodedRedirect(
      "error",
      `/meeting/${meetingId}`,
      `Error ending meeting: ${sessionError.message}`,
    );
  }

  return redirect("/meetings");
}

// Delete a meeting
export async function deleteMeetingAction(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return encodedRedirect(
      "error",
      "/sign-in",
      "You must be signed in to delete a meeting",
    );
  }

  const meetingId = formData.get("meeting_id") as string;

  if (!meetingId) {
    return encodedRedirect("error", "/meetings", "Meeting ID is required");
  }

  // Check if user is the host
  const { data: meeting, error: meetingError } = await supabase
    .from("meetings")
    .select("*")
    .eq("meeting_id", meetingId)
    .eq("host_id", user.id)
    .single();

  if (meetingError || !meeting) {
    return encodedRedirect(
      "error",
      "/meetings",
      "You are not authorized to delete this meeting",
    );
  }

  // Delete the meeting
  const { error: deleteError } = await supabase
    .from("meetings")
    .delete()
    .eq("id", meeting.id);

  if (deleteError) {
    return encodedRedirect(
      "error",
      "/meetings",
      `Error deleting meeting: ${deleteError.message}`,
    );
  }

  return redirect("/meetings");
}
