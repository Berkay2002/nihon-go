import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Normalizes Japanese text by removing whitespace, romaji in parentheses, 
 * and other formatting inconsistencies to make validation more forgiving.
 */
export function normalizeJapaneseText(text: string): string {
  if (!text) return '';
  
  return text
    .replace(/\s+/g, '') // Remove all whitespace
    .replace(/\(.*?\)/g, '') // Remove content in parentheses (romaji)
    .replace(/、/g, '') // Remove Japanese commas
    .replace(/[^\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Han}]/gu, ''); // Keep only Japanese characters
}

/**
 * Fisher-Yates shuffle algorithm to randomize array elements.
 * This creates a new array rather than modifying the original.
 */
export function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}
