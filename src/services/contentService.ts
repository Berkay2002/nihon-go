
import unitsService, { Unit } from "./api/unitsService";
import lessonsService, { Lesson } from "./api/lessonsService";
import vocabularyService, { Vocabulary } from "./api/vocabularyService";
import hiraganaService, { Hiragana } from "./api/hiraganaService";
import grammarService, { GrammarPattern } from "./api/grammarService";
import exercisesService, { Exercise } from "./api/exercisesService";

// Re-export interfaces
export type {
  Unit,
  Lesson,
  Vocabulary,
  Hiragana,
  GrammarPattern,
  Exercise
};

// Combine all services into a single contentService
const contentService = {
  // Units
  getUnits: unitsService.getUnits,
  
  // Lessons
  getLessonsByUnit: lessonsService.getLessonsByUnit,
  getLesson: lessonsService.getLesson,
  
  // Vocabulary
  getVocabularyByLesson: vocabularyService.getVocabularyByLesson,
  getVocabularyByCategory: vocabularyService.getVocabularyByCategory,
  
  // Hiragana
  getHiragana: hiraganaService.getHiragana,
  getHiraganaByGroup: hiraganaService.getHiraganaByGroup,
  
  // Grammar patterns
  getGrammarPatterns: grammarService.getGrammarPatterns,
  
  // Exercises
  getExercisesByLesson: exercisesService.getExercisesByLesson,
};

export default contentService;
