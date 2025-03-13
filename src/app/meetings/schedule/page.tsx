import DashboardNavbar from "@/components/dashboard-navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { CalendarIcon, Clock, Users } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import Link from "next/link";

import { createMeetingAction } from "@/app/actions/meeting-actions";

export default function ScheduleMeetingPage() {
  return (
    <>
      <DashboardNavbar />
      <main className="w-full bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 py-8 flex flex-col gap-8">
          {/* Header Section */}
          <header className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Schedule a Meeting</h1>
              <p className="text-gray-500 mt-1">
                Set up a new video meeting with your team
              </p>
            </div>
          </header>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Meeting Details</CardTitle>
                  <CardDescription>
                    Fill in the information for your scheduled meeting
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="meeting-name">Meeting Name</Label>
                    <Input
                      id="meeting-name"
                      placeholder="Weekly Team Sync"
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="meeting-description">Description</Label>
                    <Textarea
                      id="meeting-description"
                      placeholder="Discuss project updates and upcoming tasks"
                      className="w-full min-h-[100px]"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full justify-start text-left font-normal",
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            <span>Pick a date</span>
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar mode="single" initialFocus />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="space-y-2">
                      <Label>Time</Label>
                      <div className="flex space-x-2">
                        <Select>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Hour" />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 12 }, (_, i) => i + 1).map(
                              (hour) => (
                                <SelectItem key={hour} value={hour.toString()}>
                                  {hour}
                                </SelectItem>
                              ),
                            )}
                          </SelectContent>
                        </Select>

                        <Select>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Minute" />
                          </SelectTrigger>
                          <SelectContent>
                            {["00", "15", "30", "45"].map((minute) => (
                              <SelectItem key={minute} value={minute}>
                                {minute}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <Select>
                          <SelectTrigger className="w-[100px]">
                            <SelectValue placeholder="AM/PM" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="am">AM</SelectItem>
                            <SelectItem value="pm">PM</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="duration">Duration</Label>
                      <Select>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select duration" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="15">15 minutes</SelectItem>
                          <SelectItem value="30">30 minutes</SelectItem>
                          <SelectItem value="45">45 minutes</SelectItem>
                          <SelectItem value="60">1 hour</SelectItem>
                          <SelectItem value="90">1.5 hours</SelectItem>
                          <SelectItem value="120">2 hours</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Recurring Meeting</Label>
                      <div className="flex items-center space-x-2 pt-2">
                        <Checkbox id="recurring" />
                        <label
                          htmlFor="recurring"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Make this a recurring meeting
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="participants">Participants</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="participants"
                        placeholder="Enter email addresses"
                        className="w-full"
                      />
                      <Button variant="outline">
                        <Users className="h-4 w-4 mr-2" /> Add
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500">
                      Separate multiple emails with commas
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Meeting Options</Label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="waiting-room" />
                        <label
                          htmlFor="waiting-room"
                          className="text-sm font-medium leading-none"
                        >
                          Enable waiting room
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="require-password" />
                        <label
                          htmlFor="require-password"
                          className="text-sm font-medium leading-none"
                        >
                          Require meeting password
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="record" />
                        <label
                          htmlFor="record"
                          className="text-sm font-medium leading-none"
                        >
                          Automatically record meeting
                        </label>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Link href="/meetings">
                    <Button variant="outline" type="button">
                      Cancel
                    </Button>
                  </Link>
                  <Button
                    className="bg-blue-600 hover:bg-blue-700"
                    type="submit"
                    formAction={createMeetingAction}
                  >
                    Schedule Meeting
                  </Button>
                </CardFooter>
              </Card>
            </div>

            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Meeting Summary</CardTitle>
                  <CardDescription>
                    Preview of your scheduled meeting
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-500">
                      Meeting Name
                    </p>
                    <p className="font-medium">Weekly Team Sync</p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-500">When</p>
                    <div className="flex items-center">
                      <CalendarIcon className="h-4 w-4 mr-2 text-gray-500" />
                      <p>May 22, 2023</p>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-gray-500" />
                      <p>10:00 AM - 11:00 AM</p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-500">
                      Participants
                    </p>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-2 text-gray-500" />
                      <p>You + 0 others</p>
                    </div>
                  </div>

                  <div className="pt-4">
                    <p className="text-sm font-medium text-gray-500 mb-2">
                      Meeting Link
                    </p>
                    <div className="bg-gray-50 p-3 rounded-md text-sm break-all">
                      https://videomeet.com/m/abc-123-xyz
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
