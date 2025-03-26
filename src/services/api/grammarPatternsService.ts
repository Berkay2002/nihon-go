
import { baseService } from "./baseService";

export interface GrammarPattern {
  id: string;
  lesson_id: string;
  pattern: string;
  explanation: string;
  example: string;
  created_at?: string;
  updated_at?: string;
}

// Define a DB grammar pattern type to match what comes from the database
interface DBGrammarPattern {
  id: string;
  pattern: string;
  explanation: string;
  example_sentences: any;
  lesson_id?: string;
  difficulty: number;
  created_at?: string;
  updated_at?: string;
}

// Helper function to map DB grammar pattern to GrammarPattern interface
const mapToGrammarPattern = (pattern: DBGrammarPattern): GrammarPattern => ({
  id: pattern.id,
  lesson_id: pattern.lesson_id || pattern.id, // Use lesson_id if available, fallback to id
  pattern: pattern.pattern,
  explanation: pattern.explanation,
  example: JSON.stringify(pattern.example_sentences),
  created_at: pattern.created_at,
  updated_at: pattern.updated_at
});

const grammarPatternsService = {
  getGrammarPatterns: async (): Promise<GrammarPattern[]> => {
    const { data, error } = await baseService.client
      .from('grammar_patterns')
      .select('*')
      .order('lesson_id');
    
    if (error) {
      console.error('Error fetching grammar patterns:', error);
      throw error;
    }
    
    // Create a simple array from the data to avoid deep type instantiation
    return (data || []).map((item: any) => {
      return mapToGrammarPattern({
        id: item.id,
        pattern: item.pattern,
        explanation: item.explanation,
        example_sentences: item.example_sentences,
        lesson_id: item.lesson_id,
        difficulty: item.difficulty,
        created_at: item.created_at,
        updated_at: item.updated_at
      });
    });
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
    
    // Create a simple array from the data to avoid deep type instantiation
    return (data || []).map((item: any) => {
      return mapToGrammarPattern({
        id: item.id,
        pattern: item.pattern,
        explanation: item.explanation,
        example_sentences: item.example_sentences,
        lesson_id: item.lesson_id,
        difficulty: item.difficulty,
        created_at: item.created_at,
        updated_at: item.updated_at
      });
    });
  }
};

export default grammarPatternsService;
