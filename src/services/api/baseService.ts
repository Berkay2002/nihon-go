
import { supabase } from "@/integrations/supabase/client";

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
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error(errorMessage)), timeoutMs)
      );
      
      return await Promise.race([
        queryFn(),
        timeoutPromise
      ]);
    } catch (error) {
      console.error(`Error in executeWithTimeout: ${error.message}`, error);
      throw error;
    }
  }
};
