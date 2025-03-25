
import { baseService } from "./baseService";

export interface Hiragana {
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

const hiraganaService = {
  getHiragana: async (): Promise<Hiragana[]> => {
    const { data, error } = await baseService.client
      .from('hiragana')
      .select('*')
      .order('order_index');
    
    if (error) {
      console.error('Error fetching hiragana:', error);
      throw error;
    }
    
    return data || [];
  }
};

export default hiraganaService;
