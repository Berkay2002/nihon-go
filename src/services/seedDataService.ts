
import { supabase } from "@/integrations/supabase/client";

const seedDataService = {
  // Seed lessons data
  seedLessons: async (unitId: string, lessons: any[]) => {
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
    
    return data;
  },
  
  // Seed vocabulary data
  seedVocabulary: async (lessonId: string, vocabulary: any[]) => {
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
    
    return data;
  },
  
  // Seed exercises data
  seedExercises: async (lessonId: string, exercises: any[]) => {
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
    
    return data;
  },
  
  // Helper function to check if seed data is needed
  checkIfSeedingRequired: async () => {
    // Check if there are any lessons
    const { data: lessons, error: lessonsError } = await supabase
      .from('lessons')
      .select('id')
      .limit(1);
    
    if (lessonsError) {
      console.error('Error checking lessons:', lessonsError);
      return true; // Assume seeding is required if there's an error
    }
    
    return !lessons || lessons.length === 0;
  },
  
  // Seed initial data for the first unit
  seedInitialData: async () => {
    try {
      // Check if seeding is required
      const seedingRequired = await seedDataService.checkIfSeedingRequired();
      
      if (!seedingRequired) {
        console.log('Seeding not required, data already exists');
        return;
      }
      
      // Get the first unit
      const { data: units, error: unitsError } = await supabase
        .from('units')
        .select('id, name')
        .eq('order_index', 1)
        .limit(1);
      
      if (unitsError || !units || units.length === 0) {
        console.error('Error getting first unit:', unitsError);
        return;
      }
      
      const unitId = units[0].id;
      
      // Seed lessons for the first unit
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
        
        console.log('Initial seed data created successfully');
      }
    } catch (error) {
      console.error('Error seeding initial data:', error);
    }
  }
};

export default seedDataService;
