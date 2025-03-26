
import { useCallback } from 'react';

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

  const speak = useCallback((text: string) => {
    // Check if the browser supports speech synthesis
    if (!('speechSynthesis' in window)) {
      console.error('Speech synthesis is not supported in this browser.');
      return false;
    }
    
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = rate;
    utterance.pitch = pitch;

    // Get Japanese voice if available
    const voices = window.speechSynthesis.getVoices();
    const japaneseVoice = voices.find(voice => voice.lang.includes('ja'));
    if (japaneseVoice) {
      utterance.voice = japaneseVoice;
    }

    window.speechSynthesis.speak(utterance);
    return true;
  }, [lang, rate, pitch]);

  // Function to preload voices (needed in some browsers)
  const preloadVoices = useCallback(() => {
    if (!('speechSynthesis' in window)) return;
    
    // This is a workaround for Chrome which needs a user interaction
    // to load the voices for the first time
    window.speechSynthesis.getVoices();
  }, []);

  return { speak, preloadVoices };
};
