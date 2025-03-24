
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
  async executeWithTimeout(queryFn, timeoutMs = 5000, errorMessage = "Query timeout") {
    try {
      // Create a promise that rejects after the timeout
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error(errorMessage)), timeoutMs)
      );
      
      // Race between the query and the timeout
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
   * Retry a function with exponential backoff and increased flexibility
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
        console.log(`Attempt ${attempt + 1} failed, retrying...`, error);
        lastError = error;
        
        // Show toast on first failure so user knows something's happening
        if (attempt === 0 && !error.message.includes("timeout")) {
          toast.info("Connection issue, retrying...");
        }
        
        // Exponential backoff with smaller delay and less jitter
        const delay = baseDelay * Math.pow(1.5, attempt) + Math.random() * 100;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw lastError;
  }
};
