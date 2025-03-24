
import { supabase } from "@/integrations/supabase/client";

export interface Unit {
  id: string;
  name: string;
  description: string;
  order_index: number;
  is_locked: boolean;
  progress?: number;
}

export interface Lesson {
  id: string;
  unit_id: string;
  title: string;
  description: string;
  order_index: number;
  estimated_time: string;
  xp_reward: number;
  is_completed?: boolean;
}

export interface Vocabulary {
  id: string;
  lesson_id: string | null;
  japanese: string;
  hiragana: string;
  romaji: string;
  english: string;
  example_sentence: string | null;
  category: string;
  difficulty: number;
}

export interface Hiragana {
  id: string;
  character: string;
  romaji: string;
  stroke_order: string;
  example_word: string;
  example_word_meaning: string;
  group_name: string;
  order_index: number;
}

export interface Exercise {
  id: string;
  lesson_id: string;
  type: string;
  question: string;
  options: any;
  correct_answer: string;
  japanese: string | null;
  romaji: string | null;
  xp_reward: number;
  order_index: number;
}

export interface GrammarPattern {
  id: string;
  pattern: string;
  explanation: string;
  example_sentences: any;
  difficulty: number;
}

const contentService = {
  // Units
  getUnits: async (): Promise<Unit[]> => {
    const { data, error } = await supabase
      .from('units')
      .select('*')
      .order('order_index');
    
    if (error) {
      console.error('Error fetching units:', error);
      throw error;
    }
    
    return data || [];
  },
  
  // Lessons
  getLessonsByUnit: async (unitId: string): Promise<Lesson[]> => {
    const { data, error } = await supabase
      .from('lessons')
      .select('*')
      .eq('unit_id', unitId)
      .order('order_index');
    
    if (error) {
      console.error('Error fetching lessons:', error);
      throw error;
    }
    
    return data || [];
  },
  
  getLesson: async (lessonId: string): Promise<Lesson> => {
    const { data, error } = await supabase
      .from('lessons')
      .select('*')
      .eq('id', lessonId)
      .maybeSingle();
    
    if (error) {
      console.error('Error fetching lesson:', error);
      throw error;
    }
    
    if (!data) {
      throw new Error('Lesson not found');
    }
    
    return data;
  },
  
  // Vocabulary
  getVocabularyByLesson: async (lessonId: string): Promise<Vocabulary[]> => {
    const { data, error } = await supabase
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
    const { data, error } = await supabase
      .from('vocabulary')
      .select('*')
      .eq('category', category);
    
    if (error) {
      console.error('Error fetching vocabulary by category:', error);
      throw error;
    }
    
    return data || [];
  },
  
  // Hiragana
  getHiragana: async (): Promise<Hiragana[]> => {
    const { data, error } = await supabase
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
    const { data, error } = await supabase
      .from('hiragana')
      .select('*')
      .eq('group_name', groupName)
      .order('order_index');
    
    if (error) {
      console.error('Error fetching hiragana by group:', error);
      throw error;
    }
    
    return data || [];
  },
  
  // Grammar patterns
  getGrammarPatterns: async (): Promise<GrammarPattern[]> => {
    const { data, error } = await supabase
      .from('grammar_patterns')
      .select('*')
      .order('difficulty');
    
    if (error) {
      console.error('Error fetching grammar patterns:', error);
      throw error;
    }
    
    return data || [];
  },
  
  // Exercises
  getExercisesByLesson: async (lessonId: string): Promise<Exercise[]> => {
    const { data, error } = await supabase
      .from('exercises')
      .select('*')
      .eq('lesson_id', lessonId)
      .order('order_index');
    
    if (error) {
      console.error('Error fetching exercises:', error);
      throw error;
    }
    
    return data || [];
  },
};

export default contentService;
