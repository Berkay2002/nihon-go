
import { baseService } from "./baseService";

export interface Unit {
  id: string;
  name: string;
  description: string;
  order_index: number;
  is_locked: boolean;
  created_at?: string;
  updated_at?: string;
}

const unitsService = {
  getUnits: async (): Promise<Unit[]> => {
    const { data, error } = await baseService.client
      .from('units')
      .select('*')
      .order('order_index');
    
    if (error) {
      console.error('Error fetching units:', error);
      throw error;
    }
    
    return data || [];
  }
};

export default unitsService;
