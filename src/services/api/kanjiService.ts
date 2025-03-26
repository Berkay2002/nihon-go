
import { baseService } from "./baseService";

export interface Kanji {
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

const kanjiService = {
  getKanji: async (): Promise<Kanji[]> => {
    const { data, error } = await baseService.client
      .from('kanji')
      .select('*')
      .order('order_index');
    
    if (error) {
      console.error('Error fetching kanji:', error);
      throw error;
    }
    
    return data || [];
  }
};

export default kanjiService;
