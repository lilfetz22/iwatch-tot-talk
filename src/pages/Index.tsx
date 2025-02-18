
import { Button } from "@/components/ui/button";
import { useState } from "react";
import CameraBroadcaster from "@/components/CameraBroadcaster";
import CameraViewer from "@/components/CameraViewer";

const Index = () => {
  const [mode, setMode] = useState<'select' | 'broadcast' | 'view'>('select');

  if (mode === 'broadcast') {
    return <CameraBroadcaster />;
  }

  if (mode === 'view') {
    return <CameraViewer />;
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="glass-panel p-8 max-w-md w-full space-y-6 fade-in">
        <h1 className="text-2xl font-medium text-center mb-8">Select Mode</h1>
        
        <div className="space-y-4">
          <Button 
            className="w-full py-6 text-lg"
            variant="outline"
            onClick={() => setMode('broadcast')}
          >
            Start Broadcasting (iPad)
          </Button>
          
          <Button 
            className="w-full py-6 text-lg"
            variant="outline"
            onClick={() => setMode('view')}
          >
            View Camera
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
