
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { baseService } from "./api/baseService";

const seedDataService = {
  // Get database status
  getDatabaseStatus: async () => {
    try {
      // Check units
      const unitsPromise = baseService.executeWithTimeout(
        () => supabase.from('units').select('id', { count: 'exact' }).limit(0),
        5000,
        "Units query timeout"
      );
      
      // Check lessons
      const lessonsPromise = baseService.executeWithTimeout(
        () => supabase.from('lessons').select('id', { count: 'exact' }).limit(0),
        5000,
        "Lessons query timeout"
      );
      
      // Check vocabulary
      const vocabularyPromise = baseService.executeWithTimeout(
        () => supabase.from('vocabulary').select('id', { count: 'exact' }).limit(0),
        5000,
        "Vocabulary query timeout"
      );
      
      // Check exercises
      const exercisesPromise = baseService.executeWithTimeout(
        () => supabase.from('exercises').select('id', { count: 'exact' }).limit(0),
        5000,
        "Exercises query timeout"
      );
      
      // Execute all queries in parallel
      const [unitsResult, lessonsResult, vocabularyResult, exercisesResult] = await Promise.all([
        unitsPromise, lessonsPromise, vocabularyPromise, exercisesPromise
      ]);
      
      // Prepare status data
      const unitsCount = unitsResult.count || 0;
      const lessonsCount = lessonsResult.count || 0;
      const vocabularyCount = vocabularyResult.count || 0;
      const exercisesCount = exercisesResult.count || 0;
      
      // Generate status message
      let message = "";
      if (unitsCount === 0) {
        message = "No units found in database. Please seed the database.";
      } else if (lessonsCount === 0) {
        message = "Units exist but no lessons found. Please seed the database.";
      } else if (vocabularyCount === 0 || exercisesCount === 0) {
        message = "Lessons exist but vocabulary or exercises are missing. Consider reseeding the database.";
      } else {
        message = "Database is properly seeded with all required data.";
      }
      
      return {
        units: { exists: unitsCount > 0, count: unitsCount },
        lessons: { exists: lessonsCount > 0, count: lessonsCount },
        vocabulary: { exists: vocabularyCount > 0, count: vocabularyCount },
        exercises: { exists: exercisesCount > 0, count: exercisesCount },
        message
      };
    } catch (error) {
      console.error('Error checking database status:', error);
      throw error;
    }
  },

  // Seed lessons data
  seedLessons: async (unitId: string, lessons: any[]) => {
    try {
      const { data, error } = await supabase
        .from('lessons')
        .insert(lessons.map(lesson => ({
          ...lesson,
          unit_id: unitId
        })))
        .select();
      
      if (error) {
        console.error('Error seeding lessons:', error);
        throw error;
      }
      
      console.log('Successfully seeded lessons:', data);
      return data;
    } catch (error) {
      console.error('Error seeding lessons:', error);
      throw error;
    }
  },
  
  // Seed vocabulary data
  seedVocabulary: async (lessonId: string, vocabulary: any[]) => {
    try {
      const { data, error } = await supabase
        .from('vocabulary')
        .insert(vocabulary.map(word => ({
          ...word,
          lesson_id: lessonId
        })))
        .select();
      
      if (error) {
        console.error('Error seeding vocabulary:', error);
        throw error;
      }
      
      console.log('Successfully seeded vocabulary:', data);
      return data;
    } catch (error) {
      console.error('Error seeding vocabulary:', error);
      throw error;
    }
  },
  
  // Seed exercises data
  seedExercises: async (lessonId: string, exercises: any[]) => {
    try {
      const { data, error } = await supabase
        .from('exercises')
        .insert(exercises.map(exercise => ({
          ...exercise,
          lesson_id: lessonId
        })))
        .select();
      
      if (error) {
        console.error('Error seeding exercises:', error);
        throw error;
      }
      
      console.log('Successfully seeded exercises:', data);
      return data;
    } catch (error) {
      console.error('Error seeding exercises:', error);
      throw error;
    }
  },
  
  // Helper function to check if seed data is needed for lesson tables
  checkIfLessonSeedingRequired: async () => {
    // Check if there are any lessons
    try {
      const { data: lessons, error: lessonsError } = await supabase
        .from('lessons')
        .select('id')
        .limit(1);
      
      if (lessonsError) {
        console.error('Error checking lessons:', lessonsError);
        return true; // Assume seeding is required if there's an error
      }
      
      return !lessons || lessons.length === 0;
    } catch (error) {
      console.error('Error checking if lesson seeding required:', error);
      return true;
    }
  },

  // Helper function to check if seed data is needed for units
  checkIfUnitSeedingRequired: async () => {
    // Check if there are any units
    try {
      const { data: units, error: unitsError } = await supabase
        .from('units')
        .select('id')
        .limit(1);
      
      if (unitsError) {
        console.error('Error checking units:', unitsError);
        return true; // Assume seeding is required if there's an error
      }
      
      return !units || units.length === 0;
    } catch (error) {
      console.error('Error checking if unit seeding required:', error);
      return true;
    }
  },
  
  // Seed initial data for units if needed
  seedInitialUnits: async () => {
    try {
      const unitSeedingRequired = await seedDataService.checkIfUnitSeedingRequired();
      
      if (!unitSeedingRequired) {
        console.log('Unit seeding not required, units already exist');
        
        // Get existing units to use for lesson seeding
        const { data: existingUnits } = await supabase
          .from('units')
          .select('id, name')
          .order('order_index');
          
        return existingUnits;
      }
      
      // Seed units
      const units = [
        {
          name: "Basics",
          description: "Essential Japanese phrases and greetings",
          order_index: 1,
          is_locked: false
        },
        {
          name: "Greetings",
          description: "Learn how to say hello and introduce yourself",
          order_index: 2,
          is_locked: false
        },
        {
          name: "Food",
          description: "Learn vocabulary for ordering food and drinks",
          order_index: 3,
          is_locked: true
        }
      ];
      
      const { data: seededUnits, error } = await supabase
        .from('units')
        .insert(units)
        .select();
      
      if (error) {
        console.error('Error seeding units:', error);
        throw error;
      }
      
      console.log('Successfully seeded units:', seededUnits);
      return seededUnits;
    } catch (error) {
      console.error('Error seeding initial units:', error);
      throw error;
    }
  },
  
  // Seed initial lessons for existing units
  seedInitialLessons: async () => {
    try {
      const lessonSeedingRequired = await seedDataService.checkIfLessonSeedingRequired();
      
      if (!lessonSeedingRequired) {
        console.log('Lesson seeding not required, lessons already exist');
        return true;
      }
      
      // Get all units to seed lessons for
      const { data: units, error: unitsError } = await supabase
        .from('units')
        .select('id, name')
        .order('order_index');
      
      if (unitsError || !units || units.length === 0) {
        console.error('Error getting units:', unitsError);
        toast.error("No units found to create lessons for");
        return false;
      }
      
      console.log('Found units for lesson seeding:', units);
      
      // Seed lessons for the "Basics" unit first
      const basicsUnit = units.find(unit => unit.name === "Basics") || units[0];
      const unitId = basicsUnit.id;
      
      // Lessons for Basics unit
      const lessons = [
        {
          title: "Introduction",
          description: "Let's learn how to introduce yourself in Japanese.",
          order_index: 1,
          estimated_time: "5 min",
          xp_reward: 10
        },
        {
          title: "Basic Phrases",
          description: "Essential everyday phrases in Japanese.",
          order_index: 2,
          estimated_time: "7 min",
          xp_reward: 15
        },
        {
          title: "Yes and No",
          description: "Learn to affirm and negate in Japanese.",
          order_index: 3,
          estimated_time: "5 min",
          xp_reward: 10
        }
      ];
      
      const seededLessons = await seedDataService.seedLessons(unitId, lessons);
      
      if (!seededLessons || seededLessons.length === 0) {
        console.error('Failed to seed lessons');
        toast.error("Failed to create lessons");
        return false;
      }
      
      console.log('Successfully seeded lessons:', seededLessons);
      
      // Seed vocabulary and exercises for each lesson
      for (const lesson of seededLessons) {
        // Different vocabulary for each lesson
        let vocabulary = [];
        
        if (lesson.title === "Introduction") {
          vocabulary = [
            {
              japanese: "こんにちは",
              hiragana: "こんにちは",
              romaji: "konnichiwa",
              english: "Hello",
              category: "Greetings",
              difficulty: 1
            },
            {
              japanese: "はじめまして",
              hiragana: "はじめまして",
              romaji: "hajimemashite",
              english: "Nice to meet you",
              category: "Greetings",
              difficulty: 2
            },
            {
              japanese: "私",
              hiragana: "わたし",
              romaji: "watashi",
              english: "I/me",
              category: "Pronouns",
              difficulty: 1
            },
            {
              japanese: "です",
              hiragana: "です",
              romaji: "desu",
              english: "am/is",
              category: "Verb",
              difficulty: 1
            }
          ];
          
          // Exercises for the Introduction lesson
          const exercises = [
            {
              type: "multiple_choice",
              question: "What does 'こんにちは' mean?",
              options: JSON.stringify(["Hello", "Goodbye", "Good morning", "Thank you"]),
              correct_answer: "Hello",
              japanese: "こんにちは",
              romaji: "konnichiwa",
              xp_reward: 5,
              order_index: 1
            },
            {
              type: "multiple_choice",
              question: "How do you say 'Nice to meet you' in Japanese?",
              options: JSON.stringify(["さようなら", "ありがとう", "はじめまして", "おはよう"]),
              correct_answer: "はじめまして",
              japanese: "はじめまして",
              romaji: "hajimemashite",
              xp_reward: 5,
              order_index: 2
            },
            {
              type: "translation",
              question: "Translate to English: 私はジョンです",
              options: JSON.stringify(["My name is John", "I am John", "Hello John", "Thank you John"]),
              correct_answer: "I am John",
              japanese: "私はジョンです",
              romaji: "watashi wa jon desu",
              xp_reward: 5,
              order_index: 3
            }
          ];
          
          await seedDataService.seedVocabulary(lesson.id, vocabulary);
          await seedDataService.seedExercises(lesson.id, exercises);
        }
        else if (lesson.title === "Basic Phrases") {
          vocabulary = [
            {
              japanese: "ありがとう",
              hiragana: "ありがとう",
              romaji: "arigatou",
              english: "Thank you",
              category: "Greetings",
              difficulty: 1
            },
            {
              japanese: "さようなら",
              hiragana: "さようなら",
              romaji: "sayounara",
              english: "Goodbye",
              category: "Greetings",
              difficulty: 1
            },
            {
              japanese: "お願いします",
              hiragana: "おねがいします",
              romaji: "onegaishimasu",
              english: "Please",
              category: "Phrases",
              difficulty: 2
            },
            {
              japanese: "すみません",
              hiragana: "すみません",
              romaji: "sumimasen",
              english: "Excuse me/I'm sorry",
              category: "Phrases",
              difficulty: 2
            }
          ];
          
          // Exercises for Basic Phrases
          const exercises = [
            {
              type: "multiple_choice",
              question: "What does 'ありがとう' mean?",
              options: JSON.stringify(["Thank you", "Sorry", "Please", "Goodbye"]),
              correct_answer: "Thank you",
              japanese: "ありがとう",
              romaji: "arigatou",
              xp_reward: 5,
              order_index: 1
            },
            {
              type: "multiple_choice",
              question: "How do you say 'Goodbye' in Japanese?",
              options: JSON.stringify(["こんにちは", "ありがとう", "さようなら", "おはよう"]),
              correct_answer: "さようなら",
              japanese: "さようなら",
              romaji: "sayounara",
              xp_reward: 5,
              order_index: 2
            },
            {
              type: "translation",
              question: "Translate to English: すみません",
              options: JSON.stringify(["Thank you", "Excuse me/I'm sorry", "Please", "You're welcome"]),
              correct_answer: "Excuse me/I'm sorry",
              japanese: "すみません",
              romaji: "sumimasen",
              xp_reward: 5,
              order_index: 3
            }
          ];
          
          await seedDataService.seedVocabulary(lesson.id, vocabulary);
          await seedDataService.seedExercises(lesson.id, exercises);
        }
        else if (lesson.title === "Yes and No") {
          vocabulary = [
            {
              japanese: "はい",
              hiragana: "はい",
              romaji: "hai",
              english: "Yes",
              category: "Basic",
              difficulty: 1
            },
            {
              japanese: "いいえ",
              hiragana: "いいえ",
              romaji: "iie",
              english: "No",
              category: "Basic",
              difficulty: 1
            },
            {
              japanese: "分かりません",
              hiragana: "わかりません",
              romaji: "wakarimasen",
              english: "I don't understand",
              category: "Phrases",
              difficulty: 2
            },
            {
              japanese: "大丈夫",
              hiragana: "だいじょうぶ",
              romaji: "daijoubu",
              english: "It's okay/I'm fine",
              category: "Phrases",
              difficulty: 2
            }
          ];
          
          // Exercises for Yes and No
          const exercises = [
            {
              type: "multiple_choice",
              question: "What does 'はい' mean?",
              options: JSON.stringify(["Yes", "No", "Maybe", "I don't know"]),
              correct_answer: "Yes",
              japanese: "はい",
              romaji: "hai",
              xp_reward: 5,
              order_index: 1
            },
            {
              type: "multiple_choice",
              question: "How do you say 'No' in Japanese?",
              options: JSON.stringify(["はい", "いいえ", "ありがとう", "すみません"]),
              correct_answer: "いいえ",
              japanese: "いいえ",
              romaji: "iie",
              xp_reward: 5,
              order_index: 2
            },
            {
              type: "translation",
              question: "Translate to English: 分かりません",
              options: JSON.stringify(["Yes, I understand", "No, thank you", "I don't understand", "It's okay"]),
              correct_answer: "I don't understand",
              japanese: "分かりません",
              romaji: "wakarimasen",
              xp_reward: 5,
              order_index: 3
            }
          ];
          
          await seedDataService.seedVocabulary(lesson.id, vocabulary);
          await seedDataService.seedExercises(lesson.id, exercises);
        }
      }
      
      // Seed some basic lessons for other units too
      for (let i = 1; i < units.length; i++) {
        const unit = units[i];
        const unitLessons = [
          {
            title: `${unit.name} Basics`,
            description: `Introduction to ${unit.name.toLowerCase()} in Japanese.`,
            order_index: 1,
            estimated_time: "5 min",
            xp_reward: 10
          },
          {
            title: `Common ${unit.name}`,
            description: `Learn common ${unit.name.toLowerCase()} in Japanese.`,
            order_index: 2,
            estimated_time: "7 min",
            xp_reward: 15
          }
        ];
        
        const otherLessons = await seedDataService.seedLessons(unit.id, unitLessons);
        
        if (otherLessons && otherLessons.length > 0) {
          // Add some basic vocabulary and exercises to these lessons too
          for (const lesson of otherLessons) {
            // Simple vocabulary for other lessons
            const sampleVocab = [
              {
                japanese: "これ",
                hiragana: "これ",
                romaji: "kore",
                english: "This",
                category: "Basic",
                difficulty: 1
              },
              {
                japanese: "それ",
                hiragana: "それ",
                romaji: "sore",
                english: "That",
                category: "Basic",
                difficulty: 1
              }
            ];
            
            // Simple exercises for other lessons
            const sampleExercises = [
              {
                type: "multiple_choice",
                question: `Sample question for ${lesson.title}`,
                options: JSON.stringify(["Option A", "Option B", "Option C", "Option D"]),
                correct_answer: "Option A",
                japanese: "サンプル",
                romaji: "sanpuru",
                xp_reward: 5,
                order_index: 1
              }
            ];
            
            await seedDataService.seedVocabulary(lesson.id, sampleVocab);
            await seedDataService.seedExercises(lesson.id, sampleExercises);
          }
        }
      }
      
      console.log('Initial seed data created successfully');
      return true;
    } catch (error) {
      console.error('Error seeding initial lessons data:', error);
      return false;
    }
  },
  
  // Seed initial data for the app
  seedInitialData: async () => {
    try {
      // First check and seed units if needed
      const units = await seedDataService.seedInitialUnits();
      
      if (!units) {
        toast.error("Failed to create basic units", {
          description: "Could not create the basic units structure."
        });
        return false;
      }
      
      // Then check and seed lessons if needed
      const lessonSeeded = await seedDataService.seedInitialLessons();
      
      if (lessonSeeded) {
        toast.success("Demo lessons loaded successfully", {
          description: "Sample content has been created for you to explore."
        });
        return true;
      } else {
        toast.error("Some lessons could not be created", {
          description: "The database may be partially seeded."
        });
        return false;
      }
    } catch (error) {
      console.error('Error seeding initial data:', error);
      toast.error("Error loading demo lessons", {
        description: "There was a problem creating sample content. Please try refreshing the page."
      });
      return false;
    }
  }
};

export default seedDataService;
