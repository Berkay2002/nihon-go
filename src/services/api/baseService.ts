
import { supabase } from "@/integrations/supabase/client";

/**
 * Base service providing the Supabase client for other services
 */
export const baseService = {
  client: supabase,
  
  /**
   * Execute a query with improved performance
   * @param queryFn Function that executes the Supabase query
   */
  async executeWithTimeout(queryFn, timeoutMs = 30000, errorMessage = "Query timeout") {
    try {
      // Just execute the query normally
      return await queryFn();
    } catch (error) {
      console.error(`Error in executeWithTimeout: ${error.message}`, error);
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
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        // For the first attempt, just run the function without delay
        if (attempt === 0) {
          return await fn();
        }
        
        // For retries, add a small delay
        const delay = baseDelay * attempt + Math.random() * 50;
        await new Promise(resolve => setTimeout(resolve, delay));
        
        console.log(`Retry attempt ${attempt} after ${delay}ms`);
        return await fn();
      } catch (error) {
        console.log(`Attempt ${attempt} failed, ${attempt < maxRetries ? "retrying..." : "using fallback data."}`, error);
        lastError = error;
      }
    }
    
    throw lastError;
  }
};
