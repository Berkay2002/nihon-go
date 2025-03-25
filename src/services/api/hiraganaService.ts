
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
    try {
      console.log('Fetching all hiragana characters');
      const { data, error } = await baseService.client
          .from('hiragana')
          .select('*')
          .order('order_index');
      
      if (error) {
        console.error('Error fetching hiragana:', error);
        throw error;
      }
      
      console.log(`Successfully fetched ${data?.length || 0} hiragana characters`);
      return data || [];
    } catch (error) {
      console.error('Error in getHiragana:', error);
      return [];
    }
  },
  
  getHiraganaByGroup: async (groupName: string): Promise<Hiragana[]> => {
    try {
      console.log(`Fetching hiragana for group: ${groupName}`);
      const { data, error } = await baseService.client
          .from('hiragana')
          .select('*')
          .eq('group_name', groupName)
          .order('order_index');
      
      if (error) {
        console.error('Error fetching hiragana by group:', error);
        throw error;
      }
      
      console.log(`Successfully fetched ${data?.length || 0} hiragana characters for group ${groupName}`);
      return data || [];
    } catch (error) {
      console.error(`Error in getHiraganaByGroup for group ${groupName}:`, error);
      return [];
    }
  }
};

export default hiraganaService;
