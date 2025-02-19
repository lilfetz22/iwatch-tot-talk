
import { Button } from "@/components/ui/button";
import { useState } from "react";
import CameraBroadcaster from "@/components/CameraBroadcaster";
import CameraViewer from "@/components/CameraViewer";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { toast } from "sonner";

const Index = () => {
  const [mode, setMode] = useState<'select' | 'broadcast' | 'view'>('select');
  const { user, userStatus, isAdmin, signOut } = useAuth();

  // Redirect to auth if not logged in
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Show message if pending or rejected
  if (userStatus === "pending") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="glass-panel p-8 max-w-md w-full space-y-6 fade-in text-center">
          <h1 className="text-2xl font-medium mb-4">Account Pending Approval</h1>
          <p className="text-muted-foreground mb-6">
            Your account is pending approval from an administrator.
          </p>
          <Button onClick={() => signOut()}>Sign Out</Button>
        </div>
      </div>
    );
  }

  if (userStatus === "rejected") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="glass-panel p-8 max-w-md w-full space-y-6 fade-in text-center">
          <h1 className="text-2xl font-medium mb-4">Access Denied</h1>
          <p className="text-muted-foreground mb-6">
            Your account access has been rejected.
          </p>
          <Button onClick={() => signOut()}>Sign Out</Button>
        </div>
      </div>
    );
  }

  if (mode === 'broadcast') {
    return (
      <>
        <div className="absolute top-4 right-4 z-10 space-x-2">
          {isAdmin && (
            <Button variant="outline" onClick={() => window.location.href = '/admin'}>
              Admin Panel
            </Button>
          )}
          <Button variant="outline" onClick={() => signOut()}>
            Sign Out
          </Button>
        </div>
        <CameraBroadcaster />
      </>
    );
  }

  if (mode === 'view') {
    return (
      <>
        <div className="absolute top-4 right-4 z-10 space-x-2">
          {isAdmin && (
            <Button variant="outline" onClick={() => window.location.href = '/admin'}>
              Admin Panel
            </Button>
          )}
          <Button variant="outline" onClick={() => signOut()}>
            Sign Out
          </Button>
        </div>
        <CameraViewer />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="absolute top-4 right-4 space-x-2">
        {isAdmin && (
          <Button variant="outline" onClick={() => window.location.href = '/admin'}>
            Admin Panel
          </Button>
        )}
        <Button variant="outline" onClick={() => signOut()}>
          Sign Out
        </Button>
      </div>
      
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
