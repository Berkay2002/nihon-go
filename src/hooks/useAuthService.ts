
import { useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { fetchUserProfile, signInWithIdentifier, handleSignUp } from "@/lib/auth-utils";
import { baseService } from "@/services/api/baseService";

export function useAuthService() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<{ username: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
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
      }, 5000); // Reduced from 8000 to 5000ms for faster feedback

      // Use baseService with retries to get session
      const { data: { session } } = await baseService.executeWithTimeout(
        () => supabase.auth.getSession(),
        5000, // Reduced from 8000 to 5000ms
        "Authentication service timeout"
      );
      
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
      }
      
      return { success: true };
    } catch (error) {
      console.error("Error getting session:", error);
      setIsLoading(false);
      return { success: false };
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
      }, 10000); // Reduced from 15000 to 10000ms
      
      // Use retryWithBackoff for better reliability with more retries
      await baseService.retryWithBackoff(
        () => signInWithIdentifier(identifier, password),
        3, // Increased from 2 to 3 retries
        300 // Reduced from 500 to 300ms for faster initial retry
      );
      
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

  // Sign out
  const signOut = async () => {
    try {
      setAuthLoading(true);
      
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
    setProfile,
    setSession,
    setUser,
    signUp,
    signIn,
    signOut,
    initializeAuth
  };
}
