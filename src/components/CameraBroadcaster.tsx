
import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Video, VideoOff } from 'lucide-react';
import { getLocalStream, createPeerConnection, setupWebRTCSignaling } from '@/utils/webrtc';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const CameraBroadcaster = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const channelRef = useRef<any>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    // Create signaling channel
    const channel = supabase.channel('webrtc');
    channelRef.current = channel;

    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log('Connected to signaling channel');
      }
    });

    return () => {
      channel.unsubscribe();
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }
    };
  }, []);

  const startStream = async () => {
    try {
      const stream = await getLocalStream();
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        // Create and setup WebRTC peer connection
        const peerConnection = createPeerConnection();
        peerConnectionRef.current = peerConnection;

        // Add tracks to the peer connection
        stream.getTracks().forEach(track => {
          peerConnection.addTrack(track, stream);
        });

        // Setup signaling
        setupWebRTCSignaling(peerConnection, channelRef.current, true);

        // Create and send offer
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);
        channelRef.current.send({
          type: 'broadcast',
          event: 'offer',
          offer,
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

  const toggleMute = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (isStreaming) {
      stopStream();
    } else {
      startStream();
    }
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
        
        <div className="flex justify-center space-x-4">
          <Button
            variant="outline"
            size="icon"
            className="rounded-full h-12 w-12"
            onClick={toggleVideo}
          >
            {isStreaming ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
          </Button>
          
          <Button
            variant="outline"
            size="icon"
            className="rounded-full h-12 w-12"
            onClick={toggleMute}
          >
            {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CameraBroadcaster;
