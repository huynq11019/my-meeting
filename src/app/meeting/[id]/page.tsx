import MeetingInterfaceWebRTC from "@/components/meeting-interface-webrtc";
import { createClient } from "../../../../supabase/server";
import { redirect } from "next/navigation";

export default async function MeetingPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in?callbackUrl=/meeting/" + params.id);
  }

  return <MeetingInterfaceWebRTC meetingId={params.id} />;
}
