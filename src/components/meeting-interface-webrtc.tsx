"use client";

import { useState, useEffect, useRef } from "react";
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
import { getWebRTCManager } from "@/lib/webrtc";
import {
  joinMeeting,
  leaveMeeting,
  startMeetingSession,
  endMeetingSession,
} from "@/lib/meeting-utils";
import { createClient } from "../../supabase/client";

interface Participant {
  id: string;
  name: string;
  avatar?: string;
  isMuted: boolean;
  isVideoOff: boolean;
  isScreenSharing: boolean;
  isHandRaised: boolean;
  stream?: MediaStream;
}

interface MeetingInterfaceProps {
  meetingId: string;
}

export default function MeetingInterfaceWebRTC({
  meetingId,
}: MeetingInterfaceProps) {
  const [participants, setParticipants] = useState<Map<string, Participant>>(
    new Map(),
  );
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isCaptionsOn, setIsCaptionsOn] = useState(false);
  const [activeTab, setActiveTab] = useState("participants");
  const [elapsedTime, setElapsedTime] = useState(0);
  const [viewMode, setViewMode] = useState("grid"); // grid, speaker
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>("");
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [messages, setMessages] = useState<
    Array<{ sender: string; text: string; time: string }>
  >([]);
  const [messageInput, setMessageInput] = useState("");

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const webRTCManager = useRef(getWebRTCManager());
  const supabase = createClient();
  const chatChannel = useRef<any>(null);

  // Initialize WebRTC and join the meeting
  useEffect(() => {
    const initMeeting = async () => {
      try {
        // Get user info
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          console.error("User not authenticated");
          return;
        }

        setUserId(user.id);

        // Get user profile
        const { data: profile } = await supabase
          .from("users")
          .select("name, full_name, avatar_url")
          .eq("id", user.id)
          .single();

        if (profile) {
          setUserName(
            profile.full_name || profile.name || user.email || "Anonymous",
          );
          setUserAvatar(profile.avatar_url);
        } else {
          setUserName(user.email || "Anonymous");
        }

        // Join the meeting in the database
        await joinMeeting(meetingId);

        try {
          // Start a meeting session if one doesn't exist
          const { data: session } = await startMeetingSession(meetingId);
          if (session) {
            setSessionId(session.id);
          }
        } catch (error) {
          console.error("Error starting meeting session:", error);
          // Continue anyway - the meeting can still work without a session record
        }

        // Set up WebRTC callbacks
        webRTCManager.current.setCallbacks({
          onParticipantJoined: (participantId) => {
            console.log(`Participant joined: ${participantId}`);
            // We'll update the participant list when we get their stream
          },
          onParticipantLeft: (participantId) => {
            console.log(`Participant left: ${participantId}`);
            setParticipants((prev) => {
              const updated = new Map(prev);
              updated.delete(participantId);
              return updated;
            });
          },
          onStreamAdded: (participantId, stream) => {
            console.log(`Stream added for participant: ${participantId}`);
            // Get participant info from Supabase
            supabase
              .from("users")
              .select("name, full_name, avatar_url")
              .eq("id", participantId)
              .single()
              .then(({ data }) => {
                const participantName =
                  data?.full_name || data?.name || "Unknown";
                const participantAvatar = data?.avatar_url;

                setParticipants((prev) => {
                  const updated = new Map(prev);
                  updated.set(participantId, {
                    id: participantId,
                    name: participantName,
                    avatar: participantAvatar || undefined,
                    isMuted: false, // We don't know yet
                    isVideoOff: false, // We don't know yet
                    isScreenSharing: false, // We don't know yet
                    isHandRaised: false, // We don't know yet
                    stream,
                  });
                  return updated;
                });
              });
          },
          onLocalStream: (stream) => {
            console.log("Local stream initialized");
            if (localVideoRef.current) {
              localVideoRef.current.srcObject = stream;
            }
          },
        });

        // Join the WebRTC room
        await webRTCManager.current.joinRoom(meetingId);

        // Set up chat channel
        setupChatChannel();

        // Start the timer
        const timer = setInterval(() => {
          setElapsedTime((prev) => prev + 1);
        }, 1000);

        return () => {
          clearInterval(timer);
          cleanupMeeting();
        };
      } catch (error) {
        console.error("Error initializing meeting:", error);
      }
    };

    initMeeting();

    return () => {
      cleanupMeeting();
    };
  }, [meetingId]);

  const setupChatChannel = () => {
    chatChannel.current = supabase.channel(`meeting-chat:${meetingId}`, {
      config: {
        broadcast: {
          self: false,
        },
      },
    });

    chatChannel.current
      .on("broadcast", { event: "chat-message" }, ({ payload }: any) => {
        if (payload.sender !== userId) {
          setMessages((prev) => [
            ...prev,
            {
              sender: payload.senderName,
              text: payload.message,
              time: new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              }),
            },
          ]);
        }
      })
      .subscribe();
  };

  const cleanupMeeting = async () => {
    // Leave the WebRTC room
    await webRTCManager.current.leaveRoom();

    // Leave the meeting in the database
    if (meetingId) {
      await leaveMeeting(meetingId);
    }

    // Unsubscribe from chat channel
    if (chatChannel.current) {
      await chatChannel.current.unsubscribe();
    }
  };

  // Format elapsed time as HH:MM:SS
  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Toggle user controls
  const toggleMute = async () => {
    const newMutedState = await webRTCManager.current.toggleAudio();
    setIsMuted(!newMutedState);
  };

  const toggleVideo = async () => {
    const newVideoState = await webRTCManager.current.toggleVideo();
    setIsVideoOff(!newVideoState);
  };

  const toggleScreenShare = async () => {
    const newScreenShareState = await webRTCManager.current.toggleScreenShare();
    setIsScreenSharing(newScreenShareState);
  };

  const toggleHandRaise = () => {
    setIsHandRaised(!isHandRaised);
    // Broadcast hand raise status to other participants
    if (chatChannel.current) {
      chatChannel.current.send({
        type: "broadcast",
        event: "hand-status",
        payload: {
          userId,
          isRaised: !isHandRaised,
        },
      });
    }
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

  const sendMessage = () => {
    if (!messageInput.trim() || !chatChannel.current) return;

    const newMessage = {
      sender: userName,
      text: messageInput,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((prev) => [...prev, newMessage]);

    chatChannel.current.send({
      type: "broadcast",
      event: "chat-message",
      payload: {
        sender: userId,
        senderName: userName,
        message: messageInput,
      },
    });

    setMessageInput("");
  };

  // Count raised hands
  const raisedHandsCount = isHandRaised ? 1 : 0;

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
                      {userName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                    <div className="text-sm">{userName} (You)</div>
                  </div>
                </div>
              ) : (
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
              )}
              <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs py-1 px-2 rounded-md flex items-center">
                {isMuted ? (
                  <MicOff className="w-3 h-3 mr-1 text-red-500" />
                ) : (
                  <Mic className="w-3 h-3 mr-1" />
                )}{" "}
                {userName} (You)
              </div>
              {isScreenSharing && (
                <Badge className="absolute top-2 right-2 bg-green-500">
                  <MonitorSmartphone className="w-3 h-3 mr-1" /> Sharing
                </Badge>
              )}
            </div>

            {/* Other participants */}
            {Array.from(participants.values()).map((participant) => (
              <div
                key={participant.id}
                className="relative bg-gray-800 rounded-lg overflow-hidden"
              >
                {participant.isVideoOff || !participant.stream ? (
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
                  <video
                    autoPlay
                    playsInline
                    ref={(element) => {
                      if (element && participant.stream) {
                        element.srcObject = participant.stream;
                      }
                    }}
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
                Participants ({participants.size + 1})
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
                      <AvatarImage src={userAvatar || undefined} />
                      <AvatarFallback>
                        {userName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{userName} (You)</div>
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
                {Array.from(participants.values()).map((participant) => (
                  <div
                    key={participant.id}
                    className="flex items-center justify-between p-2 rounded-md hover:bg-gray-100"
                  >
                    <div className="flex items-center space-x-2">
                      <Avatar>
                        <AvatarImage src={participant.avatar} />
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
                  {messages.map((message, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback>
                          {message.sender
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-sm">
                            {message.sender}
                          </span>
                          <span className="text-xs text-gray-500">
                            {message.time}
                          </span>
                        </div>
                        <div className="bg-gray-100 p-2 rounded-md mt-1 text-sm">
                          {message.text}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-4 border-t">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Type a message..."
                    className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  />
                  <Button size="sm" onClick={sendMessage}>
                    Send
                  </Button>
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
                  onClick={async () => {
                    await cleanupMeeting();
                    window.location.href = "/meetings";
                  }}
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
