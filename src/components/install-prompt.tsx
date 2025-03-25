// src/components/install-prompt.tsx
import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Download, X, Check, Trophy, Star, Zap } from 'lucide-react';

// Define a type for the beforeinstallprompt event
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

// Create a more specific type for the Window interface with our custom property
interface WindowWithPrompt extends Window {
  deferredPrompt?: BeforeInstallPromptEvent | null;
}

interface InstallPromptProps {
  variant?: 'sidebar' | 'mobile' | 'achievement';
  context?: 'lesson-complete' | 'streak-milestone' | 'general';
  streakCount?: number;
  lessonCount?: number;
}

export function InstallPrompt({ 
  variant = 'sidebar', 
  context = 'general',
  streakCount = 0,
  lessonCount = 0
}: InstallPromptProps) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isAppInstalled, setIsAppInstalled] = useState(false);

  // Determine prompt messaging based on context
  const getPromptMessage = () => {
    if (context === 'lesson-complete') {
      return {
        title: "Keep Your Progress Going!",
        subtitle: "Install Nihon Go to learn offline",
        icon: <Trophy className="h-6 w-6 text-yellow-500" />
      };
    } else if (context === 'streak-milestone') {
      return {
        title: `${streakCount} Day Streak!`,
        subtitle: "Install the app to keep your streak going",
        icon: <Zap className="h-6 w-6 text-orange-500" />
      };
    } else {
      return {
        title: "Unlock Offline Mode!",
        subtitle: "Learn Japanese anytime, anywhere",
        icon: <Download className="h-6 w-6 text-green-600 dark:text-green-400" />
      };
    }
  };

  const message = getPromptMessage();

  // Handle PWA installation events
  useEffect(() => {
    // Check if the app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsAppInstalled(true);
      return;
    }

    // Load the deferred prompt if it was stored
    const loadDeferredPrompt = async () => {
      // Check if we have a stored prompt event
      const hasStoredPrompt = localStorage.getItem('installPromptAvailable') === 'true';
      const shouldShowPrompt = localStorage.getItem('showInstallPrompt') === 'true';
      
      if (hasStoredPrompt && shouldShowPrompt) {
        // Set flag to show the prompt
        setShowInstallPrompt(true);
        
        // This is just to indicate we have a valid prompt - the real event is handled globally
        setDeferredPrompt({} as BeforeInstallPromptEvent);
        
        // Only show once
        localStorage.removeItem('showInstallPrompt');
      }
    };
    
    loadDeferredPrompt();

    // Before the browser triggers the installation prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent Chrome 67+ from automatically showing the prompt
      e.preventDefault();
      
      // Store the event for later use
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Also store globally for easier access
      (window as WindowWithPrompt).deferredPrompt = e as BeforeInstallPromptEvent;
      
      // Mark that we have a prompt available
      localStorage.setItem('installPromptAvailable', 'true');
      
      // We don't show the prompt immediately - it will be triggered strategically
    };

    const handleAppInstalled = () => {
      // Log to analytics that app was installed
      console.log('PWA app was installed');
      // Hide the install prompt
      setIsAppInstalled(true);
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
      (window as WindowWithPrompt).deferredPrompt = null;
      
      // Clear storage flags
      localStorage.removeItem('installPromptAvailable');
      localStorage.removeItem('showInstallPrompt');
    };

    // Add event listeners with proper references for cleanup
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      // Properly remove event listeners with the same function references
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    // Get the global beforeinstallprompt event if available
    const globalDeferredPrompt = (window as WindowWithPrompt).deferredPrompt || deferredPrompt;
    
    if (!globalDeferredPrompt) {
      console.log('The deferred prompt is not available.');
      
      // For iOS, provide a subtle hint since they don't support the install prompt API
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      if (isIOS) {
        // Instead of a toast, update the UI to show iOS instructions
        setShowInstallPrompt(false);
        // Potentially show iOS-specific instructions here if needed
      }
      return;
    }

    try {
      // Show the install prompt
      globalDeferredPrompt.prompt();
      
      // Wait for the user to respond to the prompt
      const { outcome } = await globalDeferredPrompt.userChoice;
      console.log(`User response to the install prompt: ${outcome}`);
      
      // Clear the stored prompt
      (window as WindowWithPrompt).deferredPrompt = null;
      localStorage.removeItem('installPromptAvailable');
      
      // We've used the prompt, and can't use it again, throw it away
      setDeferredPrompt(null);
      setShowInstallPrompt(false);
    } catch (error) {
      console.error('Error showing install prompt:', error);
    }
  };

  const dismissPrompt = () => {
    setShowInstallPrompt(false);
    // Store user preference to not show again for some time
    localStorage.setItem('pwaInstallPromptDismissed', Date.now().toString());
    // Clear the show flag
    localStorage.removeItem('showInstallPrompt');
    
    // Dispatch event to track dismissals
    const dismissEvent = new Event('promptDismissed');
    window.dispatchEvent(dismissEvent);
  };

  // Don't show anything if app is already installed or no prompt available
  if (isAppInstalled || !showInstallPrompt) return null;

  // Sidebar variant (for desktop)
  if (variant === 'sidebar') {
    return (
      <div className="hidden md:flex flex-col items-center text-center p-3 mt-auto mb-4 mx-auto w-20 rounded-lg bg-blue-50 dark:bg-slate-800 border border-blue-100 dark:border-slate-700">
        <Download className="h-6 w-6 text-nihongo-blue mb-2" />
        <p className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">Install App</p>
        <Button 
          size="sm"
          className="w-full bg-nihongo-blue hover:bg-nihongo-blue/90 text-white text-xs"
          onClick={handleInstallClick}
        >
          Install
        </Button>
      </div>
    );
  }

  // Achievement variant (for mobile, shown after completing lessons)
  if (variant === 'achievement') {
    return (
      <div className="md:hidden fixed top-20 left-1/2 transform -translate-x-1/2 w-11/12 max-w-sm p-4 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-yellow-200 dark:border-yellow-900 z-50 animate-slide-down">
        <button 
          onClick={dismissPrompt}
          className="absolute top-2 right-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
        
        <div className="flex items-center mb-3">
          <div className="w-12 h-12 rounded-full bg-yellow-100 dark:bg-yellow-900 flex items-center justify-center mr-3">
            {message.icon}
          </div>
          <div>
            <h3 className="font-bold text-base">{message.title}</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300">{message.subtitle}</p>
          </div>
        </div>
        
        <div className="space-y-2 mb-3 text-sm text-slate-600 dark:text-slate-300">
          <div className="flex items-center">
            <div className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mr-2">
              <Check className="h-3 w-3 text-green-600 dark:text-green-400" />
            </div>
            <span className="text-xs">Works offline</span>
          </div>
          <div className="flex items-center">
            <div className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mr-2">
              <Check className="h-3 w-3 text-green-600 dark:text-green-400" />
            </div>
            <span className="text-xs">Faster experience</span>
          </div>
          <div className="flex items-center">
            <div className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mr-2">
              <Check className="h-3 w-3 text-green-600 dark:text-green-400" />
            </div>
            <span className="text-xs">No app store needed</span>
          </div>
        </div>
        
        <Button 
          className="w-full bg-yellow-500 hover:bg-yellow-600 text-white"
          onClick={handleInstallClick}
        >
          Install Now
        </Button>
      </div>
    );
  }

  // Mobile variant (default mobile banner)
  return (
    <div className="md:hidden fixed bottom-20 left-0 right-0 p-2 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 z-50">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Download className="h-5 w-5 text-nihongo-blue mr-2" />
          <span className="text-sm font-medium">Install Nihon Go app</span>
        </div>
        <div className="flex items-center">
          <Button 
            size="sm"
            className="mr-2 bg-nihongo-blue hover:bg-nihongo-blue/90 text-white text-xs"
            onClick={handleInstallClick}
          >
            Install
          </Button>
          <Button 
            size="sm"
            variant="ghost"
            onClick={dismissPrompt}
            className="text-slate-500"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}