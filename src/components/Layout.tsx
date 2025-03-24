
import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Navigation from "./Navigation";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

const Layout = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const navigate = useNavigate();

  // In a real implementation, this would use Supabase auth
  // For now, we'll just simulate authentication with localStorage
  useEffect(() => {
    const checkAuth = () => {
      const user = localStorage.getItem("nihongo_user");
      if (user) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, []);

  // Mock login function - would be replaced with Supabase auth
  const handleGuestLogin = () => {
    localStorage.setItem("nihongo_user", JSON.stringify({ 
      id: "guest-" + Math.random().toString(36).substr(2, 9),
      name: "Guest User",
      email: "",
      isGuest: true,
      created_at: new Date().toISOString()
    }));
    setIsAuthenticated(true);
  };

  // If still checking auth status, show loading
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-nihongo-blue" />
        <p className="mt-2 text-muted-foreground">Loading...</p>
      </div>
    );
  }

  // If not authenticated, show login screen
  if (isAuthenticated === false) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full space-y-8 text-center">
          <div>
            <h1 className="text-3xl font-bold text-nihongo-red">NihonGo</h1>
            <p className="mt-2 text-muted-foreground">Learn Japanese, one step at a time.</p>
          </div>
          
          <div className="mt-8 space-y-4">
            <p className="text-center text-sm text-muted-foreground">
              To integrate with Supabase authentication, please connect the project to Supabase through the Lovable interface.
            </p>
            
            <Button 
              className="w-full bg-nihongo-blue hover:bg-nihongo-blue/90"
              onClick={handleGuestLogin}
            >
              Continue as Guest
            </Button>
            
            <p className="text-xs text-muted-foreground mt-4">
              By continuing, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </div>
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
