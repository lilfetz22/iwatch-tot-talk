
import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Video, VideoOff } from 'lucide-react';
import { getLocalStream } from '@/utils/webrtc';

const CameraBroadcaster = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const startStream = async () => {
    try {
      const stream = await getLocalStream();
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsStreaming(true);
      }
    } catch (error) {
      console.error('Failed to start stream:', error);
    }
  };

  const toggleMute = () => setIsMuted(!isMuted);
  const toggleVideo = () => {
    if (videoRef.current?.srcObject) {
      setIsStreaming(!isStreaming);
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
