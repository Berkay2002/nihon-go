
import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import Navigation from './Navigation';
import { TimeoutError } from './shared/TimeoutError';
import { GameCharacter } from './home/GameCharacter';

const Layout = () => {
  const { isLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [authTimeout, setAuthTimeout] = useState(false);
  const [seedingAttempted, setSeedingAttempted] = useState(false);

  // Redirect to auth if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/auth");
    }
  }, [isAuthenticated, isLoading, navigate]);

  // Set up auth timeout detection
  useEffect(() => {
    // If auth check takes too long, show timeout UI
    const timeoutId = setTimeout(() => {
      if (isLoading) {
        setAuthTimeout(true);
      }
    }, 8000); // 8 seconds is plenty of time for auth to resolve

    return () => clearTimeout(timeoutId);
  }, [isLoading]);

  // Track when user becomes authenticated
  useEffect(() => {
    const initializeApp = async () => {
      if (seedingAttempted) return;
      
      try {
        // Mark as seeding attempted to prevent multiple attempts
        setSeedingAttempted(true);
        // Database seeding removed
      } catch (error) {
        console.error("Error initializing app data:", error);
      }
    };
    
    if (!isLoading && isAuthenticated) {
      initializeApp();
    }
  }, [isLoading, isAuthenticated, seedingAttempted]);

  const handleRefresh = () => {
    window.location.reload();
  };

  // If auth checking is taking too long, show timeout error
  if (authTimeout) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <TimeoutError 
          title="Authentication Timeout"
          description="We're having trouble connecting to the authentication service. Please refresh the page or try again later."
          onRefresh={handleRefresh}
        />
      </div>
    );
  }

  // If still checking auth status, show loading
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <GameCharacter state="thinking" className="mb-4" />
        <p className="mt-2 text-muted-foreground">Loading Nihon Go...</p>
      </div>
    );
  }

  // If authenticated, show the app
  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      <Navigation />
      <main className="flex-1 pb-16 md:pb-0 md:pl-20">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
