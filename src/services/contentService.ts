
import { baseService } from "./api/baseService";
import exercisesService, { Exercise } from "./api/exercisesService";
import unitsService from "./api/unitsService";
import lessonsService from "./api/lessonsService";
import vocabularyService from "./api/vocabularyService";
import * as grammarPatternsService from "./api/grammarPatternsService";
import hiraganaService from "./api/hiraganaService";

// Re-export all the types from the specialized services
export type { Exercise } from "./api/exercisesService";
export type { Vocabulary } from "./api/vocabularyService";
export type { Lesson } from "./api/lessonsService";
export type { Unit } from "./api/unitsService";
export type { Hiragana } from "./api/hiraganaService";

// Simple facade that delegates to the specialized services
const contentService = {
  // Units
  getUnits: unitsService.getUnits,
  getUnit: unitsService.getUnit,
  
  // Lessons
  getLessons: lessonsService.getLessons,
  getLessonsByUnit: lessonsService.getLessonsByUnit,
  getLesson: lessonsService.getLesson,

  // Vocabulary
  getVocabularyByLesson: vocabularyService.getVocabularyByLesson,
  getVocabularyByCategory: vocabularyService.getVocabularyByCategory,
  
  // Grammar Patterns
  getGrammarPatterns: grammarPatternsService.getPatternsByLevel,
  getGrammarPatternsByLesson: (lessonId: string) => {
    // Simplified implementation until we have a proper backend
    return grammarPatternsService.getPatternsByLevel("N5");
  },

  // Hiragana
  getHiragana: hiraganaService.getHiragana,

  // Exercises - already a separate service
  getExercisesByLesson: async (lessonId: string) => {
    try {
      return await exercisesService.getExercisesByLesson(lessonId);
    } catch (error) {
      console.error(`Error in contentService.getExercisesByLesson for ${lessonId}:`, error);
      throw error;
    }
  }
};

export default contentService;
