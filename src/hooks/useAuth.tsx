
import { createContext, useContext, useEffect, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";

type AuthContextType = {
  session: Session | null;
  user: User | null;
  profile: { username: string } | null;
  isLoading: boolean;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signIn: (identifier: string, password: string) => Promise<void>;
  signInAsGuest: () => Promise<void>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
  isGuest: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<{ username: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);
  const navigate = useNavigate();

  // Fetch user profile data
  const fetchUserProfile = async (userId: string) => {
    if (!userId) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', userId)
        .single();
        
      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }
      
      setProfile(data);
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
    }
  };

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
          await fetchUserProfile(session.user.id);
        }
        
        if (event === 'SIGNED_IN') {
          toast("Signed in successfully", {
            description: "Welcome back!",
          });
          setIsGuest(false);
          localStorage.removeItem('guestMode');
        } else if (event === 'SIGNED_OUT') {
          toast("Signed out", {
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
        await fetchUserProfile(session.user.id);
      }
      
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, username: string) => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
          },
        },
      });

      if (error) throw error;
      
      toast("Sign up successful!", {
        description: "Please check your email to confirm your account.",
      });
      navigate("/auth");
    } catch (error: any) {
      toast("Sign up failed", {
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (identifier: string, password: string) => {
    try {
      setIsLoading(true);
      
      // Try to sign in with email
      const { data, error } = await supabase.auth.signInWithPassword({
        email: identifier,
        password,
      });
      
      // If error and the identifier doesn't look like an email, try username
      if (error && !identifier.includes('@')) {
        // First, find the user with this username
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id')
          .eq('username', identifier)
          .single();
          
        if (profiles) {
          // Then get the email for this user
          const { data: users } = await supabase.auth.admin.getUserById(profiles.id);
          
          if (users && users.user) {
            // Try to sign in with the retrieved email
            const { error: signInError } = await supabase.auth.signInWithPassword({
              email: users.user.email,
              password,
            });
            
            if (signInError) throw signInError;
          } else {
            throw new Error("User not found");
          }
        } else {
          throw new Error("Username not found");
        }
      } else if (error) {
        throw error;
      }
      
      navigate("/app");
    } catch (error: any) {
      toast("Sign in failed", {
        description: error.message,
        variant: "destructive",
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
      toast("Welcome, Guest!", {
        description: "You're exploring in guest mode. Sign up to save your progress!",
      });
      navigate("/app");
    } catch (error: any) {
      toast("Error entering guest mode", {
        description: error.message,
        variant: "destructive",
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
      toast("Sign out failed", {
        description: error.message,
        variant: "destructive",
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

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
