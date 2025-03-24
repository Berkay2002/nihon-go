
import { baseService } from "./baseService";

export interface GrammarPattern {
  id: string;
  pattern: string;
  explanation: string;
  example_sentences: any;
  difficulty: number;
  created_at?: string;
  updated_at?: string;
}

const grammarService = {
  getGrammarPatterns: async (): Promise<GrammarPattern[]> => {
    const { data, error } = await baseService.client
      .from('grammar_patterns')
      .select('*')
      .order('difficulty');
    
    if (error) {
      console.error('Error fetching grammar patterns:', error);
      throw error;
    }
    
    return data || [];
  }
};

export default grammarService;
