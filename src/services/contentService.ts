import { baseService } from "./api/baseService";

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
}

export interface GrammarPattern {
  id: string;
  lesson_id: string;
  pattern: string;
  explanation: string;
  example: string;
  created_at?: string;
  updated_at?: string;
}

export interface Lesson {
  id: string;
  unit_id: string;
  name: string;
  description: string;
  order_index: number;
  is_locked: boolean;
  created_at?: string;
  updated_at?: string;
}

const contentService = {
  getUnits: async () => {
    const { data, error } = await baseService.client
      .from('units')
      .select('*')
      .order('order_index');
    
    if (error) {
      console.error('Error fetching units:', error);
      throw error;
    }
    
    return data || [];
  },
  
  getUnit: async (unitId: string) => {
    const { data, error } = await baseService.client
      .from('units')
      .select('*')
      .eq('id', unitId)
      .maybeSingle();
    
    if (error) {
      console.error(`Error fetching unit ${unitId}:`, error);
      throw error;
    }
    
    if (!data) {
      throw new Error(`Unit with ID ${unitId} not found`);
    }
    
    return data;
  },
  
  getLessons: async () => {
    const { data, error } = await baseService.client
      .from('lessons')
      .select('*')
      .order('order_index');
    
    if (error) {
      console.error('Error fetching lessons:', error);
      throw error;
    }
    
    return data || [];
  },
  
  getLessonsByUnit: async (unitId: string) => {
    const { data, error } = await baseService.client
      .from('lessons')
      .select('*')
      .eq('unit_id', unitId)
      .order('order_index');
    
    if (error) {
      console.error(`Error fetching lessons for unit ${unitId}:`, error);
      throw error;
    }
    
    return data || [];
  },
  
  getLesson: async (lessonId: string) => {
     const { data, error } = await baseService.client
      .from('lessons')
      .select('*')
      .eq('id', lessonId)
      .maybeSingle();
    
    if (error) {
      console.error(`Error fetching lesson ${lessonId}:`, error);
      throw error;
    }
    
    return data;
  },

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
  
  getGrammarPatterns: async (): Promise<GrammarPattern[]> => {
    const { data, error } = await baseService.client
      .from('grammar_patterns')
      .select('*')
      .order('lesson_id');
    
    if (error) {
      console.error('Error fetching grammar patterns:', error);
      throw error;
    }
    
    return data || [];
  },

  getGrammarPatternsByLesson: async (lessonId: string): Promise<GrammarPattern[]> => {
    const { data, error } = await baseService.client
      .from('grammar_patterns')
      .select('*')
      .eq('lesson_id', lessonId);
    
    if (error) {
      console.error(`Error fetching grammar patterns for lesson ${lessonId}:`, error);
      throw error;
    }
    
    return data || [];
  }
};

// Add the following export or implementation to the contentService file
export const getVocabularyByCategory = async (category: string) => {
  console.log(`Getting vocabulary by category: ${category}`);
  // Implement or fix this method based on your API structure
  return [];
};

// Add this to the default export
contentService.getVocabularyByCategory = getVocabularyByCategory;

export default contentService;
