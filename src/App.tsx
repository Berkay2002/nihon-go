import { Toaster } from "@/components/ui/toaster";
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
import Auth from "./pages/Auth";
import { AuthProvider } from "./hooks/useAuth";
import { ThemeProvider } from "./components/theme/ThemeProvider";
import { InstallPrompt } from "./components/install-prompt";

const queryClient = new QueryClient();
const App = () => (
  <ThemeProvider>
    <TooltipProvider>
      <QueryClientProvider client={queryClient}>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <InstallPrompt />
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

export default App;
