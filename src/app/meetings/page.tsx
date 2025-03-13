import { createClient } from "../../../supabase/server";
import { redirect } from "next/navigation";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Calendar,
  Clock,
  Copy,
  Edit,
  MoreHorizontal,
  Plus,
  Search,
  Trash2,
  Users,
  Video,
} from "lucide-react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { joinMeetingAction } from "@/app/actions/meeting-actions";

export default async function MeetingsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in?callbackUrl=/meetings");
  }

  // Generate a random meeting ID
  const meetingId = Math.random().toString(36).substring(2, 10);

  // Mock scheduled meetings
  const scheduledMeetings = [
    {
      id: "abc-123-xyz",
      name: "Weekly Team Sync",
      date: "2023-05-22",
      time: "10:00 AM",
      duration: "60 min",
      participants: 8,
      recurring: true,
    },
    {
      id: "def-456-uvw",
      name: "Product Planning",
      date: "2023-05-23",
      time: "2:00 PM",
      duration: "90 min",
      participants: 5,
      recurring: false,
    },
    {
      id: "ghi-789-rst",
      name: "Client Presentation",
      date: "2023-05-24",
      time: "11:30 AM",
      duration: "45 min",
      participants: 12,
      recurring: false,
    },
    {
      id: "jkl-012-opq",
      name: "Marketing Strategy",
      date: "2023-05-25",
      time: "3:30 PM",
      duration: "60 min",
      participants: 6,
      recurring: true,
    },
    {
      id: "mno-345-lmn",
      name: "Design Review",
      date: "2023-05-26",
      time: "9:00 AM",
      duration: "30 min",
      participants: 4,
      recurring: false,
    },
  ];

  // Mock recent meetings
  const recentMeetings = [
    {
      id: "abc-123-xyz",
      name: "Weekly Team Sync",
      date: "2023-05-15",
      participants: 8,
      duration: "58 min",
    },
    {
      id: "def-456-uvw",
      name: "Product Planning",
      date: "2023-05-12",
      participants: 5,
      duration: "72 min",
    },
    {
      id: "ghi-789-rst",
      name: "Client Presentation",
      date: "2023-05-10",
      participants: 12,
      duration: "45 min",
    },
  ];

  return (
    <>
      <DashboardNavbar />
      <main className="w-full bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 py-8 flex flex-col gap-8">
          {/* Header Section */}
          <header className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Meetings</h1>
              <p className="text-gray-500 mt-1">Manage your video meetings</p>
            </div>
            <div className="flex gap-3">
              <Link href={`/meeting/${meetingId}`}>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Video className="mr-2 h-4 w-4" /> Start Instant Meeting
                </Button>
              </Link>
              <Button variant="outline">
                <Plus className="mr-2 h-4 w-4" /> Schedule Meeting
              </Button>
            </div>
          </header>

          {/* Quick Join Section */}
          <Card>
            <CardHeader>
              <CardTitle>Join a Meeting</CardTitle>
              <CardDescription>
                Enter a meeting ID to join an existing meeting
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="flex gap-4" action={joinMeetingAction}>
                <Input
                  placeholder="Enter meeting ID"
                  className="max-w-md"
                  name="meeting_id"
                  required
                />
                <Button className="bg-gray-800 hover:bg-gray-900" type="submit">
                  <Users className="mr-2 h-4 w-4" /> Join Meeting
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Scheduled Meetings */}
          <section>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Scheduled Meetings</h2>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    placeholder="Search meetings"
                    className="pl-8 w-[250px]"
                  />
                </div>
                <Button variant="outline" size="icon">
                  <Calendar className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Meeting Name</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Participants</TableHead>
                      <TableHead>Recurring</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {scheduledMeetings.map((meeting) => (
                      <TableRow key={meeting.id}>
                        <TableCell className="font-medium">
                          {meeting.name}
                        </TableCell>
                        <TableCell>{meeting.date}</TableCell>
                        <TableCell>{meeting.time}</TableCell>
                        <TableCell>{meeting.duration}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" /> {meeting.participants}
                          </div>
                        </TableCell>
                        <TableCell>
                          {meeting.recurring ? "Weekly" : "One-time"}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Link href={`/meeting/${meeting.id}`}>
                              <Button size="sm" variant="outline">
                                Start
                              </Button>
                            </Link>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                  <Edit className="mr-2 h-4 w-4" /> Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Copy className="mr-2 h-4 w-4" /> Copy ID
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-red-600">
                                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </section>

          {/* Recent Meetings */}
          <section>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Recent Meetings</h2>
              <Button variant="link" className="text-blue-600">
                View All
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {recentMeetings.map((meeting) => (
                <Card key={meeting.id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{meeting.name}</CardTitle>
                    <CardDescription className="flex items-center gap-2">
                      <Clock className="h-3 w-3" />
                      {new Date(meeting.date).toLocaleDateString()} •{" "}
                      {meeting.duration}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Users className="h-3 w-3" /> {meeting.participants}{" "}
                      participants
                    </div>
                    <div className="text-xs bg-gray-100 px-2 py-1 rounded mt-2 w-fit">
                      ID: {meeting.id}
                    </div>
                  </CardContent>
                  <CardFooter className="pt-2">
                    <div className="flex gap-2 w-full">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Copy className="mr-2 h-3 w-3" /> Copy ID
                      </Button>
                      <Link href={`/meeting/${meeting.id}`} className="flex-1">
                        <Button size="sm" className="w-full">
                          Join Again
                        </Button>
                      </Link>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
