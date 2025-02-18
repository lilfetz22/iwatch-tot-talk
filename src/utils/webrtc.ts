
export type WebRTCState = {
  peerConnection: RTCPeerConnection | null;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
};

export const createPeerConnection = () => {
  const config = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
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
