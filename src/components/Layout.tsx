
import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Navigation from "./Navigation";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const Layout = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/auth");
    }
  }, [isAuthenticated, isLoading, navigate]);

  // If still checking auth status, show loading
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-nihongo-blue" />
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
