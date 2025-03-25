
import { baseService } from "./api/baseService";
import exercisesService, { Exercise } from "./api/exercisesService";

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
  title: string;
  description: string;
  order_index: number;
  is_locked?: boolean; // Optional to accommodate DB structure
  estimated_time: string;
  xp_reward: number;
  created_at?: string;
  updated_at?: string;
}

// Define a DB lesson type to match what comes from the database
interface DBLesson {
  id: string;
  unit_id: string;
  title: string;
  description: string;
  order_index: number;
  estimated_time: string;
  xp_reward: number;
  created_at: string;
  updated_at: string;
  is_locked?: boolean; // Maybe present in DB
}

export interface Unit {
  id: string;
  name: string;
  description: string;
  order_index: number;
  is_locked: boolean;
  created_at?: string;
  updated_at?: string;
}

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
    
    return (data || []).map(lesson => ({
      ...lesson,
      is_locked: lesson.is_locked ?? false
    }));
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
    
    return (data || []).map(lesson => ({
      ...lesson,
      is_locked: lesson.is_locked ?? false
    }));
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
    
    // Cast data to DBLesson type before adding is_locked property
    const dbLesson = data as DBLesson | null;
    return dbLesson ? {...dbLesson, is_locked: dbLesson.is_locked ?? false} : null;
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
    
    // Map to match the GrammarPattern interface
    return (data || []).map(pattern => ({
      id: pattern.id,
      lesson_id: pattern.id, // Placeholder, adjust as needed
      pattern: pattern.pattern,
      explanation: pattern.explanation,
      example: JSON.stringify(pattern.example_sentences),
      created_at: pattern.created_at,
      updated_at: pattern.updated_at
    }));
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
    
    // Map to match the GrammarPattern interface
    return (data || []).map(pattern => ({
      id: pattern.id,
      lesson_id: pattern.id, // Placeholder, adjust as needed
      pattern: pattern.pattern,
      explanation: pattern.explanation,
      example: JSON.stringify(pattern.example_sentences),
      created_at: pattern.created_at,
      updated_at: pattern.updated_at
    }));
  },

  // Add method for fetching hiragana
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

  // Add method to get exercises by lesson, using exercisesService
  getExercisesByLesson: async (lessonId: string) => {
    try {
      return await exercisesService.getExercisesByLesson(lessonId);
    } catch (error) {
      console.error(`Error in contentService.getExercisesByLesson for ${lessonId}:`, error);
      throw error;
    }
  },

  // Add method to get vocabulary by category
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

export default contentService;
