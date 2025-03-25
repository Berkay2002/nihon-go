
import { baseService } from "./baseService";

export interface Vocabulary {
  id: string;
  lesson_id: string;
  japanese: string;
  english: string;
  romaji?: string;
  hiragana?: string;
  category: string;
  difficulty: number;
  created_at?: string;
  updated_at?: string;
  example_sentence?: string | null;
}

const vocabularyService = {
  getVocabularyByLesson: async (lessonId: string): Promise<Vocabulary[]> => {
    const { data, error } = await baseService.client
      .from('vocabulary')
      .select('*')
      .eq('lesson_id', lessonId);
    
    if (error) {
      console.error(`Error fetching vocabulary for lesson ${lessonId}:`, error);
      throw error;
    }
    
    return data || [];
  },
  
  getVocabularyByCategory: async (category: string): Promise<Vocabulary[]> => {
    try {
      const { data, error } = await baseService.client
        .from('vocabulary')
        .select('*')
        .eq('category', category);
      
      if (error) {
        console.error(`Error fetching vocabulary for category ${category}:`, error);
        throw error;
      }
      
      return data || [];
    } catch (error) {
      console.error(`Error in getVocabularyByCategory for ${category}:`, error);
      return [];
    }
  }
};

export default vocabularyService;
