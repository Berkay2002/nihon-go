
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const seedDataService = {
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
        return;
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
        return;
      }
      
      // Get all units to seed lessons for
      const { data: units, error: unitsError } = await supabase
        .from('units')
        .select('id, name')
        .order('order_index');
      
      if (unitsError || !units || units.length === 0) {
        console.error('Error getting units:', unitsError);
        return;
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
      
      if (seededLessons && seededLessons.length > 0) {
        const introLessonId = seededLessons[0].id;
        
        // Seed vocabulary for the introduction lesson
        const vocabulary = [
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
        
        await seedDataService.seedVocabulary(introLessonId, vocabulary);
        
        // Seed exercises for the introduction lesson
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
        
        await seedDataService.seedExercises(introLessonId, exercises);
        
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
          
          await seedDataService.seedLessons(unit.id, unitLessons);
        }
        
        console.log('Initial seed data created successfully');
        return true;
      }
    } catch (error) {
      console.error('Error seeding initial lessons data:', error);
      return false;
    }
  },
  
  // Seed initial data for the app
  seedInitialData: async () => {
    try {
      // First check and seed units if needed
      await seedDataService.seedInitialUnits();
      
      // Then check and seed lessons if needed
      const lessonSeeded = await seedDataService.seedInitialLessons();
      
      if (lessonSeeded) {
        toast.success("Demo lessons loaded successfully", {
          description: "Sample content has been created for you to explore."
        });
      }
      
      return true;
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
