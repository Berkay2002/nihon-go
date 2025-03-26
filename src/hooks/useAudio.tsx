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

  // Function to preload voices
  const preloadVoices = useCallback(() => {
    if (window.speechSynthesis) {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        setVoicesLoaded(true);
        console.log('Voices preloaded:', voices.length);
        console.log('Japanese voices:', voices.filter(v => v.lang.includes('ja')));
        return true;
      } else {
        console.log('No voices available yet, waiting for voiceschanged event');
        return false;
      }
    } else {
      console.error('Speech synthesis not supported in this browser.');
      return false;
    }
  }, []);

  // Load voices when the component mounts
  useEffect(() => {
    const loadVoices = () => {
      preloadVoices();
    };

    // Check if voices are already loaded
    if (window.speechSynthesis) {
      loadVoices();
      
      // In Chrome and some other browsers, we need to wait for the voiceschanged event
      window.speechSynthesis.addEventListener('voiceschanged', loadVoices);
      
      return () => {
        window.speechSynthesis.removeEventListener('voiceschanged', loadVoices);
      };
    } else {
      console.error('Speech synthesis not supported in this browser.');
    }
  }, [preloadVoices]);

  // Function to speak text
  const speak = useCallback((text: string) => {
    // Check if the browser supports speech synthesis
    if (!('speechSynthesis' in window)) {
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

      // Get Japanese voice if available
      const voices = window.speechSynthesis.getVoices();
      console.log(`Available voices: ${voices.length}`);
      
      const japaneseVoice = voices.find(voice => voice.lang.includes('ja'));
      if (japaneseVoice) {
        console.log(`Using Japanese voice: ${japaneseVoice.name}`);
        utterance.voice = japaneseVoice;
      } else {
        console.warn('No Japanese voice found, using default voice');
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

      window.speechSynthesis.speak(utterance);
      return true;
    } catch (error) {
      console.error('Error in speech synthesis:', error);
      setIsPlaying(false);
      return false;
    }
  }, [lang, rate, pitch]);

  // Fix for Chrome that sometimes pauses speech synthesis when tab is not focused
  useEffect(() => {
    // Chrome fix - resume if it's paused unexpectedly
    const handleVisibilityChange = () => {
      if (!document.hidden && window.speechSynthesis && window.speechSynthesis.paused) {
        console.log('Resuming paused speech synthesis');
        window.speechSynthesis.resume();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return { speak, isPlaying, voicesLoaded, preloadVoices };
};
