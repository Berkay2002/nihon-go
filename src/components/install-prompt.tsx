"use client";

import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { X, Download } from 'lucide-react';

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

  useEffect(() => {
    // Before the browser triggers the installation prompt
    window.addEventListener('beforeinstallprompt', (e: Event) => {
      // Prevent Chrome 67+ from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Update UI to notify the user they can add to home screen
      setShowInstallPrompt(true);
    });

    window.addEventListener('appinstalled', () => {
      // Log to analytics that app was installed
      console.log('PWA app was installed');
      // Hide the install prompt
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
    });

    // Check if the app is already installed by detecting display-mode
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setShowInstallPrompt(false);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', () => {});
      window.removeEventListener('appinstalled', () => {});
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
    setShowInstallPrompt(false);
    // Store user preference to not show again for some time
    localStorage.setItem('pwaInstallPromptDismissed', Date.now().toString());
  };

  if (!showInstallPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:bottom-4 md:w-80 bg-slate-800 dark:bg-slate-900 p-4 rounded-lg shadow-lg z-50 border border-slate-700">
      <button 
        onClick={dismissPrompt}
        className="absolute top-2 right-2 text-slate-400 hover:text-slate-200"
        aria-label="Dismiss"
      >
        <X size={18} />
      </button>
      
      <div className="flex items-start gap-3 mb-3">
        <div className="flex-shrink-0 bg-slate-700 p-2 rounded-full">
          <img 
            src="/nihon-go-logo.png" 
            alt="Nihon Go app icon" 
            className="w-8 h-8 rounded-full object-cover"
          />
        </div>
        <div>
          <h3 className="font-semibold text-white">Install Nihon Go</h3>
          <p className="text-sm text-slate-300">Add to home screen for quick access</p>
        </div>
      </div>
      
      <Button 
        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
        onClick={handleInstallClick}
      >
        <Download size={16} className="mr-2" />
        Install App
      </Button>
    </div>
  );
} 