
import lessonsService, { Lesson } from './api/lessonsService';
import unitsService, { Unit } from './api/unitsService';
import exercisesService, { Exercise } from './api/exercisesService';
import vocabularyService, { Vocabulary } from './api/vocabularyService';
import hiraganaService, { Hiragana } from './api/hiraganaService';
import grammarService, { GrammarPattern } from './api/grammarService';

// We expose the types from the individual services
export type { 
  Lesson,
  Unit,
  Exercise,
  Vocabulary,
  Hiragana,
  GrammarPattern
};

// This service acts as a facade for all content-related services
const contentService = {
  // Units
  getUnits: async (): Promise<Unit[]> => {
    try {
      console.log('Fetching all units');
      return await unitsService.getUnits();
    } catch (error) {
      console.error('Error in contentService.getUnits:', error);
      throw error;
    }
  },

  getUnit: async (unitId: string): Promise<Unit> => {
    try {
      console.log(`Fetching unit with ID: ${unitId}`);
      return await unitsService.getUnit(unitId);
    } catch (error) {
      console.error(`Error in contentService.getUnit for ${unitId}:`, error);
      throw error;
    }
  },

  // Lessons
  getLessons: async (): Promise<Lesson[]> => {
    try {
      console.log('Fetching all lessons');
      // This would fetch all lessons across all units
      // Currently unimplemented - would require a custom endpoint
      throw new Error("getLessons not implemented - use getLessonsByUnit instead");
    } catch (error) {
      console.error('Error in contentService.getLessons:', error);
      throw error;
    }
  },

  getLessonsByUnit: async (unitId: string): Promise<Lesson[]> => {
    try {
      console.log(`Fetching lessons for unit: ${unitId}`);
      return await lessonsService.getLessonsByUnit(unitId);
    } catch (error) {
      console.error(`Error in contentService.getLessonsByUnit for ${unitId}:`, error);
      // Return an empty array instead of throwing to prevent app crashes
      console.warn('Returning empty array as fallback');
      return [];
    }
  },

  getLesson: async (lessonId: string): Promise<Lesson> => {
    try {
      console.log(`Fetching lesson with ID: ${lessonId}`);
      return await lessonsService.getLesson(lessonId);
    } catch (error) {
      console.error(`Error in contentService.getLesson for ${lessonId}:`, error);
      throw error;
    }
  },

  // Exercises
  getExercisesByLesson: async (lessonId: string): Promise<Exercise[]> => {
    try {
      console.log(`Fetching exercises for lesson: ${lessonId}`);
      return await exercisesService.getExercisesByLesson(lessonId);
    } catch (error) {
      console.error(`Error in contentService.getExercisesByLesson for ${lessonId}:`, error);
      // Return an empty array instead of throwing to prevent app crashes
      console.warn('Returning empty array as fallback');
      return [];
    }
  },

  // Vocabulary
  getVocabularyByLesson: async (lessonId: string): Promise<Vocabulary[]> => {
    try {
      console.log(`Fetching vocabulary for lesson: ${lessonId}`);
      return await vocabularyService.getVocabularyByLesson(lessonId);
    } catch (error) {
      console.error(`Error in contentService.getVocabularyByLesson for ${lessonId}:`, error);
      // Return an empty array instead of throwing
      console.warn('Returning empty array as fallback');
      return [];
    }
  },

  // Hiragana
  getHiragana: async (): Promise<Hiragana[]> => {
    try {
      console.log('Fetching all hiragana');
      return await hiraganaService.getHiragana();
    } catch (error) {
      console.error('Error in contentService.getHiragana:', error);
      throw error;
    }
  },

  // Grammar
  getGrammarPatterns: async (): Promise<GrammarPattern[]> => {
    try {
      console.log('Fetching all grammar patterns');
      return await grammarService.getGrammarPatterns();
    } catch (error) {
      console.error('Error in contentService.getGrammarPatterns:', error);
      throw error;
    }
  }
};

export default contentService;
