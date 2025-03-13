import DashboardNavbar from "@/components/dashboard-navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Camera,
  Calendar,
  Clock,
  Copy,
  InfoIcon,
  Plus,
  UserCircle,
  Users,
  Video,
} from "lucide-react";
import { redirect } from "next/navigation";
import { createClient } from "../../../supabase/server";
import Link from "next/link";

import { joinMeetingAction } from "@/app/actions/meeting-actions";

export default async function Dashboard() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // Generate a random meeting ID
  const meetingId = Math.random().toString(36).substring(2, 10);

  // Mock recent meetings
  const recentMeetings = [
    {
      id: "abc-123-xyz",
      name: "Weekly Team Sync",
      date: "2023-05-15",
      participants: 8,
    },
    {
      id: "def-456-uvw",
      name: "Product Planning",
      date: "2023-05-12",
      participants: 5,
    },
    {
      id: "ghi-789-rst",
      name: "Client Presentation",
      date: "2023-05-10",
      participants: 12,
    },
  ];

  return (
    <>
      <DashboardNavbar />
      <main className="w-full bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 py-8 flex flex-col gap-8">
          {/* Header Section */}
          <header className="flex flex-col gap-4">
            <h1 className="text-3xl font-bold">Video Meetings</h1>
            <div className="bg-blue-50 text-sm p-3 px-4 rounded-lg text-blue-700 flex gap-2 items-center border border-blue-100">
              <InfoIcon size="14" />
              <span>
                Welcome to your video conferencing dashboard. Start or join a
                meeting below.
              </span>
            </div>
          </header>

          {/* Quick Actions */}
          <section className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Start a New Meeting</CardTitle>
                <CardDescription>
                  Create an instant meeting and invite others
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 p-3 rounded-full">
                      <Video className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">Your Meeting ID</p>
                      <p className="text-sm text-gray-500">{meetingId}</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="flex gap-1">
                    <Copy className="h-4 w-4" /> Copy
                  </Button>
                </div>
              </CardContent>
              <CardFooter>
                <Link href={`/meeting/${meetingId}`} className="w-full">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    <Camera className="mr-2 h-4 w-4" /> Start Meeting Now
                  </Button>
                </Link>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Join a Meeting</CardTitle>
                <CardDescription>
                  Enter a meeting ID to join an existing meeting
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-4">
                  <form className="w-full" action={joinMeetingAction}>
                    <Input
                      placeholder="Enter meeting ID"
                      className="text-center text-lg py-6 mb-4"
                      name="meeting_id"
                      required
                    />
                    <Button
                      className="w-full bg-gray-800 hover:bg-gray-900"
                      type="submit"
                    >
                      <Users className="mr-2 h-4 w-4" /> Join Meeting
                    </Button>
                  </form>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between text-sm text-gray-500">
                <p>No account required for guests</p>
                <p>End-to-end encrypted</p>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Manage Meetings</CardTitle>
                <CardDescription>
                  Schedule, view and manage your meetings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="bg-purple-100 p-3 rounded-full">
                        <Calendar className="h-6 w-6 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-medium">Your Meetings</p>
                        <p className="text-sm text-gray-500">
                          View and manage all meetings
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Link href="/meetings" className="w-full">
                  <Button className="w-full" variant="outline">
                    <Calendar className="mr-2 h-4 w-4" /> Go to Meetings
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </section>

          {/* Recent Meetings */}
          <section>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Recent Meetings</h2>
              <Link href="/meetings/schedule">
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-1" /> Schedule
                </Button>
              </Link>
            </div>
            <div className="bg-white rounded-xl border overflow-hidden">
              <div className="grid grid-cols-1 divide-y">
                {recentMeetings.map((meeting) => (
                  <div
                    key={meeting.id}
                    className="p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium">{meeting.name}</h3>
                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />{" "}
                            {new Date(meeting.date).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" /> {meeting.participants}{" "}
                            participants
                          </div>
                          <div className="text-xs bg-gray-100 px-2 py-0.5 rounded">
                            ID: {meeting.id}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Link href="/meetings">
                          <Button variant="outline" size="sm">
                            View All
                          </Button>
                        </Link>
                        <Link href={`/meeting/${meeting.id}`}>
                          <Button size="sm">Join Again</Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* User Profile Section */}
          <section className="bg-card rounded-xl p-6 border shadow-sm">
            <div className="flex items-center gap-4 mb-6">
              <UserCircle size={48} className="text-primary" />
              <div>
                <h2 className="font-semibold text-xl">User Profile</h2>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>
            <div className="bg-muted/50 rounded-lg p-4 overflow-hidden">
              <pre className="text-xs font-mono max-h-48 overflow-auto">
                {JSON.stringify(user, null, 2)}
              </pre>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
