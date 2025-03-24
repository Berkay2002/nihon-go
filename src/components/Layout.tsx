
import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Navigation from "./Navigation";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import seedDataService from "@/services/seedDataService";
import { TimeoutError } from "./shared/TimeoutError";
import { toast } from "sonner";

const Layout = () => {
  const { isAuthenticated, isLoading, isGuest } = useAuth();
  const navigate = useNavigate();
  const [authTimeout, setAuthTimeout] = useState(false);
  const [seedingAttempted, setSeedingAttempted] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated && !isGuest) {
      navigate("/auth");
    }
  }, [isAuthenticated, isLoading, isGuest, navigate]);

  // Set a timeout for auth loading
  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null;
    
    if (isLoading) {
      timeoutId = setTimeout(() => {
        setAuthTimeout(true);
        toast.info("Authentication timeout", {
          description: "Having trouble connecting to authentication service. You can refresh or try again later.",
        });
      }, 8000); // 8 seconds timeout
    } else {
      setAuthTimeout(false);
    }
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isLoading]);

  // Run seed data when the app loads
  useEffect(() => {
    const initializeApp = async () => {
      if (seedingAttempted) return;
      
      try {
        // Check if seed data is needed and create it
        setSeedingAttempted(true);
        await seedDataService.seedInitialData();
      } catch (error) {
        console.error("Error initializing app data:", error);
      }
    };
    
    if (!isLoading && (isAuthenticated || isGuest)) {
      initializeApp();
    }
  }, [isLoading, isAuthenticated, isGuest, seedingAttempted]);

  const handleRefresh = () => {
    window.location.reload();
  };

  // If auth checking is taking too long, show timeout error
  if (authTimeout) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <TimeoutError 
          title="Authentication Timeout"
          description="We're having trouble connecting to the authentication service. Please refresh the page or try again later."
          onRefresh={handleRefresh}
        />
      </div>
    );
  }

  // If still checking auth status, show loading
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-nihongo-blue" />
        <p className="mt-2 text-muted-foreground">Loading...</p>
      </div>
    );
  }

  // If authenticated or in guest mode, show the app
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-1 pb-16">
        <Outlet />
      </main>
      <Navigation />
    </div>
  );
};

export default Layout;
