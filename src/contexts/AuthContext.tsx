
import { createContext } from "react";
import { Session, User } from "@supabase/supabase-js";

export type AuthContextType = {
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

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
