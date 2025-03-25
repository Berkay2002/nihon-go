import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronRight, BookOpen, Lock } from 'lucide-react';

// Mock data to match the screenshot
const UNITS_DATA = {
  'basics': {
    id: 'basics',
    title: 'Basics',
    description: 'Essential Japanese phrases',
    lessons: [
      {
        id: 'introduction',
        title: 'Introduction',
        description: 'Earn 10 XP',
        isLocked: false,
        order: 1
      },
      {
        id: 'basic-phrases',
        title: 'Basic Phrases',
        description: 'Complete previous lessons to unlock',
        isLocked: true,
        order: 2
      },
      {
        id: 'yes-and-no',
        title: 'Yes and No',
        description: 'Complete previous lessons to unlock',
        isLocked: true,
        order: 3
      },
      {
        id: 'practice',
        title: 'Practice',
        description: 'Complete previous lessons to unlock',
        isLocked: true,
        order: 4
      },
      {
        id: 'hiragana-basics',
        title: 'Hiragana Basics',
        description: 'Complete previous lessons to unlock',
        isLocked: true,
        order: 5
      }
    ]
  },
  'greetings': {
    id: 'greetings',
    title: 'Greetings',
    description: 'Common Japanese greetings',
    lessons: [
      {
        id: 'hello-goodbye',
        title: 'Hello and Goodbye',
        description: 'Earn 10 XP',
        isLocked: false,
        order: 1
      },
      {
        id: 'introductions',
        title: 'Introductions',
        description: 'Complete previous lessons to unlock',
        isLocked: true,
        order: 2
      }
    ]
  },
  'food': {
    id: 'food',
    title: 'Food',
    description: 'Japanese food vocabulary',
    lessons: [
      {
        id: 'basic-foods',
        title: 'Basic Foods',
        description: 'Earn 10 XP',
        isLocked: false,
        order: 1
      },
      {
        id: 'ordering',
        title: 'Ordering in a Restaurant',
        description: 'Complete previous lessons to unlock',
        isLocked: true,
        order: 2
      }
    ]
  }
};

// Add proper interface for unit data
interface UnitLesson {
  id: string;
  title: string;
  description: string;
  isLocked: boolean;
  order: number;
}

interface UnitData {
  id: string;
  title: string;
  description: string;
  lessons: UnitLesson[];
}

const UnitPage = () => {
  const { unitId } = useParams<{ unitId: string }>();
  const navigate = useNavigate();
  const [unit, setUnit] = useState<UnitData | null>(null);
  
  useEffect(() => {
    if (unitId && UNITS_DATA[unitId]) {
      setUnit(UNITS_DATA[unitId]);
    }
  }, [unitId]);
  
  if (!unit) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Unit not found</h1>
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
  
  const handleLessonClick = (lessonId: string) => {
    if (unit.lessons.find(l => l.id === lessonId && !l.isLocked)) {
      navigate(`/app/lesson/${lessonId}`);
    }
  };
  
  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <div className="p-4 flex items-center">
        <button 
          onClick={() => navigate('/app')}
          className="mr-4 text-slate-300 hover:text-white"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-2xl font-bold">Japanese Lessons</h1>
      </div>
      
      {/* Unit Title */}
      <div className="px-6 mt-6">
        <h2 className="text-3xl font-bold mb-2">{unit.title}</h2>
        <p className="text-slate-400">{unit.description}</p>
      </div>
      
      {/* Lessons List */}
      <div className="px-6 mt-8">
        {unit.lessons.map((lesson) => (
          <div 
            key={lesson.id}
            onClick={() => handleLessonClick(lesson.id)}
            className={`
              mb-4 p-4 rounded-xl border border-slate-700 flex items-center justify-between
              ${!lesson.isLocked ? 'cursor-pointer hover:bg-slate-800' : 'cursor-not-allowed opacity-80'}
            `}
          >
            <div className="flex items-center">
              <div className={`
                p-3 rounded-lg mr-4
                ${!lesson.isLocked ? 'bg-red-500' : 'bg-slate-700'}
              `}>
                {!lesson.isLocked ? (
                  <BookOpen size={24} className="text-white" />
                ) : (
                  <Lock size={24} className="text-slate-500" />
                )}
              </div>
              
              <div>
                <h3 className="font-medium text-lg">{lesson.title}</h3>
                <p className="text-sm text-slate-400">{lesson.description}</p>
              </div>
            </div>
            
            <ChevronRight 
              size={20} 
              className={`${!lesson.isLocked ? 'text-slate-400' : 'text-slate-700'}`} 
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default UnitPage; 