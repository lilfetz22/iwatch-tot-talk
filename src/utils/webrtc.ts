
import { supabase } from "@/integrations/supabase/client";
import { RealtimeChannel } from "@supabase/supabase-js";

export type WebRTCState = {
  peerConnection: RTCPeerConnection | null;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
};

export const createPeerConnection = () => {
  const config = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
    ]
  };
  return new RTCPeerConnection(config);
};

export const getLocalStream = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true
    });
    return stream;
  } catch (error) {
    console.error('Error accessing media devices:', error);
    throw error;
  }
};

export const setupWebRTCSignaling = (
  peerConnection: RTCPeerConnection,
  channel: RealtimeChannel,
  isBroadcaster: boolean
) => {
  // Handle ICE candidates
  peerConnection.onicecandidate = (event) => {
    if (event.candidate) {
      channel.send({
        type: 'broadcast',
        event: 'ice_candidate',
        candidate: event.candidate,
      });
    }
  };

  // Setup signaling channel handlers
  channel.on('broadcast', { event: 'ice_candidate' }, ({ payload }) => {
    if (payload.candidate) {
      peerConnection.addIceCandidate(new RTCIceCandidate(payload.candidate));
    }
  });

  channel.on('broadcast', { event: 'offer' }, async ({ payload }) => {
    if (!isBroadcaster) {
      await peerConnection.setRemoteDescription(new RTCSessionDescription(payload.offer));
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);
      channel.send({
        type: 'broadcast',
        event: 'answer',
        answer,
      });
    }
  });

  channel.on('broadcast', { event: 'answer' }, async ({ payload }) => {
    if (isBroadcaster) {
      await peerConnection.setRemoteDescription(new RTCSessionDescription(payload.answer));
    }
  });
};
