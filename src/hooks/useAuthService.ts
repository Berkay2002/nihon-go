
import { useState, useCallback } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { fetchUserProfile, signInWithIdentifier, handleSignUp } from "@/lib/auth-utils";
import { baseService } from "@/services/api/baseService";

// Define a custom error interface
interface AuthError {
  message: string;
  [key: string]: unknown;
}

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
      // Set a shorter timeout for authentication check
      const timeoutId = window.setTimeout(() => {
        setIsLoading(false);
        console.error("Session loading timed out");
        toast.error("Connection issue detected", {
          description: "Could not retrieve authentication status. Please refresh the page.",
        });
      }, 2500); // Reduced to 2500ms for faster feedback

      // Use direct call to get session without retries for initial load
      const { data } = await supabase.auth.getSession();
      const currentSession = data.session;
      
      // Clear the timeout since we got a response
      clearTimeout(timeoutId);
      
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      
      if (currentSession?.user) {
        try {
          const profileData = await fetchUserProfile(currentSession.user.id);
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
    } catch (error: unknown) {
      const err = error as AuthError;
      toast.error("Sign up failed", {
        description: err.message,
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
      const result = await signInWithIdentifier(identifier, password);
      
      // Clear the timeout if sign in is successful
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = null;
      
      setSession(result.session);
      setUser(result.session?.user ?? null);
      
      if (result.session?.user) {
        const profileData = await fetchUserProfile(result.session.user.id);
        setProfile(profileData);
      }
      
      // Navigate to app on success
      navigate("/app");
    } catch (error: unknown) {
      const err = error as AuthError;
      console.error("Sign in error:", err);
      
      // Only try again for network-related errors
      if (err.message.includes("network") || err.message.includes("fetch")) {
        try {
          // Single retry for network issues only
          await baseService.retryWithBackoff(
            () => signInWithIdentifier(identifier, password),
            1, // Single retry
            150 // Shorter delay
          );
          navigate("/app");
        } catch (retryError: unknown) {
          const retry = retryError as AuthError;
          console.error("Sign in retry failed:", retry);
          toast.error("Sign in failed", {
            description: retry.message || "Invalid credentials or server error",
          });
          setAuthLoading(false);
          if (timeoutId) clearTimeout(timeoutId);
          return;
        }
      } else {
        toast.error("Sign in failed", {
          description: err.message || "Invalid credentials or server error",
        });
        setAuthLoading(false);
        if (timeoutId) clearTimeout(timeoutId);
      }
    } finally {
      setAuthLoading(false);
      if (timeoutId) clearTimeout(timeoutId);
    }
  };

  // Sign out with improved reliability
  const signOut = async () => {
    try {
      setAuthLoading(true);
      
      // Normal sign out
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Reset state manually for immediate feedback
      setSession(null);
      setUser(null);
      setProfile(null);
      
      // Don't wait for auth state change, just navigate
      navigate("/auth");
    } catch (error: unknown) {
      const err = error as AuthError;
      toast.error("Sign out failed", {
        description: err.message,
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
