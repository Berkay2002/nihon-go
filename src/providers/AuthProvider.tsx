
import { useState, useEffect } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";
import { fetchUserProfile, signInWithIdentifier, handleSignUp } from "@/lib/auth-utils";
import { AuthContext } from "@/contexts/AuthContext";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<{ username: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const [isGuest, setIsGuest] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for guest mode in localStorage
    const guestMode = localStorage.getItem('guestMode') === 'true';
    setIsGuest(guestMode);

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
        }
      }
    );

    // THEN check for existing session
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
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
      await signInWithIdentifier(identifier, password);
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
      toast.success("Welcome, Guest!", {
        description: "You're exploring in guest mode. Sign up to save your progress!",
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

  const signOut = async () => {
    try {
      setAuthLoading(true);
      // Clear guest mode if active
      if (isGuest) {
        setIsGuest(false);
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
    </AuthContext.Provider>
  );
};
