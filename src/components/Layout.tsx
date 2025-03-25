
import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Navigation from "./Navigation";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import seedDataService from "@/services/seedDataService";
import { useTheme } from "@/providers/ThemeProvider";

const Layout = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const [seedingAttempted, setSeedingAttempted] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/auth");
    }
  }, [isAuthenticated, isLoading, navigate]);

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
    
    if (!isLoading && isAuthenticated) {
      initializeApp();
    }
  }, [isLoading, isAuthenticated, seedingAttempted]);

  // If still checking auth status, show loading
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <Loader2 className={`h-8 w-8 animate-spin ${theme === 'dark' ? 'text-nihongo-gold' : 'text-nihongo-blue'}`} />
        <p className="mt-2 text-muted-foreground">Loading...</p>
      </div>
    );
  }

  // If authenticated, show the app
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
