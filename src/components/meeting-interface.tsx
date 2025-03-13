"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Camera,
  CameraOff,
  Hand,
  Mic,
  MicOff,
  MonitorSmartphone,
  MoreVertical,
  Phone,
  Smile,
  MessageSquare,
  Users,
  Settings,
  Layout,
  Subtitles,
  CircleDot,
  Share2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Participant {
  id: string;
  name: string;
  avatar?: string;
  isMuted: boolean;
  isVideoOff: boolean;
  isScreenSharing: boolean;
  isHandRaised: boolean;
}

interface MeetingInterfaceProps {
  meetingId?: string;
  initialParticipants?: Participant[];
}

export default function MeetingInterface({
  meetingId = "abc-123-xyz",
  initialParticipants = [
    {
      id: "1",
      name: "You",
      isMuted: false,
      isVideoOff: false,
      isScreenSharing: false,
      isHandRaised: false,
    },
    {
      id: "2",
      name: "Sarah Johnson",
      avatar:
        "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=500&q=80",
      isMuted: false,
      isVideoOff: false,
      isScreenSharing: false,
      isHandRaised: false,
    },
    {
      id: "3",
      name: "Tom Brown",
      avatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=500&q=80",
      isMuted: true,
      isVideoOff: false,
      isScreenSharing: false,
      isHandRaised: false,
    },
    {
      id: "4",
      name: "Anna Kim",
      avatar:
        "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=500&q=80",
      isMuted: false,
      isVideoOff: true,
      isScreenSharing: false,
      isHandRaised: true,
    },
  ],
}: MeetingInterfaceProps) {
  const [participants, setParticipants] =
    useState<Participant[]>(initialParticipants);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isCaptionsOn, setIsCaptionsOn] = useState(false);
  const [activeTab, setActiveTab] = useState("participants");
  const [elapsedTime, setElapsedTime] = useState(0);
  const [viewMode, setViewMode] = useState("grid"); // grid, speaker

  // Timer for meeting duration
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Format elapsed time as HH:MM:SS
  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Toggle user controls
  const toggleMute = () => {
    setIsMuted(!isMuted);
    // In a real app, this would trigger audio muting
  };

  const toggleVideo = () => {
    setIsVideoOff(!isVideoOff);
    // In a real app, this would trigger video toggling
  };

  const toggleScreenShare = () => {
    setIsScreenSharing(!isScreenSharing);
    // In a real app, this would trigger screen sharing
  };

  const toggleHandRaise = () => {
    setIsHandRaised(!isHandRaised);
    // In a real app, this would notify others that hand is raised
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    // In a real app, this would start/stop recording
  };

  const toggleCaptions = () => {
    setIsCaptionsOn(!isCaptionsOn);
    // In a real app, this would enable/disable captions
  };

  const toggleViewMode = () => {
    setViewMode(viewMode === "grid" ? "speaker" : "grid");
  };

  // Count raised hands
  const raisedHandsCount =
    participants.filter((p) => p.isHandRaised).length + (isHandRaised ? 1 : 0);

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Top bar */}
      <div className="bg-white border-b p-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <h1 className="font-semibold">Meeting: {meetingId}</h1>
          <Badge variant="outline" className="ml-2">
            {formatTime(elapsedTime)}
          </Badge>
        </div>
        <div className="flex items-center space-x-4">
          {raisedHandsCount > 0 && (
            <Badge className="bg-yellow-500">
              <Hand className="w-3 h-3 mr-1" /> {raisedHandsCount}
            </Badge>
          )}
          <Button variant="outline" size="sm" onClick={toggleViewMode}>
            <Layout className="w-4 h-4 mr-2" />
            {viewMode === "grid" ? "Grid View" : "Speaker View"}
          </Button>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Video grid */}
        <div className="flex-1 p-4 overflow-auto">
          <div
            className={`grid ${viewMode === "grid" ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-4" : "grid-cols-1"} gap-4 h-full`}
          >
            {/* Your video */}
            <div
              className={`relative bg-gray-800 rounded-lg overflow-hidden ${viewMode === "speaker" ? "col-span-full row-span-2" : ""}`}
            >
              {isVideoOff ? (
                <div className="w-full h-full flex items-center justify-center bg-gray-800 text-white">
                  <div className="flex flex-col items-center">
                    <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center text-2xl font-bold mb-2">
                      You
                    </div>
                    <div className="text-sm">You</div>
                  </div>
                </div>
              ) : (
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&q=80"
                  alt="Your video"
                  className="w-full h-full object-cover"
                />
              )}
              <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs py-1 px-2 rounded-md flex items-center">
                {isMuted ? (
                  <MicOff className="w-3 h-3 mr-1 text-red-500" />
                ) : (
                  <Mic className="w-3 h-3 mr-1" />
                )}{" "}
                You
              </div>
              {isScreenSharing && (
                <Badge className="absolute top-2 right-2 bg-green-500">
                  <MonitorSmartphone className="w-3 h-3 mr-1" /> Sharing
                </Badge>
              )}
            </div>

            {/* Other participants */}
            {participants.slice(1).map((participant) => (
              <div
                key={participant.id}
                className="relative bg-gray-800 rounded-lg overflow-hidden"
              >
                {participant.isVideoOff ? (
                  <div className="w-full h-full flex items-center justify-center bg-gray-800 text-white">
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-xl font-bold mb-2">
                        {participant.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </div>
                      <div className="text-sm">{participant.name}</div>
                    </div>
                  </div>
                ) : (
                  <img
                    src={
                      participant.avatar ||
                      `https://api.dicebear.com/7.x/avataaars/svg?seed=${participant.id}`
                    }
                    alt={participant.name}
                    className="w-full h-full object-cover"
                  />
                )}
                <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs py-1 px-2 rounded-md flex items-center">
                  {participant.isMuted ? (
                    <MicOff className="w-3 h-3 mr-1 text-red-500" />
                  ) : (
                    <Mic className="w-3 h-3 mr-1" />
                  )}
                  {participant.name}
                </div>
                {participant.isHandRaised && (
                  <div className="absolute top-2 right-2 bg-yellow-500 text-white text-xs py-1 px-2 rounded-full">
                    <Hand className="w-3 h-3" />
                  </div>
                )}
                {participant.isScreenSharing && (
                  <Badge className="absolute top-2 left-2 bg-green-500">
                    <MonitorSmartphone className="w-3 h-3 mr-1" /> Sharing
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right sidebar */}
        <div className="w-80 bg-white border-l hidden md:block overflow-hidden">
          <Tabs defaultValue="participants" className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger
                value="participants"
                onClick={() => setActiveTab("participants")}
              >
                <Users className="w-4 h-4 mr-2" />
                Participants ({participants.length + 1})
              </TabsTrigger>
              <TabsTrigger value="chat" onClick={() => setActiveTab("chat")}>
                <MessageSquare className="w-4 h-4 mr-2" />
                Chat
              </TabsTrigger>
            </TabsList>
            <TabsContent
              value="participants"
              className="flex-1 overflow-auto p-4"
            >
              <div className="space-y-2">
                {/* You */}
                <div className="flex items-center justify-between p-2 rounded-md hover:bg-gray-100">
                  <div className="flex items-center space-x-2">
                    <Avatar>
                      <AvatarImage src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&q=80" />
                      <AvatarFallback>You</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">You</div>
                      <div className="text-xs text-gray-500">Host</div>
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    {isMuted && <MicOff className="w-4 h-4 text-red-500" />}
                    {isVideoOff && (
                      <CameraOff className="w-4 h-4 text-red-500" />
                    )}
                    {isHandRaised && (
                      <Hand className="w-4 h-4 text-yellow-500" />
                    )}
                  </div>
                </div>

                {/* Other participants */}
                {participants.map((participant) => (
                  <div
                    key={participant.id}
                    className="flex items-center justify-between p-2 rounded-md hover:bg-gray-100"
                  >
                    <div className="flex items-center space-x-2">
                      <Avatar>
                        <AvatarImage
                          src={
                            participant.avatar ||
                            `https://api.dicebear.com/7.x/avataaars/svg?seed=${participant.id}`
                          }
                        />
                        <AvatarFallback>
                          {participant.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="font-medium">{participant.name}</div>
                    </div>
                    <div className="flex space-x-1">
                      {participant.isMuted && (
                        <MicOff className="w-4 h-4 text-red-500" />
                      )}
                      {participant.isVideoOff && (
                        <CameraOff className="w-4 h-4 text-red-500" />
                      )}
                      {participant.isHandRaised && (
                        <Hand className="w-4 h-4 text-yellow-500" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="chat" className="flex-1 flex flex-col h-full">
              <div className="flex-1 p-4 overflow-auto">
                <div className="space-y-4">
                  <div className="flex items-start space-x-2">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=500&q=80" />
                      <AvatarFallback>SJ</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-sm">
                          Sarah Johnson
                        </span>
                        <span className="text-xs text-gray-500">10:32 AM</span>
                      </div>
                      <div className="bg-gray-100 p-2 rounded-md mt-1 text-sm">
                        Hi everyone! Thanks for joining the call today.
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=500&q=80" />
                      <AvatarFallback>TB</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-sm">Tom Brown</span>
                        <span className="text-xs text-gray-500">10:33 AM</span>
                      </div>
                      <div className="bg-gray-100 p-2 rounded-md mt-1 text-sm">
                        Good to be here. I've prepared some slides for the
                        presentation.
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&q=80" />
                      <AvatarFallback>You</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-sm">You</span>
                        <span className="text-xs text-gray-500">10:34 AM</span>
                      </div>
                      <div className="bg-blue-100 p-2 rounded-md mt-1 text-sm">
                        Great! Let's start with the agenda for today's meeting.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-4 border-t">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Type a message..."
                    className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <Button size="sm">Send</Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Bottom control bar */}
      <div className="bg-gray-900 text-white p-4">
        <div className="flex justify-between items-center">
          <div className="flex space-x-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`rounded-full ${isMuted ? "bg-red-500 hover:bg-red-600" : "bg-gray-700 hover:bg-gray-600"}`}
                    onClick={toggleMute}
                  >
                    {isMuted ? (
                      <MicOff className="h-5 w-5" />
                    ) : (
                      <Mic className="h-5 w-5" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{isMuted ? "Unmute" : "Mute"}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`rounded-full ${isVideoOff ? "bg-red-500 hover:bg-red-600" : "bg-gray-700 hover:bg-gray-600"}`}
                    onClick={toggleVideo}
                  >
                    {isVideoOff ? (
                      <CameraOff className="h-5 w-5" />
                    ) : (
                      <Camera className="h-5 w-5" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{isVideoOff ? "Turn on camera" : "Turn off camera"}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`rounded-full ${isScreenSharing ? "bg-green-500 hover:bg-green-600" : "bg-gray-700 hover:bg-gray-600"}`}
                    onClick={toggleScreenShare}
                  >
                    <MonitorSmartphone className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{isScreenSharing ? "Stop sharing" : "Share screen"}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`rounded-full ${isHandRaised ? "bg-yellow-500 hover:bg-yellow-600" : "bg-gray-700 hover:bg-gray-600"}`}
                    onClick={toggleHandRaise}
                  >
                    <Hand className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{isHandRaised ? "Lower hand" : "Raise hand"}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <DropdownMenu>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-full bg-gray-700 hover:bg-gray-600"
                      >
                        <Smile className="h-5 w-5" />
                      </Button>
                    </DropdownMenuTrigger>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Reactions</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <DropdownMenuContent>
                <DropdownMenuItem className="cursor-pointer">
                  👍 Thumbs Up
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  👏 Clap
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  ❤️ Heart
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  😂 Laugh
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  😮 Wow
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex space-x-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full bg-gray-700 hover:bg-gray-600"
                    onClick={toggleViewMode}
                  >
                    <Layout className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Change view</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`rounded-full ${isCaptionsOn ? "bg-blue-500 hover:bg-blue-600" : "bg-gray-700 hover:bg-gray-600"}`}
                    onClick={toggleCaptions}
                  >
                    <Subtitles className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    {isCaptionsOn ? "Turn off captions" : "Turn on captions"}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`rounded-full ${isRecording ? "bg-red-500 hover:bg-red-600" : "bg-gray-700 hover:bg-gray-600"}`}
                    onClick={toggleRecording}
                  >
                    <CircleDot className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{isRecording ? "Stop recording" : "Start recording"}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <DropdownMenu>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-full bg-gray-700 hover:bg-gray-600"
                      >
                        <MoreVertical className="h-5 w-5" />
                      </Button>
                    </DropdownMenuTrigger>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>More options</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <DropdownMenuContent>
                <DropdownMenuItem className="cursor-pointer">
                  <Settings className="h-4 w-4 mr-2" /> Settings
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  <Share2 className="h-4 w-4 mr-2" /> Share meeting link
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="destructive"
                  size="sm"
                  className="rounded-full"
                >
                  <Phone className="h-5 w-5 mr-2" /> Leave
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Leave meeting</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Captions overlay */}
      {isCaptionsOn && (
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-md text-center max-w-2xl">
          <p>This is where live captions would appear during the meeting.</p>
        </div>
      )}
    </div>
  );
}
