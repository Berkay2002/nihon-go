
import React, { useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
} from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from "@/lib/theme-provider"
import { Toaster } from 'sonner';

// Import pages
import Index from './pages/Index';
import Auth from './pages/Auth';
import Welcome from './pages/Welcome';
import Home from './pages/Home';
import LessonPage from './pages/LessonPage';
import Exercise from './pages/Exercise';
import LessonComplete from './pages/LessonComplete';
import Units from './pages/Units';
import UnitPage from './pages/UnitPage';
import Achievements from './pages/Achievements';
import Characters from './pages/Characters';
import CharacterDetail from './pages/CharacterDetail';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';
import Reviews from './pages/Reviews';
import Practice from './pages/Practice';

// Import components
import Layout from './components/Layout';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { ReviewSessionContainer } from './components/review';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false
    }
  }
});

// Protected route component
const ProtectedRoutes = () => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-900">
        <div className="animate-pulse text-center">
          <div className="mb-4 h-12 w-12 mx-auto rounded-full border-4 border-t-transparent border-white animate-spin"></div>
          <p className="text-white">Loading...</p>
        </div>
      </div>
    );
  }

  return user ? <Outlet /> : <Navigate to="/auth" />;
};

const App = () => {
  return (
    <Router>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="dark">
          <AuthProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/welcome" element={<Welcome />} />
              
              {/* Protected Routes */}
              <Route element={<ProtectedRoutes />}>
                <Route path="/app" element={<Layout />}>
                  <Route index element={<Home />} />
                  <Route path="lesson/:lessonId" element={<LessonPage />} />
                  <Route path="exercise/:exerciseId" element={<Exercise />} />
                  <Route path="lesson-complete/:lessonId" element={<LessonComplete />} />
                  <Route path="units" element={<Units />} />
                  <Route path="unit/:unitId" element={<UnitPage />} />
                  <Route path="achievements" element={<Achievements />} />
                  <Route path="characters" element={<Characters />} />
                  <Route path="characters/:characterId" element={<CharacterDetail />} />
                  <Route path="profile" element={<Profile />} />
                  <Route path="reviews" element={<Reviews />} />
                  <Route path="reviews/:type" element={<ReviewSessionContainer />} />
                  <Route path="practice/:type" element={<Practice />} />
                </Route>
              </Route>
              
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </Router>
  );
};

export default App;
