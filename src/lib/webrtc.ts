import { createClient } from "../../supabase/client";

export interface PeerConnection {
  peerConnection: RTCPeerConnection;
  userId: string;
  stream?: MediaStream;
}

export interface WebRTCState {
  localStream: MediaStream | null;
  peerConnections: Map<string, PeerConnection>;
  roomId: string | null;
  userId: string | null;
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  isScreenSharing: boolean;
}

export class WebRTCManager {
  private state: WebRTCState = {
    localStream: null,
    peerConnections: new Map(),
    roomId: null,
    userId: null,
    isAudioEnabled: true,
    isVideoEnabled: true,
    isScreenSharing: false,
  };

  private supabase = createClient();
  private channel: any = null;
  private onParticipantJoinedCallback: ((userId: string) => void) | null = null;
  private onParticipantLeftCallback: ((userId: string) => void) | null = null;
  private onStreamAddedCallback:
    | ((userId: string, stream: MediaStream) => void)
    | null = null;
  private onLocalStreamCallback: ((stream: MediaStream) => void) | null = null;

  constructor() {
    this.setupAuthListener();
  }

  private async setupAuthListener() {
    const { data } = await this.supabase.auth.getUser();
    if (data.user) {
      this.state.userId = data.user.id;
    }

    this.supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        this.state.userId = session.user.id;
      } else if (event === "SIGNED_OUT") {
        this.state.userId = null;
        this.leaveRoom();
      }
    });
  }

  public setCallbacks({
    onParticipantJoined,
    onParticipantLeft,
    onStreamAdded,
    onLocalStream,
  }: {
    onParticipantJoined?: (userId: string) => void;
    onParticipantLeft?: (userId: string) => void;
    onStreamAdded?: (userId: string, stream: MediaStream) => void;
    onLocalStream?: (stream: MediaStream) => void;
  }) {
    this.onParticipantJoinedCallback = onParticipantJoined || null;
    this.onParticipantLeftCallback = onParticipantLeft || null;
    this.onStreamAddedCallback = onStreamAdded || null;
    this.onLocalStreamCallback = onLocalStream || null;
  }

  public async joinRoom(roomId: string) {
    if (!this.state.userId) {
      throw new Error("User not authenticated");
    }

    this.state.roomId = roomId;

    // Initialize local media stream if not already done
    if (!this.state.localStream) {
      await this.initializeLocalStream();
    }

    // Subscribe to the Supabase realtime channel for signaling
    this.channel = this.supabase.channel(`meeting:${roomId}`, {
      config: {
        broadcast: {
          self: false,
        },
      },
    });

    // Handle signaling messages
    this.channel
      .on("broadcast", { event: "user-joined" }, ({ payload }: any) => {
        if (payload.userId !== this.state.userId) {
          this.handleUserJoined(payload.userId);
        }
      })
      .on("broadcast", { event: "user-left" }, ({ payload }: any) => {
        if (payload.userId !== this.state.userId) {
          this.handleUserLeft(payload.userId);
        }
      })
      .on("broadcast", { event: "offer" }, ({ payload }: any) => {
        if (payload.target === this.state.userId) {
          this.handleOffer(payload.sender, payload.offer);
        }
      })
      .on("broadcast", { event: "answer" }, ({ payload }: any) => {
        if (payload.target === this.state.userId) {
          this.handleAnswer(payload.sender, payload.answer);
        }
      })
      .on("broadcast", { event: "ice-candidate" }, ({ payload }: any) => {
        if (payload.target === this.state.userId) {
          this.handleIceCandidate(payload.sender, payload.candidate);
        }
      })
      .subscribe();

    // Announce that we've joined the room
    await this.channel.send({
      type: "broadcast",
      event: "user-joined",
      payload: { userId: this.state.userId },
    });
  }

  public async leaveRoom() {
    if (this.state.roomId && this.state.userId) {
      // Announce that we're leaving
      if (this.channel) {
        await this.channel.send({
          type: "broadcast",
          event: "user-left",
          payload: { userId: this.state.userId },
        });

        // Unsubscribe from the channel
        await this.channel.unsubscribe();
        this.channel = null;
      }

      // Close all peer connections
      this.state.peerConnections.forEach((peer) => {
        peer.peerConnection.close();
      });
      this.state.peerConnections.clear();

      // Stop local stream
      if (this.state.localStream) {
        this.state.localStream.getTracks().forEach((track) => track.stop());
        this.state.localStream = null;
      }

      this.state.roomId = null;
    }
  }

  public async toggleAudio() {
    if (this.state.localStream) {
      const audioTracks = this.state.localStream.getAudioTracks();
      if (audioTracks.length > 0) {
        this.state.isAudioEnabled = !this.state.isAudioEnabled;
        audioTracks.forEach((track) => {
          track.enabled = this.state.isAudioEnabled;
        });
      }
    }
    return this.state.isAudioEnabled;
  }

  public async toggleVideo() {
    if (this.state.localStream) {
      const videoTracks = this.state.localStream.getVideoTracks();
      if (videoTracks.length > 0) {
        this.state.isVideoEnabled = !this.state.isVideoEnabled;
        videoTracks.forEach((track) => {
          track.enabled = this.state.isVideoEnabled;
        });
      }
    }
    return this.state.isVideoEnabled;
  }

  public async toggleScreenShare() {
    if (this.state.isScreenSharing) {
      // Stop screen sharing
      if (this.state.localStream) {
        const videoTracks = this.state.localStream.getVideoTracks();
        videoTracks.forEach((track) => track.stop());
      }

      // Reinitialize camera stream
      await this.initializeLocalStream();
      this.state.isScreenSharing = false;

      // Update all peer connections with the new stream
      this.updatePeerConnections();
    } else {
      try {
        // Start screen sharing
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true,
        });

        // Replace video track in local stream
        if (this.state.localStream) {
          const videoTracks = this.state.localStream.getVideoTracks();
          if (videoTracks.length > 0) {
            this.state.localStream.removeTrack(videoTracks[0]);
          }

          const screenVideoTrack = screenStream.getVideoTracks()[0];
          this.state.localStream.addTrack(screenVideoTrack);

          // Handle when user stops screen sharing via browser UI
          screenVideoTrack.onended = async () => {
            await this.toggleScreenShare();
          };

          this.state.isScreenSharing = true;

          // Update all peer connections with the new stream
          this.updatePeerConnections();
        }
      } catch (error) {
        console.error("Error starting screen share:", error);
      }
    }

    return this.state.isScreenSharing;
  }

  public getState() {
    return {
      isAudioEnabled: this.state.isAudioEnabled,
      isVideoEnabled: this.state.isVideoEnabled,
      isScreenSharing: this.state.isScreenSharing,
      participantCount: this.state.peerConnections.size + 1, // +1 for local user
    };
  }

  private async initializeLocalStream() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });

      this.state.localStream = stream;
      this.state.isAudioEnabled = true;
      this.state.isVideoEnabled = true;

      if (this.onLocalStreamCallback) {
        this.onLocalStreamCallback(stream);
      }

      return stream;
    } catch (error) {
      console.error("Error accessing media devices:", error);
      throw error;
    }
  }

  private async handleUserJoined(userId: string) {
    console.log(`User joined: ${userId}`);

    if (this.onParticipantJoinedCallback) {
      this.onParticipantJoinedCallback(userId);
    }

    // Create a new peer connection for this user
    const peerConnection = this.createPeerConnection(userId);

    // Add our local stream to the connection
    if (this.state.localStream) {
      const tracks = this.state.localStream.getTracks();
      for (const track of tracks) {
        try {
          if (this.state.localStream) {
            peerConnection.peerConnection.addTrack(
              track,
              this.state.localStream,
            );
          }
        } catch (error) {
          console.warn(
            `Could not add track to peer connection: ${error.message}`,
          );
        }
      }
    }

    // Create and send an offer
    try {
      const offer = await peerConnection.peerConnection.createOffer();
      await peerConnection.peerConnection.setLocalDescription(offer);

      await this.channel.send({
        type: "broadcast",
        event: "offer",
        payload: {
          sender: this.state.userId,
          target: userId,
          offer,
        },
      });
    } catch (error) {
      console.error("Error creating offer:", error);
    }
  }

  private handleUserLeft(userId: string) {
    console.log(`User left: ${userId}`);

    if (this.onParticipantLeftCallback) {
      this.onParticipantLeftCallback(userId);
    }

    // Close and remove the peer connection
    const peerConnection = this.state.peerConnections.get(userId);
    if (peerConnection) {
      peerConnection.peerConnection.close();
      this.state.peerConnections.delete(userId);
    }
  }

  private async handleOffer(
    senderId: string,
    offer: RTCSessionDescriptionInit,
  ) {
    console.log(`Received offer from: ${senderId}`);

    // Create a peer connection if it doesn't exist
    let peerConnection = this.state.peerConnections.get(senderId);
    if (!peerConnection) {
      peerConnection = this.createPeerConnection(senderId);

      // Only add tracks if this is a new peer connection
      if (this.state.localStream) {
        const tracks = this.state.localStream.getTracks();
        for (const track of tracks) {
          try {
            if (this.state.localStream) {
              peerConnection.peerConnection.addTrack(
                track,
                this.state.localStream,
              );
            }
          } catch (error) {
            console.warn(
              `Could not add track to peer connection: ${error.message}`,
            );
          }
        }
      }
    }

    // Set the remote description (the offer)
    try {
      await peerConnection.peerConnection.setRemoteDescription(
        new RTCSessionDescription(offer),
      );

      // Create and send an answer
      const answer = await peerConnection.peerConnection.createAnswer();
      await peerConnection.peerConnection.setLocalDescription(answer);

      await this.channel.send({
        type: "broadcast",
        event: "answer",
        payload: {
          sender: this.state.userId,
          target: senderId,
          answer,
        },
      });
    } catch (error) {
      console.error("Error handling offer:", error);
    }
  }

  private async handleAnswer(
    senderId: string,
    answer: RTCSessionDescriptionInit,
  ) {
    console.log(`Received answer from: ${senderId}`);

    const peerConnection = this.state.peerConnections.get(senderId);
    if (peerConnection) {
      try {
        await peerConnection.peerConnection.setRemoteDescription(
          new RTCSessionDescription(answer),
        );
      } catch (error) {
        console.error("Error handling answer:", error);
      }
    }
  }

  private async handleIceCandidate(
    senderId: string,
    candidate: RTCIceCandidateInit,
  ) {
    console.log(`Received ICE candidate from: ${senderId}`);

    const peerConnection = this.state.peerConnections.get(senderId);
    if (peerConnection) {
      try {
        await peerConnection.peerConnection.addIceCandidate(
          new RTCIceCandidate(candidate),
        );
      } catch (error) {
        console.error("Error handling ICE candidate:", error);
      }
    }
  }

  private createPeerConnection(userId: string): PeerConnection {
    console.log(`Creating peer connection for user: ${userId}`);

    const peerConnection = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
      ],
    });

    const peer: PeerConnection = {
      peerConnection,
      userId,
    };

    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
      if (event.candidate && this.channel) {
        this.channel.send({
          type: "broadcast",
          event: "ice-candidate",
          payload: {
            sender: this.state.userId,
            target: userId,
            candidate: event.candidate,
          },
        });
      }
    };

    // Handle incoming tracks
    peerConnection.ontrack = (event) => {
      console.log(`Received track from user: ${userId}`);

      if (!peer.stream) {
        peer.stream = new MediaStream();
      }

      event.streams[0].getTracks().forEach((track) => {
        if (peer.stream) {
          peer.stream.addTrack(track);
        }
      });

      if (this.onStreamAddedCallback && peer.stream) {
        this.onStreamAddedCallback(userId, peer.stream);
      }
    };

    this.state.peerConnections.set(userId, peer);
    return peer;
  }

  private updatePeerConnections() {
    if (!this.state.localStream) return;

    // For each peer connection, replace the tracks with the new ones
    this.state.peerConnections.forEach((peer) => {
      const senders = peer.peerConnection.getSenders();

      if (this.state.localStream) {
        const videoTrack = this.state.localStream.getVideoTracks()[0];
        const audioTrack = this.state.localStream.getAudioTracks()[0];

        senders.forEach((sender) => {
          try {
            if (sender.track?.kind === "video" && videoTrack) {
              sender.replaceTrack(videoTrack);
            } else if (sender.track?.kind === "audio" && audioTrack) {
              sender.replaceTrack(audioTrack);
            }
          } catch (error) {
            console.warn(`Could not replace track: ${error.message}`);
          }
        });
      }
    });
  }
}

// Create a singleton instance
let webRTCManager: WebRTCManager | null = null;

export const getWebRTCManager = () => {
  if (!webRTCManager) {
    webRTCManager = new WebRTCManager();
  }
  return webRTCManager;
};
