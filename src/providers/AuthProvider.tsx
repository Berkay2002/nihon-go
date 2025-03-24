
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
          const profileData = await fetchUserProfile(session.user.id);
          setProfile(profileData);
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
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        const profileData = await fetchUserProfile(session.user.id);
        setProfile(profileData);
      }
      
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, username: string) => {
    try {
      setIsLoading(true);
      await handleSignUp(email, password, username);
      navigate("/auth");
    } catch (error: any) {
      toast.error("Sign up failed", {
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (identifier: string, password: string) => {
    try {
      setIsLoading(true);
      await signInWithIdentifier(identifier, password);
      navigate("/app");
    } catch (error: any) {
      toast.error("Sign in failed", {
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const signInAsGuest = async () => {
    try {
      setIsLoading(true);
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
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      // Clear guest mode if active
      if (isGuest) {
        setIsGuest(false);
        localStorage.removeItem('guestMode');
        navigate("/auth");
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
    } finally {
      setIsLoading(false);
    }
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
