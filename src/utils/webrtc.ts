
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
  let iceCandidatesQueue: RTCIceCandidate[] = [];
  let hasRemoteDescription = false;

  const processIceCandidateQueue = () => {
    while (iceCandidatesQueue.length > 0 && hasRemoteDescription) {
      const candidate = iceCandidatesQueue.shift();
      if (candidate) {
        peerConnection.addIceCandidate(candidate)
          .catch(err => console.error('Error adding queued ICE candidate:', err));
      }
    }
  };

  peerConnection.onicecandidate = (event) => {
    if (event.candidate) {
      console.log('Sending ICE candidate:', event.candidate);
      channel.send({
        type: 'broadcast',
        event: 'ice_candidate',
        payload: {
          candidate: event.candidate
        }
      });
    }
  };

  peerConnection.oniceconnectionstatechange = () => {
    console.log('ICE Connection State:', peerConnection.iceConnectionState);
  };

  channel.on('broadcast', { event: 'ice_candidate' }, ({ payload }) => {
    console.log('Received ICE candidate');
    if (payload?.candidate) {
      const candidate = new RTCIceCandidate(payload.candidate);
      if (hasRemoteDescription) {
        peerConnection.addIceCandidate(candidate)
          .catch(err => console.error('Error adding ICE candidate:', err));
      } else {
        console.log('Queueing ICE candidate');
        iceCandidatesQueue.push(candidate);
      }
    }
  });

  channel.on('broadcast', { event: 'offer' }, async ({ payload }) => {
    if (!isBroadcaster && payload?.offer) {
      console.log('Received offer, setting remote description');
      try {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(payload.offer));
        hasRemoteDescription = true;
        
        console.log('Creating answer');
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);
        
        channel.send({
          type: 'broadcast',
          event: 'answer',
          payload: {
            answer: answer
          }
        });

        processIceCandidateQueue();
      } catch (error) {
        console.error('Error handling offer:', error);
      }
    }
  });

  channel.on('broadcast', { event: 'answer' }, async ({ payload }) => {
    if (isBroadcaster && payload?.answer) {
      console.log('Received answer, setting remote description');
      try {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(payload.answer));
        hasRemoteDescription = true;
        processIceCandidateQueue();
      } catch (error) {
        console.error('Error handling answer:', error);
      }
    }
  });
};
