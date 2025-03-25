
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { baseService } from "@/services/api/baseService";

/**
 * Fetch a user's profile from the database with optimized query
 */
export const fetchUserProfile = async (userId: string) => {
  if (!userId) return null;
  
  try {
    // Use a faster, more direct query with the new index
    const { data, error } = await baseService.executeWithTimeout(
      () => supabase
        .from('profiles')
        .select('username')
        .eq('id', userId)
        .single(),
      2000
    );
      
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

  // Use email directly when it's provided (faster path)
  if (identifier.includes('@')) {
    const { data, error } = await baseService.executeWithTimeout(
      () => supabase.auth.signInWithPassword({
        email: identifier,
        password,
      }),
      5000,
      "Authentication service timeout"
    );
    
    if (error) throw error;
    return data;
  }
  
  // If it's a username, use a different approach
  try {
    // Check if the username exists
    const { data: profiles, error: profileError } = await baseService.executeWithTimeout(
      () => supabase
        .from('profiles')
        .select('id')
        .eq('username', identifier)
        .single(),
      2000
    );
      
    if (profileError || !profiles) {
      throw new Error("Username not found");
    }
    
    // Get the user directly from auth
    const { data: { user }, error: authError } = await supabase.auth.admin.getUserById(profiles.id);
    
    if (authError || !user || !user.email) {
      throw new Error("Please use your email to sign in instead of username");
    }
    
    // Sign in with the email we found
    const { data, error } = await supabase.auth.signInWithPassword({
      email: user.email,
      password,
    });
    
    if (error) throw error;
    return data;
  } catch (usernameError: any) {
    throw usernameError;
  }
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
