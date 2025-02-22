
import React, { useEffect, useRef, useState } from 'react';
import { getLocalStream, createPeerConnection, setupWebRTCSignaling } from '@/utils/webrtc';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const CameraBroadcaster = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const channelRef = useRef<any>(null);
  const [isStreaming, setIsStreaming] = useState(false);

  useEffect(() => {
    const channel = supabase.channel('webrtc');
    channelRef.current = channel;

    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log('Broadcaster connected to signaling channel');
        startStream(); // Automatically start streaming when component mounts
      }
    });

    return () => {
      stopStream();
      channel.unsubscribe();
    };
  }, []);

  const startStream = async () => {
    try {
      const stream = await getLocalStream();
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        const peerConnection = createPeerConnection();
        peerConnectionRef.current = peerConnection;

        stream.getTracks().forEach(track => {
          peerConnection.addTrack(track, stream);
        });

        setupWebRTCSignaling(peerConnection, channelRef.current, true);

        console.log('Creating and sending offer');
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);
        channelRef.current.send({
          type: 'broadcast',
          event: 'offer',
          payload: {
            offer: offer
          }
        });

        setIsStreaming(true);
      }
    } catch (error) {
      console.error('Failed to start stream:', error);
      toast.error('Failed to start camera stream');
    }
  };

  const stopStream = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    setIsStreaming(false);
  };

  return (
    <div className="min-h-screen bg-background p-4 flex flex-col items-center justify-center space-y-4">
      <div className="glass-panel p-6 w-full max-w-3xl fade-in">
        <div className="relative aspect-video bg-black rounded-lg overflow-hidden mb-4">
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            autoPlay
            playsInline
            muted
          />
          {!isStreaming && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <p className="text-white text-lg">Camera Off</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CameraBroadcaster;
