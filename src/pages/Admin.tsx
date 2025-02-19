
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface Profile {
  id: string;
  email: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
}

const Admin = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAdmin) {
      navigate("/");
      return;
    }
    fetchProfiles();
  }, [isAdmin, navigate]);

  const fetchProfiles = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Error fetching profiles");
      return;
    }

    setProfiles(data);
  };

  const updateStatus = async (userId: string, status: "approved" | "rejected") => {
    const { error } = await supabase
      .from("profiles")
      .update({ status })
      .eq("id", userId);

    if (error) {
      toast.error("Error updating user status");
      return;
    }

    toast.success(`User ${status} successfully`);
    fetchProfiles();
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-medium">User Management</h1>
          <Button 
            variant="outline"
            onClick={() => navigate("/")}
          >
            Back to Home
          </Button>
        </div>
        
        <div className="space-y-4">
          {profiles.map((profile) => (
            <div
              key={profile.id}
              className="glass-panel p-4 flex items-center justify-between"
            >
              <div>
                <p className="font-medium">{profile.email}</p>
                <p className="text-sm text-muted-foreground">
                  Status: {profile.status}
                </p>
                <p className="text-sm text-muted-foreground">
                  Joined: {new Date(profile.created_at).toLocaleDateString()}
                </p>
              </div>
              
              {profile.status === "pending" && (
                <div className="space-x-2">
                  <Button
                    variant="default"
                    onClick={() => updateStatus(profile.id, "approved")}
                  >
                    Approve
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => updateStatus(profile.id, "rejected")}
                  >
                    Reject
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Admin;
