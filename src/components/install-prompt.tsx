"use client";

import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { X, Download } from 'lucide-react';
import { toast } from 'sonner';

// Define a type for the beforeinstallprompt event
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  // Reset all PWA-related state on mount to force clean state
  useEffect(() => {
    console.log("InstallPrompt component mounted - resetting state");
    // Clear any stored PWA install preferences to force fresh state
    localStorage.removeItem('pwaInstallPromptDismissed');
    
    // Return cleanup function
    return () => {
      console.log("InstallPrompt component unmounted");
    };
  }, []);

  useEffect(() => {
    // Check if the prompt was dismissed recently (within last 3 days)
    const checkDismissed = () => {
      const dismissedTime = localStorage.getItem('pwaInstallPromptDismissed');
      if (dismissedTime) {
        const dismissedDate = new Date(Number(dismissedTime));
        const now = new Date();
        const daysDifference = (now.getTime() - dismissedDate.getTime()) / (1000 * 3600 * 24);
        return daysDifference < 3; // Don't show for 3 days after dismissal
      }
      return false;
    };

    // Before the browser triggers the installation prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent Chrome 67+ from automatically showing the prompt
      e.preventDefault();
      console.log("Before install prompt event captured", e);
      
      // Only show if not dismissed recently and not already installed
      if (!checkDismissed() && !window.matchMedia('(display-mode: standalone)').matches) {
        // Stash the event so it can be triggered later
        setDeferredPrompt(e as BeforeInstallPromptEvent);
        
        // Show a toast notification instead of a persistent popup
        toast(
          <div className="flex items-center gap-2">
            <span>Install Nihon Go app</span>
            <Button 
              size="sm" 
              variant="secondary"
              onClick={() => {
                setShowInstallPrompt(true);
                // Auto-hide the toast
                return false;
              }}
            >
              Install
            </Button>
          </div>,
          {
            duration: 10000, // 10 seconds
            position: 'bottom-right',
          }
        );
      }
    };

    const handleAppInstalled = () => {
      // Log to analytics that app was installed
      console.log('PWA app was installed');
      // Hide the install prompt
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
    };

    // Add event listeners with proper references for cleanup
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Check if the app is already installed by detecting display-mode
    if (window.matchMedia('(display-mode: standalone)').matches) {
      console.log("App is already in standalone mode");
      setShowInstallPrompt(false);
    }

    return () => {
      // Properly remove event listeners with the same function references
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      console.log('The deferred prompt is not available.');
      return;
    }

    // Show the install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);
    
    // We've used the prompt, and can't use it again, throw it away
    setDeferredPrompt(null);
    setShowInstallPrompt(false);
  };

  const dismissPrompt = () => {
    console.log("Dismissing install prompt");
    setShowInstallPrompt(false);
    // Store user preference to not show again for some time
    localStorage.setItem('pwaInstallPromptDismissed', Date.now().toString());
  };

  // Auto-dismiss after 10 seconds
  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null;
    
    if (showInstallPrompt) {
      console.log("Setting auto-dismiss timeout");
      timeoutId = setTimeout(() => {
        console.log("Auto-dismissing prompt");
        dismissPrompt(); // Use dismissPrompt instead of just setting state
      }, 10000); // 10 seconds auto-dismiss
    }
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [showInstallPrompt]);

  if (!showInstallPrompt) return null;

  console.log("Rendering install prompt");
  return (
    <div className="fixed bottom-4 left-4 w-64 bg-slate-800 dark:bg-slate-900 p-3 rounded-lg shadow-lg z-50 border border-slate-700">
      <button 
        onClick={dismissPrompt}
        className="absolute top-2 right-2 text-slate-400 hover:text-slate-200"
        aria-label="Dismiss"
      >
        <X size={16} />
      </button>
      
      <div className="flex items-start gap-2 mb-2">
        <div className="flex-shrink-0 bg-slate-700 p-1 rounded-full">
          <img 
            src="/nihon-go-logo.png" 
            alt="Nihon Go app icon" 
            className="w-6 h-6 rounded-full object-cover"
          />
        </div>
        <div>
          <h3 className="font-medium text-sm text-white">Install Nihon Go</h3>
          <p className="text-xs text-slate-300">Quick access on your device</p>
        </div>
      </div>
      
      <Button 
        size="sm"
        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs"
        onClick={handleInstallClick}
      >
        <Download size={12} className="mr-1" />
        Install
      </Button>
    </div>
  );
} 