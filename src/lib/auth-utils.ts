
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

/**
 * Fetch a user's profile from the database with optimized query
 */
export const fetchUserProfile = async (userId: string) => {
  if (!userId) return null;
  
  try {
    // Use a more targeted query with minimal columns
    const { data, error } = await supabase
      .from('profiles')
      .select('username')
      .eq('id', userId)
      .single();
      
    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error in fetchUserProfile:', error);
    return null;
  }
};

/**
 * Sign in with either email or username - optimized for faster authentication
 */
export const signInWithIdentifier = async (identifier: string, password: string) => {
  if (!identifier || !password) {
    throw new Error("Email/username and password are required");
  }

  console.log(`Attempting to sign in with identifier: ${identifier.includes('@') ? 'email' : 'username'}`);

  // Email is always preferred and faster, try it first
  const { data, error } = await supabase.auth.signInWithPassword({
    email: identifier,
    password,
  });
  
  // If error and the identifier doesn't look like an email, try username
  if (error && !identifier.includes('@')) {
    console.log("Email sign-in failed, attempting username lookup");
    try {
      // Simplify the username lookup for faster processing
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', identifier)
        .single();
        
      if (profileError || !profiles) {
        throw new Error("Username not found");
      }
      
      // If username exists, instruct to use email
      throw new Error("Please use your email to sign in instead of username");
    } catch (usernameError: any) {
      throw usernameError;
    }
  } else if (error) {
    console.error("Authentication error:", error.message);
    throw error;
  }
  
  return data;
};

/**
 * Handle sign up process
 */
export const handleSignUp = async (email: string, password: string, username: string) => {
  if (!email || !password || !username) {
    throw new Error("Email, password and username are required");
  }
  
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
  
  toast.success("Sign up successful!", {
    description: "Please check your email to confirm your account.",
  });

  return { success: true };
};

/**
 * Reset password using email
 */
export const resetPassword = async (email: string, redirectUrl: string) => {
  if (!email) {
    throw new Error("Email is required");
  }
  
  console.log(`Resetting password with redirect URL: ${redirectUrl}`);
  
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: redirectUrl,
  });
  
  if (error) throw error;
  
  return { success: true };
};

/**
 * Update user's password
 */
export const updateUserPassword = async (newPassword: string) => {
  if (!newPassword || newPassword.length < 6) {
    throw new Error("Password must be at least 6 characters");
  }
  
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });
  
  if (error) throw error;
  
  return { success: true };
};
