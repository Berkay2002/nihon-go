
import { baseService } from "./baseService";

export interface Katakana {
  id: string;
  character: string;
  romaji: string;
  stroke_order: string;
  group_name: string;
  example_word: string;
  example_word_meaning: string;
  order_index: number;
  created_at?: string;
  updated_at?: string;
}

const katakanaService = {
  getKatakana: async (): Promise<Katakana[]> => {
    const { data, error } = await baseService.client
      .from('katakana')
      .select('*')
      .order('order_index');
    
    if (error) {
      console.error('Error fetching katakana:', error);
      throw error;
    }
    
    return data || [];
  }
};

export default katakanaService;
