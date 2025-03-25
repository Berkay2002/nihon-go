import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Layout from "./components/Layout";
import Welcome from "./pages/Welcome";
import Home from "./pages/Home";
import Units from "./pages/Units";
import Lesson from "./pages/Lesson";
import Exercise from "./pages/Exercise";
import LessonComplete from './pages/LessonComplete';
import Achievements from "./pages/Achievements";
import Profile from "./pages/Profile";
import Characters from "./pages/Characters";
import CharacterDetail from "./pages/CharacterDetail";
import Auth from "./pages/Auth";
import { AuthProvider } from "./hooks/useAuth";
import { ThemeProvider } from "./components/theme/ThemeProvider";
import { useEffect } from "react";

// Define the BeforeInstallPromptEvent interface
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed', platform: string }>;
  prompt(): Promise<void>;
}

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
  }
}

const queryClient = new QueryClient();

const App = () => {
  // Set up PWA install prompt strategy
  useEffect(() => {
    // We'll store the prompt event globally to trigger it at appropriate moments
    let deferredPrompt: BeforeInstallPromptEvent | null = null;
    
    // Track user engagement metrics
    const getLocalStorage = <T,>(key: string, defaultValue: T): T => {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) as T : defaultValue;
    };
    
    // Engagement metrics
    const metrics = {
      lessonCompletedCount: getLocalStorage<number>('lessonCompletedCount', 0),
      userVisitCount: getLocalStorage<number>('userVisitCount', 0),
      lastVisitDate: getLocalStorage<string>('lastVisitDate', ''),
      interactionScore: getLocalStorage<number>('interactionScore', 0),
      promptDismissCount: getLocalStorage<number>('promptDismissCount', 0)
    };
    
    // Update visit metrics
    const today = new Date().toISOString().split('T')[0];
    
    // Track consecutive days of usage
    if (metrics.lastVisitDate !== today) {
      metrics.userVisitCount++;
      
      // Check if the last visit was yesterday
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      
      if (metrics.lastVisitDate === yesterdayStr) {
        // Consecutive day usage - add bonus to interaction score
        metrics.interactionScore += 5;
      }
      
      metrics.lastVisitDate = today;
      localStorage.setItem('lastVisitDate', JSON.stringify(today));
      localStorage.setItem('userVisitCount', JSON.stringify(metrics.userVisitCount));
      localStorage.setItem('interactionScore', JSON.stringify(metrics.interactionScore));
    }
    
    // Check if the prompt was dismissed recently
    const promptStrategy = {
      isDismissedRecently: () => {
        const dismissedTime = localStorage.getItem('pwaInstallPromptDismissed');
        if (dismissedTime) {
          const dismissedDate = new Date(Number(dismissedTime));
          const now = new Date();
          const daysDifference = (now.getTime() - dismissedDate.getTime()) / (1000 * 3600 * 24);
          
          // After multiple dismissals, wait longer before showing again
          const waitDays = Math.min(7 * metrics.promptDismissCount, 30);
          return daysDifference < waitDays;
        }
        return false;
      },
      
      // Record when user dismisses the prompt
      recordDismissal: () => {
        metrics.promptDismissCount++;
        localStorage.setItem('promptDismissCount', JSON.stringify(metrics.promptDismissCount));
      }
    };

    // More strategic approach to determine when to show the prompt
    const shouldShowPrompt = () => {
      // Don't show if already in standalone mode (installed)
      if (window.matchMedia('(display-mode: standalone)').matches) return false;
      
      // Don't show if dismissed recently
      if (promptStrategy.isDismissedRecently()) return false;
      
      // Primary targets: mobile and tablet users
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      if (!isMobile) return false;
      
      // Strategic timing based on engagement metrics
      const engagement = {
        // User has completed 2+ lessons
        hasCompletedLessons: metrics.lessonCompletedCount >= 2,
        
        // User is a returning visitor (3+ visits)
        isReturningUser: metrics.userVisitCount >= 3,
        
        // User has a significant interaction score
        isEngaged: metrics.interactionScore >= 10,
        
        // User is visiting on consecutive days
        hasStreak: metrics.lastVisitDate === today && 
                  new Date(metrics.lastVisitDate).getDate() - new Date().getDate() === 1
      };
      
      // Show if any two engagement criteria are met
      const engagementFactors = [
        engagement.hasCompletedLessons,
        engagement.isReturningUser,
        engagement.isEngaged,
        engagement.hasStreak
      ];
      
      const engagementCount = engagementFactors.filter(Boolean).length;
      
      return engagementCount >= 2;
    };

    // Handle the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      // Prevent Chrome 67+ from automatically showing the prompt
      e.preventDefault();
      
      // Store the event for later use
      deferredPrompt = e;
      (window as Window & { deferredPrompt?: BeforeInstallPromptEvent }).deferredPrompt = e;
      
      // Mark that we have a prompt available
      localStorage.setItem('installPromptAvailable', 'true');
      
      // Check if we should show the prompt immediately or wait for a better moment
      if (shouldShowPrompt()) {
        localStorage.setItem('showInstallPrompt', 'true');
      }
    };
    
    // Track lesson completions
    const handleLessonComplete = () => {
      // Increment lesson completion counter
      metrics.lessonCompletedCount++;
      metrics.interactionScore += 3;
      
      localStorage.setItem('lessonCompletedCount', JSON.stringify(metrics.lessonCompletedCount));
      localStorage.setItem('interactionScore', JSON.stringify(metrics.interactionScore));
      
      // Lesson completion is a high-engagement moment - good time to show the prompt
      if (deferredPrompt && shouldShowPrompt()) {
        // Set a flag for the install prompt component to show
        localStorage.setItem('showInstallPrompt', 'true');
        localStorage.setItem('lastInstallPromptDate', new Date().toISOString());
      }
    };
    
    // Track user interactions to identify engagement level
    const trackInteraction = () => {
      // Increment interaction score for general app usage
      metrics.interactionScore++;
      if (metrics.interactionScore % 5 === 0) {
        localStorage.setItem('interactionScore', JSON.stringify(metrics.interactionScore));
      }
    };

    // Listen for the beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    
    // Listen for custom lesson complete event
    window.addEventListener('lessonCompleted', handleLessonComplete);
    
    // Listen for user interactions (clicks) 
    window.addEventListener('click', trackInteraction);
    
    // Listen for prompt dismissal
    window.addEventListener('promptDismissed', promptStrategy.recordDismissal);
    
    // Trigger on navigation to lesson-complete page
    const checkForLessonComplete = () => {
      if (window.location.pathname.includes('/lesson-complete/')) {
        handleLessonComplete();
      }
    };
    
    // Listen for route changes
    window.addEventListener('popstate', checkForLessonComplete);
    
    // Check on initial load too
    checkForLessonComplete();

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('lessonCompleted', handleLessonComplete);
      window.removeEventListener('click', trackInteraction);
      window.removeEventListener('promptDismissed', promptStrategy.recordDismissal);
      window.removeEventListener('popstate', checkForLessonComplete);
    };
  }, []);

  return (
    <ThemeProvider>
      <TooltipProvider>
        <QueryClientProvider client={queryClient}>
          <Sonner position="top-center" />
          <BrowserRouter>
            <AuthProvider>
              <Routes>
                <Route path="/" element={<Welcome />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/app" element={<Layout />}>
                  <Route index element={<Home />} />
                  <Route path="units" element={<Units />} />
                  <Route path="units/:unitId" element={<Units />} />
                  <Route path="lesson/:lessonId" element={<Lesson />} />
                  <Route path="exercise/:exerciseId" element={<Exercise />} />
                  <Route path="lesson-complete/:lessonId" element={<LessonComplete />} />
                  <Route path="achievements" element={<Achievements />} />
                  <Route path="characters" element={<Characters />} />
                  <Route path="characters/:id" element={<CharacterDetail />} />
                  <Route path="profile" element={<Profile />} />
                </Route>
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AuthProvider>
          </BrowserRouter>
        </QueryClientProvider>
      </TooltipProvider>
    </ThemeProvider>
  );
};

export default App;