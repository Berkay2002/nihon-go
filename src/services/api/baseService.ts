
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Base service providing the Supabase client for other services
 * with optimized timeout handling for better performance
 */
export const baseService = {
  client: supabase,
  
  /**
   * Execute a query with improved timeout handling
   * @param queryFn Function that executes the Supabase query
   * @param timeoutMs Timeout in milliseconds
   * @param errorMessage Custom error message for timeout
   */
  async executeWithTimeout(queryFn, timeoutMs = 3000, errorMessage = "Query timeout") {
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
   * Retry a function with optimized backoff strategy
   * @param fn Function to retry
   * @param maxRetries Maximum number of retries
   * @param baseDelay Base delay in milliseconds
   */
  async retryWithBackoff(fn, maxRetries = 2, baseDelay = 200) {
    let lastError;
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        console.log(`Attempt ${attempt + 1} failed, retrying...`, error);
        lastError = error;
        
        // Only show toast on first failure
        if (attempt === 0 && !error.message.includes("timeout")) {
          toast.info("Retrying connection...");
        }
        
        // Linear backoff with minimal delay for faster retries
        const delay = baseDelay * (attempt + 1) + Math.random() * 50;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw lastError;
  }
};
