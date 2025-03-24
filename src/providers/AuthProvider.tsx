
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AuthContext } from "@/contexts/AuthContext";
import { useAuthService } from "@/hooks/useAuthService";
import { toast } from "sonner";
import { baseService } from "@/services/api/baseService";
import { fetchUserProfile } from "@/lib/auth-utils";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const {
    session,
    user,
    profile,
    isLoading,
    authLoading,
    setProfile,
    setSession,
    setUser,
    signUp,
    signIn,
    signOut,
    initializeAuth
  } = useAuthService();
  
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    // Set up auth state listener FIRST with better error handling
    const setupAuthListener = async () => {
      try {
        const { data: { subscription } } = await baseService.retryWithBackoff(() => 
          supabase.auth.onAuthStateChange(async (event, session) => {
            console.log("Auth state changed:", event, session);
            setSession(session);
            setUser(session?.user ?? null);
            
            if (session?.user) {
              try {
                const profileData = await fetchUserProfile(session.user.id);
                setProfile(profileData);
              } catch (error) {
                console.error("Error fetching profile:", error);
              }
            }
            
            if (event === 'SIGNED_IN') {
              toast.success("Signed in successfully", {
                description: "Welcome back!",
              });
              setAuthError(null);
            } else if (event === 'SIGNED_OUT') {
              toast.success("Signed out", {
                description: "You have been signed out.",
              });
              setProfile(null);
            } else if (event === 'PASSWORD_RECOVERY') {
              // Don't redirect or sign out on password recovery events
              console.log("Password recovery event detected");
            }
          })
        );

        // THEN check for existing session with improved error handling
        await baseService.retryWithBackoff(
          () => initializeAuth(),
          3,  // 3 retries
          500  // Start with 500ms delay
        );
        
        return () => subscription.unsubscribe();
      } catch (error) {
        console.error("Failed to initialize auth after retries:", error);
        toast.error("Authentication service unavailable", {
          description: "Please try refreshing the page or check your internet connection."
        });
        setAuthError("Authentication service unavailable. Please refresh the page.");
      }
    };

    setupAuthListener();
  }, []);

  // If there's an authentication error, show it in a more user-friendly way
  if (authError) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background/95 z-50 p-4">
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full border border-red-100">
          <div className="flex flex-col items-center text-center">
            <div className="bg-red-100 p-3 rounded-full mb-4">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-6 w-6 text-red-600" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium mb-2">Connection Issue Detected</h3>
            <p className="text-muted-foreground mb-6">
              {authError || "Could not retrieve authentication status. Please refresh the page."}
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => window.location.reload()} 
                className="bg-nihongo-blue text-white px-4 py-2 rounded hover:bg-nihongo-blue/90"
              >
                Refresh Page
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        profile,
        isLoading,
        isAuthenticated: !!session,
        isGuest: false,
        signUp,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
