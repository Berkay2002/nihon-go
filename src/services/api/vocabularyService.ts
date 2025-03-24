
import { baseService } from "./baseService";

export interface Vocabulary {
  id: string;
  lesson_id: string | null;
  japanese: string;
  hiragana: string;
  romaji: string;
  english: string;
  example_sentence?: string | null;
  category: string;
  difficulty: number;
  created_at?: string;
  updated_at?: string;
}

const vocabularyService = {
  getVocabularyByLesson: async (lessonId: string): Promise<Vocabulary[]> => {
    const { data, error } = await baseService.client
      .from('vocabulary')
      .select('*')
      .eq('lesson_id', lessonId);
    
    if (error) {
      console.error('Error fetching vocabulary:', error);
      throw error;
    }
    
    return data || [];
  },
  
  getVocabularyByCategory: async (category: string): Promise<Vocabulary[]> => {
    const { data, error } = await baseService.client
      .from('vocabulary')
      .select('*')
      .eq('category', category);
    
    if (error) {
      console.error('Error fetching vocabulary by category:', error);
      throw error;
    }
    
    return data || [];
  }
};

export default vocabularyService;
