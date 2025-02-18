
import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { createPeerConnection } from '@/utils/webrtc';

const CameraViewer = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerMuted, setSpeakerMuted] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  const toggleMute = () => setIsMuted(!isMuted);
  const toggleSpeaker = () => setSpeakerMuted(!isSpeakerMuted);

  return (
    <div className="min-h-screen bg-background p-4 flex flex-col items-center justify-center space-y-4">
      <div className="glass-panel p-6 w-full max-w-3xl fade-in">
        <div className="relative aspect-video bg-black rounded-lg overflow-hidden mb-4">
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            autoPlay
            playsInline
            muted={isMuted}
          />
          <div className="absolute top-4 right-4">
            <div className={`h-3 w-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
          </div>
        </div>
        
        <div className="flex justify-center space-x-4">
          <Button
            variant="outline"
            size="icon"
            className="rounded-full h-12 w-12"
            onClick={toggleMute}
          >
            {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          </Button>
          
          <Button
            variant="outline"
            size="icon"
            className="rounded-full h-12 w-12"
            onClick={toggleSpeaker}
          >
            {isSpeakerMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CameraViewer;
