
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AuthContext } from "@/contexts/AuthContext";
import { useAuthService } from "@/hooks/useAuthService";
import GuestModeDialog from "@/components/auth/GuestModeDialog";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const {
    session,
    user,
    profile,
    isLoading,
    authLoading,
    isGuest,
    setIsGuest,
    setProfile,
    setSession,
    setUser,
    signUp,
    signIn,
    signInAsGuest,
    signOut,
    initializeAuth
  } = useAuthService();
  
  const [showGuestDialog, setShowGuestDialog] = useState(false);

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
    const loadInitialSession = async () => {
      const { showGuestDialog: shouldShowGuestDialog } = await initializeAuth();
      setShowGuestDialog(shouldShowGuestDialog);
    };

    loadInitialSession();
    return () => subscription.unsubscribe();
  }, []);

  // Handle continuing as guest from dialog
  const handleContinueAsGuest = () => {
    signInAsGuest();
    setShowGuestDialog(false);
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        profile,
        isLoading,
        isAuthenticated: !!session,
        isGuest,
        signUp,
        signIn,
        signInAsGuest,
        signOut,
      }}
    >
      {children}
      
      <GuestModeDialog 
        open={showGuestDialog} 
        onOpenChange={setShowGuestDialog}
        onContinueAsGuest={handleContinueAsGuest}
      />
    </AuthContext.Provider>
  );
};

// Fix missing imports at the top
import { fetchUserProfile } from "@/lib/auth-utils";
import { toast } from "@/components/ui/use-toast";
