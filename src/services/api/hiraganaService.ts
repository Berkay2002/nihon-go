
import { baseService } from "./baseService";

export interface Hiragana {
  id: string;
  character: string;
  romaji: string;
  stroke_order: string;
  example_word: string;
  example_word_meaning: string;
  group_name: string;
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
  },
  
  getHiraganaByGroup: async (groupName: string): Promise<Hiragana[]> => {
    const { data, error } = await baseService.client
      .from('hiragana')
      .select('*')
      .eq('group_name', groupName)
      .order('order_index');
    
    if (error) {
      console.error('Error fetching hiragana by group:', error);
      throw error;
    }
    
    return data || [];
  }
};

export default hiraganaService;
