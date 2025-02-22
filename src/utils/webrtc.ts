
import { supabase } from "@/integrations/supabase/client";
import { RealtimeChannel } from "@supabase/supabase-js";

export type WebRTCState = {
  peerConnection: RTCPeerConnection | null;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
};

export const initiateCall = async (
  peerConnection: RTCPeerConnection,
  channel: RealtimeChannel
) => {
  try {
    // Create the offer
    const offer = await peerConnection.createOffer();
    // Set it as the local description
    await peerConnection.setLocalDescription(offer);
    // Send it through the signaling channel
    channel.send({
      type: 'broadcast',
      event: 'offer',
      payload: {
        offer: offer
      }
    });
  } catch (error) {
    console.error('Error creating offer:', error);
  }
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
  // Store ICE candidates until remote description is set
  const pendingCandidates: RTCIceCandidate[] = [];

  // Handle ICE candidates
  peerConnection.onicecandidate = (event) => {
    if (event.candidate) {
      channel.send({
        type: 'broadcast',
        event: 'ice_candidate',
        payload: {  // Add this wrapper
          candidate: event.candidate
        }
      });
    }
  };

  // Setup signaling channel handlers
  channel.on('broadcast', { event: 'ice_candidate' }, ({ payload }) => {
    if (payload && payload.candidate)  {
      peerConnection.addIceCandidate(new RTCIceCandidate(payload.candidate))
        .catch(err => console.error('Error adding ICE candidate:', err));
    }
  });

  channel.on('broadcast', { event: 'offer' }, async ({ payload }) => {
    try {
      if (!isBroadcaster && payload && payload.offer) {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(payload.offer));
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);
        channel.send({
          type: 'broadcast',
          event: 'answer',
          payload: {  // Add payload wrapper here too
            answer: answer
          }
        });
      }} catch (error) {
        console.error('Error handling offer:', error);
      }
  });

  channel.on('broadcast', { event: 'answer' }, async ({ payload }) => {
    try {
      if (isBroadcaster && payload && payload.answer) {
        await initiateCall(peerConnection, channel);
        await peerConnection.setRemoteDescription(new RTCSessionDescription(payload.answer));
      }
    } catch (error) {
      console.error('Error handling answer:', error);
    }
  });
};
