import DashboardNavbar from "@/components/dashboard-navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
  Link as LinkIcon,
  MoreHorizontal,
  Trash2,
  Users,
  Video,
} from "lucide-react";
import Link from "next/link";
import { createClient } from "../../../../supabase/server";
import { redirect } from "next/navigation";

export default async function MeetingDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in?callbackUrl=/meetings/" + params.id);
  }

  // Mock meeting data
  const meeting = {
    id: params.id,
    name: "Weekly Team Sync",
    description: "Discuss project updates and upcoming tasks for the week",
    date: "2023-05-22",
    time: "10:00 AM",
    duration: "60 min",
    recurring: true,
    recurrencePattern: "Weekly on Monday",
    host: {
      name: "John Doe",
      email: "john@example.com",
    },
    participants: [
      {
        name: "Sarah Johnson",
        email: "sarah@example.com",
        status: "Accepted",
      },
      {
        name: "Tom Brown",
        email: "tom@example.com",
        status: "Pending",
      },
      {
        name: "Anna Kim",
        email: "anna@example.com",
        status: "Declined",
      },
      {
        name: "Mike Wilson",
        email: "mike@example.com",
        status: "Accepted",
      },
    ],
    settings: {
      waitingRoom: true,
      requirePassword: false,
      autoRecord: true,
    },
  };

  return (
    <>
      <DashboardNavbar />
      <main className="w-full bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 py-8 flex flex-col gap-8">
          {/* Header Section */}
          <header className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">{meeting.name}</h1>
              <p className="text-gray-500 mt-1">Meeting ID: {meeting.id}</p>
            </div>
            <div className="flex gap-3">
              <Link href={`/meeting/${meeting.id}`}>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Video className="mr-2 h-4 w-4" /> Start Meeting
                </Button>
              </Link>
              <Button variant="outline">
                <Edit className="mr-2 h-4 w-4" /> Edit
              </Button>
            </div>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-6">
              {/* Meeting Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Meeting Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">
                        Date & Time
                      </h3>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span>{meeting.date}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span>
                          {meeting.time} ({meeting.duration})
                        </span>
                      </div>
                      {meeting.recurring && (
                        <div className="mt-2 text-sm text-blue-600">
                          {meeting.recurrencePattern}
                        </div>
                      )}
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">
                        Meeting Link
                      </h3>
                      <div className="flex items-center gap-2 bg-gray-100 p-2 rounded-md">
                        <LinkIcon className="h-4 w-4 text-gray-500" />
                        <span className="text-sm truncate">
                          https://videomeet.com/m/{meeting.id}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="ml-auto h-8"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">
                      Description
                    </h3>
                    <p className="text-sm">{meeting.description}</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">
                      Host
                    </h3>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">
                        {meeting.host.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          {meeting.host.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {meeting.host.email}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">
                      Meeting Settings
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-3 h-3 rounded-full ${meeting.settings.waitingRoom ? "bg-green-500" : "bg-gray-300"}`}
                        ></div>
                        <span className="text-sm">
                          {meeting.settings.waitingRoom
                            ? "Waiting room enabled"
                            : "No waiting room"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-3 h-3 rounded-full ${meeting.settings.requirePassword ? "bg-green-500" : "bg-gray-300"}`}
                        ></div>
                        <span className="text-sm">
                          {meeting.settings.requirePassword
                            ? "Password required"
                            : "No password"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-3 h-3 rounded-full ${meeting.settings.autoRecord ? "bg-green-500" : "bg-gray-300"}`}
                        ></div>
                        <span className="text-sm">
                          {meeting.settings.autoRecord
                            ? "Auto recording on"
                            : "No auto recording"}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Participants */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Participants</CardTitle>
                    <CardDescription>
                      {meeting.participants.length} people invited
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm">
                    <Users className="mr-2 h-4 w-4" /> Invite More
                  </Button>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {meeting.participants.map((participant, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">
                            {participant.name}
                          </TableCell>
                          <TableCell>{participant.email}</TableCell>
                          <TableCell>
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                participant.status === "Accepted"
                                  ? "bg-green-100 text-green-800"
                                  : participant.status === "Declined"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {participant.status}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Link href={`/meeting/${meeting.id}`} className="w-full">
                    <Button className="w-full bg-blue-600 hover:bg-blue-700">
                      <Video className="mr-2 h-4 w-4" /> Start Now
                    </Button>
                  </Link>
                  <Button className="w-full" variant="outline">
                    <Copy className="mr-2 h-4 w-4" /> Copy Invitation
                  </Button>
                  <Button className="w-full" variant="outline">
                    <Calendar className="mr-2 h-4 w-4" /> Add to Calendar
                  </Button>
                </CardContent>
              </Card>

              {/* Upcoming Occurrences */}
              {meeting.recurring && (
                <Card>
                  <CardHeader>
                    <CardTitle>Upcoming Occurrences</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      {[
                        "May 22, 2023 - 10:00 AM",
                        "May 29, 2023 - 10:00 AM",
                        "June 5, 2023 - 10:00 AM",
                        "June 12, 2023 - 10:00 AM",
                      ].map((date, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 bg-gray-50 rounded-md"
                        >
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            <span className="text-sm">{date}</span>
                          </div>
                          {index === 0 && (
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                              Next
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Danger Zone */}
              <Card className="border-red-100">
                <CardHeader>
                  <CardTitle className="text-red-600">Danger Zone</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button
                    variant="outline"
                    className="w-full border-red-200 text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="mr-2 h-4 w-4" /> Cancel Meeting
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
