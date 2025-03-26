import { useCallback, useState, useEffect } from 'react';

interface UseAudioOptions {
  lang?: string;
  rate?: number;
  pitch?: number;
}

export const useAudio = (options: UseAudioOptions = {}) => {
  const { 
    lang = 'ja-JP', 
    rate = 1, 
    pitch = 1 
  } = options;
  
  const [voicesLoaded, setVoicesLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasAttemptedVoiceLoad, setHasAttemptedVoiceLoad] = useState(false);
  const [browserSupport, setBrowserSupport] = useState({
    speechSynthesis: false,
    japaneseVoice: false
  });

  // Function to check browser support
  const checkBrowserSupport = useCallback(() => {
    const hasSpeechSynthesis = 'speechSynthesis' in window;
    setBrowserSupport(prev => ({
      ...prev,
      speechSynthesis: hasSpeechSynthesis
    }));
    
    return hasSpeechSynthesis;
  }, []);

  // Function to preload voices
  const preloadVoices = useCallback(() => {
    if (!checkBrowserSupport()) {
      console.error('Speech synthesis not supported in this browser.');
      return false;
    }

    try {
      const voices = window.speechSynthesis.getVoices();
      
      // Some browsers need time to load voices
      if (voices.length === 0 && !hasAttemptedVoiceLoad) {
        console.log('No voices available yet, will try again when voices change');
        setHasAttemptedVoiceLoad(true);
        return false;
      }
      
      // Check if we have Japanese voices
      const japaneseVoices = voices.filter(v => v.lang.includes('ja'));
      
      console.log('All available voices:', voices.map(v => `${v.name} (${v.lang})`));
      console.log('Japanese voices:', japaneseVoices.map(v => `${v.name} (${v.lang})`));
      
      setBrowserSupport(prev => ({
        ...prev,
        japaneseVoice: japaneseVoices.length > 0
      }));
      
      setVoicesLoaded(true);
      return voices.length > 0;
    } catch (error) {
      console.error('Error loading voices:', error);
      return false;
    }
  }, [hasAttemptedVoiceLoad, checkBrowserSupport]);

  // Load voices when the component mounts
  useEffect(() => {
    if (!checkBrowserSupport()) return;

    const loadVoices = () => {
      preloadVoices();
    };

    // Check if voices are already loaded
    loadVoices();
    
    // In Chrome and some other browsers, we need to wait for the voiceschanged event
    window.speechSynthesis.addEventListener('voiceschanged', loadVoices);
    
    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', loadVoices);
    };
  }, [preloadVoices, checkBrowserSupport]);

  // Function to speak text
  const speak = useCallback((text: string) => {
    if (!checkBrowserSupport()) {
      console.error('Speech synthesis is not supported in this browser.');
      return false;
    }
    
    try {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      
      console.log(`Speaking text: "${text}" in language: ${lang}`);
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.rate = rate;
      utterance.pitch = pitch;

      // Get all available voices
      const voices = window.speechSynthesis.getVoices();
      
      if (voices.length === 0) {
        console.warn('No voices available. Try again after voices are loaded.');
        return false;
      }
      
      // Try to find a Japanese voice
      const japaneseVoice = voices.find(voice => voice.lang.includes('ja'));
      
      if (japaneseVoice) {
        console.log(`Using Japanese voice: ${japaneseVoice.name}`);
        utterance.voice = japaneseVoice;
      } else {
        console.warn('No Japanese voice found, using default voice');
        // Still proceed with default voice
      }

      // Add event listeners for debugging
      utterance.onstart = () => {
        console.log('Speech started');
        setIsPlaying(true);
      };
      
      utterance.onend = () => {
        console.log('Speech ended');
        setIsPlaying(false);
      };
      
      utterance.onerror = (event) => {
        console.error('Speech error:', event);
        setIsPlaying(false);
      };

      // Use a timeout to make sure the utterance is processed
      setTimeout(() => {
        window.speechSynthesis.speak(utterance);
      }, 100);
      
      return true;
    } catch (error) {
      console.error('Error in speech synthesis:', error);
      setIsPlaying(false);
      return false;
    }
  }, [lang, rate, pitch, checkBrowserSupport]);

  // Fix for Chrome that sometimes pauses speech synthesis when tab is not focused
  useEffect(() => {
    if (!checkBrowserSupport()) return;

    // Chrome fix - resume if it's paused unexpectedly
    const handleVisibilityChange = () => {
      if (!document.hidden && window.speechSynthesis.paused) {
        console.log('Resuming paused speech synthesis');
        window.speechSynthesis.resume();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Additional Chrome fix - prevent long utterances from being cut off
    const intervalId = setInterval(() => {
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.pause();
        window.speechSynthesis.resume();
      }
    }, 10000);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(intervalId);
    };
  }, [checkBrowserSupport]);

  return { 
    speak, 
    isPlaying, 
    voicesLoaded, 
    preloadVoices,
    browserSupport 
  };
};
