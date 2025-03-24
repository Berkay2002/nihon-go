
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

/**
 * Fetch a user's profile from the database
 */
export const fetchUserProfile = async (userId: string) => {
  if (!userId) return null;
  
  try {
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
 * Sign in with either email or username
 */
export const signInWithIdentifier = async (identifier: string, password: string) => {
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
  
  return data;
};

/**
 * Handle sign up process
 */
export const handleSignUp = async (email: string, password: string, username: string) => {
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
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });
  
  if (error) throw error;
  
  return { success: true };
};
