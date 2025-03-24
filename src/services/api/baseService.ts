
import { supabase } from "@/integrations/supabase/client";

/**
 * Base service providing the Supabase client for other services
 */
export const baseService = {
  client: supabase
};
