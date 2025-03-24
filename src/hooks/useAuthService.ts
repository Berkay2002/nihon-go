
import { useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";
import { fetchUserProfile, signInWithIdentifier, handleSignUp } from "@/lib/auth-utils";

export function useAuthService() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<{ username: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const [isGuest, setIsGuest] = useState(false);
  const navigate = useNavigate();

  // Initialize authentication session
  const initializeAuth = async () => {
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
          return { showGuestDialog: true };
        }
      }
      
      return { showGuestDialog: false };
    } catch (error) {
      console.error("Error getting session:", error);
      setIsLoading(false);
      return { showGuestDialog: false };
    } finally {
      setIsLoading(false);
    }
  };

  // Sign up with email, password, and username
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

  // Sign in with email/username and password
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

  // Sign in as guest
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

  // Sign out
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

  return {
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
  };
}
