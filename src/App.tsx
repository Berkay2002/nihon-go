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
  useEffect(() => {
    let deferredPrompt: BeforeInstallPromptEvent | null = null;
    
    const getLocalStorage = <T,>(key: string, defaultValue: T): T => {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) as T : defaultValue;
    };
    
    const metrics = {
      lessonCompletedCount: getLocalStorage<number>('lessonCompletedCount', 0),
      userVisitCount: getLocalStorage<number>('userVisitCount', 0),
      lastVisitDate: getLocalStorage<string>('lastVisitDate', ''),
      interactionScore: getLocalStorage<number>('interactionScore', 0),
      promptDismissCount: getLocalStorage<number>('promptDismissCount', 0)
    };
    
    const today = new Date().toISOString().split('T')[0];
    
    if (metrics.lastVisitDate !== today) {
      metrics.userVisitCount++;
      
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      
      if (metrics.lastVisitDate === yesterdayStr) {
        metrics.interactionScore += 5;
      }
      
      metrics.lastVisitDate = today;
      localStorage.setItem('lastVisitDate', JSON.stringify(today));
      localStorage.setItem('userVisitCount', JSON.stringify(metrics.userVisitCount));
      localStorage.setItem('interactionScore', JSON.stringify(metrics.interactionScore));
    }
    
    const promptStrategy = {
      isDismissedRecently: () => {
        const dismissedTime = localStorage.getItem('pwaInstallPromptDismissed');
        if (dismissedTime) {
          const dismissedDate = new Date(Number(dismissedTime));
          const now = new Date();
          const daysDifference = (now.getTime() - dismissedDate.getTime()) / (1000 * 3600 * 24);
          
          const waitDays = Math.min(7 * metrics.promptDismissCount, 30);
          return daysDifference < waitDays;
        }
        return false;
      },
      
      recordDismissal: () => {
        metrics.promptDismissCount++;
        localStorage.setItem('promptDismissCount', JSON.stringify(metrics.promptDismissCount));
      }
    };

    const shouldShowPrompt = () => {
      if (window.matchMedia('(display-mode: standalone)').matches) return false;
      
      if (promptStrategy.isDismissedRecently()) return false;
      
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      if (!isMobile) return false;
      
      const engagement = {
        hasCompletedLessons: metrics.lessonCompletedCount >= 2,
        isReturningUser: metrics.userVisitCount >= 3,
        isEngaged: metrics.interactionScore >= 10,
        hasStreak: metrics.lastVisitDate === today && 
                  new Date(metrics.lastVisitDate).getDate() - new Date().getDate() === 1
      };
      
      const engagementFactors = [
        engagement.hasCompletedLessons,
        engagement.isReturningUser,
        engagement.isEngaged,
        engagement.hasStreak
      ];
      
      const engagementCount = engagementFactors.filter(Boolean).length;
      
      return engagementCount >= 2;
    };

    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      
      deferredPrompt = e;
      (window as Window & { deferredPrompt?: BeforeInstallPromptEvent }).deferredPrompt = e;
      
      localStorage.setItem('installPromptAvailable', 'true');
      
      if (shouldShowPrompt()) {
        localStorage.setItem('showInstallPrompt', 'true');
      }
    };
    
    const handleLessonComplete = () => {
      metrics.lessonCompletedCount++;
      metrics.interactionScore += 3;
      
      localStorage.setItem('lessonCompletedCount', JSON.stringify(metrics.lessonCompletedCount));
      localStorage.setItem('interactionScore', JSON.stringify(metrics.interactionScore));
      
      if (deferredPrompt && shouldShowPrompt()) {
        localStorage.setItem('showInstallPrompt', 'true');
        localStorage.setItem('lastInstallPromptDate', new Date().toISOString());
      }
    };
    
    const trackInteraction = () => {
      metrics.interactionScore++;
      if (metrics.interactionScore % 5 === 0) {
        localStorage.setItem('interactionScore', JSON.stringify(metrics.interactionScore));
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('lessonCompleted', handleLessonComplete);
    window.addEventListener('click', trackInteraction);
    window.addEventListener('promptDismissed', promptStrategy.recordDismissal);
    
    const checkForLessonComplete = () => {
      if (window.location.pathname.includes('/lesson-complete/')) {
        handleLessonComplete();
      }
    };
    
    window.addEventListener('popstate', checkForLessonComplete);
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
                  <Route path="home" element={<Home />} />
                  <Route path="units" element={<Units />} />
                  <Route path="units/:unitId" element={<Units />} />
                  <Route path="lesson/:lessonId" element={<Lesson />} />
                  <Route path="exercise/:exerciseId" element={<Exercise />} />
                  <Route path="lesson-complete/:lessonId" element={<LessonComplete />} />
                  <Route path="achievements" element={<Achievements />} />
                  <Route path="characters" element={<Characters />} />
                  <Route path="characters/:id" element={<CharacterDetail />} />
                  <Route path="profile" element={<Profile />} />
                  <Route path="reviews" element={<Index />} />
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
