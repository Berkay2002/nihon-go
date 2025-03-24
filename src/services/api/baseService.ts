
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Base service providing the Supabase client for other services
 * with timeout handling for better error recovery
 */
export const baseService = {
  client: supabase,
  
  /**
   * Execute a query with timeout handling
   * @param queryFn Function that executes the Supabase query
   * @param timeoutMs Timeout in milliseconds
   * @param errorMessage Custom error message for timeout
   */
  async executeWithTimeout(queryFn, timeoutMs = 8000, errorMessage = "Query timeout") {
    try {
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error(errorMessage)), timeoutMs)
      );
      
      return await Promise.race([
        queryFn(),
        timeoutPromise
      ]);
    } catch (error) {
      console.error(`Error in executeWithTimeout: ${error.message}`, error);
      
      // Provide user feedback for network issues
      if (error.message.includes("timeout") || 
          error.message.includes("network") ||
          error.message.includes("fetch")) {
        toast.error("Connection issue", {
          description: "Having trouble connecting to the server. Please check your internet connection."
        });
      }
      
      throw error;
    }
  },
  
  /**
   * Retry a function with exponential backoff
   * @param fn Function to retry
   * @param maxRetries Maximum number of retries
   * @param baseDelay Base delay in milliseconds
   */
  async retryWithBackoff(fn, maxRetries = 3, baseDelay = 300) {
    let lastError;
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        console.log(`Attempt ${attempt + 1} failed, retrying...`);
        lastError = error;
        
        // Exponential backoff with jitter
        const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 200;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw lastError;
  }
};
