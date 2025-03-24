
import { useState, useEffect } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";
import { fetchUserProfile, signInWithIdentifier, handleSignUp } from "@/lib/auth-utils";
import { AuthContext } from "@/contexts/AuthContext";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<{ username: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const [isGuest, setIsGuest] = useState(false);
  const [showGuestDialog, setShowGuestDialog] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
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
          setIsGuest(false);
          localStorage.removeItem('guestMode');
        } else if (event === 'SIGNED_OUT') {
          toast.success("Signed out", {
            description: "You have been signed out.",
          });
          setProfile(null);
          setIsGuest(false);
          localStorage.removeItem('guestMode');
        } else if (event === 'PASSWORD_RECOVERY') {
          // Don't redirect or sign out on password recovery events
          console.log("Password recovery event detected");
        }
      }
    );

    // THEN check for existing session
    const getInitialSession = async () => {
      try {
        // Set a timeout to prevent infinite loading
        const timeoutId = window.setTimeout(() => {
          setIsLoading(false);
          console.error("Session loading timed out");
          toast.error("Connection issue detected", {
            description: "Could not retrieve authentication status. Please refresh the page.",
          });
        }, 8000); // 8 seconds timeout

        const { data: { session } } = await supabase.auth.getSession();
        
        // Clear the timeout since we got a response
        clearTimeout(timeoutId);
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          try {
            const profileData = await fetchUserProfile(session.user.id);
            setProfile(profileData);
          } catch (error) {
            console.error("Error fetching profile:", error);
          }
        } else {
          // Check if the user was previously in guest mode
          const wasInGuestMode = localStorage.getItem('guestMode') === 'true';
          if (wasInGuestMode && window.location.pathname !== '/') {
            // Instead of automatically logging in as guest, show a dialog
            setShowGuestDialog(true);
          }
        }
      } catch (error) {
        console.error("Error getting session:", error);
      } finally {
        setIsLoading(false);
      }
    };

    getInitialSession();
    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, username: string) => {
    try {
      setAuthLoading(true);
      await handleSignUp(email, password, username);
      navigate("/auth");
    } catch (error: any) {
      toast.error("Sign up failed", {
        description: error.message,
      });
    } finally {
      setAuthLoading(false);
    }
  };

  const signIn = async (identifier: string, password: string) => {
    try {
      setAuthLoading(true);
      
      // Set a timeout to prevent infinite loading
      const timeoutId = window.setTimeout(() => {
        setAuthLoading(false);
        toast.error("Sign in timed out", {
          description: "The server is taking too long to respond. Please try again later.",
        });
      }, 15000); // 15 seconds timeout
      
      await signInWithIdentifier(identifier, password);
      
      // Clear the timeout if sign in is successful
      clearTimeout(timeoutId);
      
      navigate("/app");
    } catch (error: any) {
      console.error("Sign in error:", error);
      toast.error("Sign in failed", {
        description: error.message || "Invalid credentials or server error",
      });
      setAuthLoading(false); // Make sure to set loading to false on error
    }
    // Note: We don't set loading to false on success because the auth state change will trigger a redirect
  };

  const signInAsGuest = async () => {
    try {
      setAuthLoading(true);
      setIsGuest(true);
      localStorage.setItem('guestMode', 'true');
      
      // Set up a demo profile for guest users
      setProfile({ username: "Guest" });
      
      toast.success("Welcome, Guest!", {
        description: "You're exploring in demo mode. Sign up to track your progress!",
      });
      
      // Close the dialog if it was open
      setShowGuestDialog(false);
      
      navigate("/app");
    } catch (error: any) {
      toast.error("Error entering guest mode", {
        description: error.message,
      });
      setIsGuest(false);
      localStorage.removeItem('guestMode');
    } finally {
      setAuthLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setAuthLoading(true);
      // Clear guest mode if active
      if (isGuest) {
        setIsGuest(false);
        setProfile(null);
        localStorage.removeItem('guestMode');
        navigate("/auth");
        setAuthLoading(false);
        return;
      }
      
      // Normal sign out for authenticated users
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate("/auth");
    } catch (error: any) {
      toast.error("Sign out failed", {
        description: error.message,
      });
      setAuthLoading(false);
    }
    // We don't set loading to false on successful signout as the auth state change will handle it
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        profile,
        isLoading,
        signUp,
        signIn,
        signInAsGuest,
        signOut,
        isAuthenticated: !!session,
        isGuest,
      }}
    >
      {children}
      
      {/* Guest Mode Dialog */}
      <Dialog open={showGuestDialog} onOpenChange={setShowGuestDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Continue as Guest?</DialogTitle>
            <DialogDescription>
              You were previously browsing in guest mode. Would you like to continue as a guest or sign in with an account?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button 
              variant="outline" 
              onClick={() => {
                setShowGuestDialog(false);
                navigate("/auth");
              }}
              className="sm:flex-1"
            >
              Sign In
            </Button>
            <Button 
              onClick={signInAsGuest}
              className="bg-nihongo-blue hover:bg-nihongo-blue/90 sm:flex-1"
            >
              Continue as Guest
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AuthContext.Provider>
  );
};
