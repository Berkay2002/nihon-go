import { useState, useCallback } from "react";
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

  // Initialize authentication session with improved performance
  const initializeAuth = useCallback(async () => {
    try {
      // Set a longer timeout for authentication check (increased from 2500ms to 8000ms)
      const timeoutId = window.setTimeout(() => {
        setIsLoading(false);
        console.log("Session loading completed by timeout");
      }, 8000);

      // Use direct call to get session without retries for initial load
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
      }
      
      return { success: true };
    } catch (error) {
      console.error("Error getting session:", error);
      setIsLoading(false);
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  }, []);

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

  // Sign in with email/username and password - optimized for performance
  const signIn = async (identifier: string, password: string) => {
    let timeoutId: number | null = null;
    
    try {
      setAuthLoading(true);
      
      // Set a timeout to prevent infinite loading
      timeoutId = window.setTimeout(() => {
        setAuthLoading(false);
        toast.error("Sign in timed out", {
          description: "The server is taking too long to respond. Please try again later.",
        });
      }, 4000); // Reduced to 4000ms
      
      // Try to sign in directly without retries first (faster path)
      await signInWithIdentifier(identifier, password);
      
      // Clear the timeout if sign in is successful
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = null;
      
      // Don't navigate here - AuthProvider will handle this via listener
    } catch (error: any) {
      console.error("Sign in error:", error);
      
      // Only try again for network-related errors
      if (error.message.includes("network") || error.message.includes("fetch")) {
        try {
          // Single retry for network issues only
          await baseService.retryWithBackoff(
            () => signInWithIdentifier(identifier, password),
            1, // Single retry
            150 // Shorter delay
          );
        } catch (retryError: any) {
          console.error("Sign in retry failed:", retryError);
          toast.error("Sign in failed", {
            description: retryError.message || "Invalid credentials or server error",
          });
          setAuthLoading(false);
          return;
        }
      } else {
        toast.error("Sign in failed", {
          description: error.message || "Invalid credentials or server error",
        });
        setAuthLoading(false);
      }
    }
    
    // Navigate to app on success - this will only execute if there was no error
    navigate("/app");
  };

  // Sign out with improved reliability
  const signOut = async () => {
    try {
      setAuthLoading(true);
      
      // Normal sign out
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Don't wait for auth state change, just navigate
      navigate("/auth");
      
      // Reset state manually for immediate feedback
      setSession(null);
      setUser(null);
      setProfile(null);
    } catch (error: any) {
      toast.error("Sign out failed", {
        description: error.message,
      });
    } finally {
      setAuthLoading(false);
    }
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
