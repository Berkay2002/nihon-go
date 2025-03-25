import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { HeartIcon, XIcon, CheckIcon, Heart } from 'lucide-react';

// Types for our lesson content
interface Option {
  id: string;
  text: string;
  imageUrl?: string;
  isCorrect: boolean;
}

interface Question {
  id: string;
  text: string;
  options: Option[];
  type: 'text' | 'image';
}

interface Lesson {
  id: string;
  title: string;
  unitId: string;
  questions: Question[];
}

// Mock lesson data
const MOCK_LESSONS: Record<string, Lesson> = {
  'basics': {
    id: 'basics',
    title: 'Basics',
    unitId: 'basics',
    questions: [
      {
        id: 'q1',
        text: 'What is "おはよう" in English?',
        type: 'text',
        options: [
          { id: 'a', text: 'Good morning', imageUrl: '/images/morning.jpg', isCorrect: true },
          { id: 'b', text: 'Good night', imageUrl: '/images/night.jpg', isCorrect: false },
          { id: 'c', text: 'Hello', imageUrl: '/images/hello.jpg', isCorrect: false },
          { id: 'd', text: 'Goodbye', imageUrl: '/images/goodbye.jpg', isCorrect: false },
        ]
      },
      {
        id: 'q2',
        text: 'Choose the correct translation for "こんにちは"',
        type: 'text',
        options: [
          { id: 'a', text: 'Good evening', imageUrl: '/images/evening.jpg', isCorrect: false },
          { id: 'b', text: 'Hello', imageUrl: '/images/hello.jpg', isCorrect: true },
          { id: 'c', text: 'Thank you', imageUrl: '/images/thanks.jpg', isCorrect: false },
          { id: 'd', text: 'Sorry', imageUrl: '/images/sorry.jpg', isCorrect: false },
        ]
      },
      {
        id: 'q3',
        text: 'How do you say "goodbye" in Japanese?',
        type: 'text',
        options: [
          { id: 'a', text: 'こんにちは', imageUrl: '/images/hello.jpg', isCorrect: false },
          { id: 'b', text: 'ありがとう', imageUrl: '/images/thanks.jpg', isCorrect: false },
          { id: 'c', text: 'さようなら', imageUrl: '/images/goodbye.jpg', isCorrect: true },
          { id: 'd', text: 'おやすみ', imageUrl: '/images/goodnight.jpg', isCorrect: false },
        ]
      }
    ]
  },
  'greetings': {
    id: 'greetings',
    title: 'Greetings',
    unitId: 'greetings',
    questions: [
      {
        id: 'q1',
        text: 'What does "はじめまして" mean?',
        type: 'text',
        options: [
          { id: 'a', text: 'Nice to meet you', imageUrl: '/images/meet.jpg', isCorrect: true },
          { id: 'b', text: 'How are you?', imageUrl: '/images/howareyou.jpg', isCorrect: false },
          { id: 'c', text: 'Thank you', imageUrl: '/images/thanks.jpg', isCorrect: false },
          { id: 'd', text: 'I\'m sorry', imageUrl: '/images/sorry.jpg', isCorrect: false },
        ]
      },
      {
        id: 'q2',
        text: 'How do you respond to "お元気ですか?"',
        type: 'text',
        options: [
          { id: 'a', text: 'はい、元気です', imageUrl: '/images/yes.jpg', isCorrect: true },
          { id: 'b', text: 'さようなら', imageUrl: '/images/goodbye.jpg', isCorrect: false },
          { id: 'c', text: 'ありがとう', imageUrl: '/images/thanks.jpg', isCorrect: false },
          { id: 'd', text: 'おはよう', imageUrl: '/images/morning.jpg', isCorrect: false },
        ]
      }
    ]
  }
};

export default function LessonPage() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();
  
  const [hearts, setHearts] = useState(3);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<Option | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [progress, setProgress] = useState(0);
  
  // Use the lesson ID to find the corresponding unit and lesson
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  
  // Add a computed currentQuestion to avoid errors
  const currentQuestion = questions.length > 0 ? questions[currentQuestionIndex] : null;
  
  useEffect(() => {
    // Find lesson in our mock data based on lessonId
    for (const unitId in MOCK_LESSONS) {
      if (MOCK_LESSONS[unitId].questions.some(lesson => lesson.id === lessonId)) {
        setCurrentLesson(MOCK_LESSONS[unitId]);
        setQuestions(MOCK_LESSONS[unitId].questions);
        break;
      }
    }
  }, [lessonId]);
  
  useEffect(() => {
    // Calculate progress
    if (questions.length > 0) {
      const newProgress = ((currentQuestionIndex) / questions.length) * 100;
      setProgress(newProgress);
    }
  }, [currentQuestionIndex, questions.length]);
  
  // Return to home if lesson not found
  if (!currentLesson || !questions.length || !currentQuestion) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Lesson not found</h1>
          <button 
            onClick={() => navigate('/app')}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }
  
  const handleSelectOption = (option: Option) => {
    setSelectedOption(option);
  };
  
  const handleCheckAnswer = () => {
    if (!selectedOption) return;
    
    const correct = selectedOption.isCorrect;
    setIsCorrect(correct);
    
    if (!correct) {
      setHearts(prev => prev - 1);
    }
  };
  
  const handleContinue = () => {
    // Reset selection
    setSelectedOption(null);
    setIsCorrect(null);
    
    // If player has no hearts left, navigate to home
    if (hearts <= 0) {
      navigate('/app');
      return;
    }
    
    // If there are more questions, go to the next one
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      // Lesson complete
      navigate(`/app/lesson-complete/${lessonId}`);
    }
  };
  
  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col">
      {/* Navigation bar */}
      <div className="p-4 flex justify-between items-center border-b border-slate-700">
        <button 
          onClick={() => navigate('/app')}
          className="text-slate-300 hover:text-white"
        >
          <XIcon size={24} />
        </button>
        <div className="flex gap-2">
          {[...Array(hearts)].map((_, i) => (
            <Heart key={i} size={24} fill="#ff4747" color="#ff4747" />
          ))}
          {[...Array(3 - hearts)].map((_, i) => (
            <Heart key={`empty-${i}`} size={24} className="text-slate-600" />
          ))}
        </div>
        <div className="w-6"></div> {/* Empty space for balance */}
      </div>
      
      {/* Progress bar */}
      <div className="w-full bg-slate-700 h-2">
        <div 
          className="bg-green-500 h-full transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      
      {/* Question */}
      <div className="flex-1 flex flex-col p-6">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-center">{currentQuestion?.text}</h2>
        </div>
        
        {/* Options */}
        <div className="grid grid-cols-2 gap-4">
          {currentQuestion?.options.map((option) => (
            <button
              key={option.id}
              className={`
                p-4 rounded-xl border-2 flex flex-col items-center justify-center
                ${selectedOption?.id === option.id 
                  ? 'border-blue-500 bg-blue-500/20' 
                  : 'border-slate-600 hover:border-slate-400'
                }
                ${isCorrect !== null && option.isCorrect ? 'border-green-500 bg-green-500/20' : ''}
                ${isCorrect === false && selectedOption?.id === option.id ? 'border-red-500 bg-red-500/20' : ''}
                transition-all
              `}
              onClick={() => handleSelectOption(option)}
              disabled={isCorrect !== null}
            >
              {option.imageUrl && (
                <div className="mb-2 w-full h-24 rounded-lg overflow-hidden bg-slate-700 flex items-center justify-center">
                  <img 
                    src={option.imageUrl} 
                    alt={option.text}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback for missing images
                      e.currentTarget.src = 'https://placehold.co/100x100/667/fff?text=Image';
                    }}
                  />
                </div>
              )}
              <span className="text-center font-medium">{option.text}</span>
            </button>
          ))}
        </div>
      </div>
      
      {/* Bottom action area */}
      <div className="p-4 border-t border-slate-700">
        {isCorrect === null ? (
          <button 
            onClick={handleCheckAnswer}
            disabled={!selectedOption}
            className={`
              w-full py-3 rounded-lg font-bold text-white
              ${selectedOption ? 'bg-green-500 hover:bg-green-600' : 'bg-slate-700 cursor-not-allowed'}
              transition-colors
            `}
          >
            Check
          </button>
        ) : (
          <button 
            onClick={handleContinue}
            className="w-full py-3 rounded-lg font-bold text-white bg-blue-500 hover:bg-blue-600 transition-colors"
          >
            Continue
          </button>
        )}
      </div>
    </div>
  );
} 