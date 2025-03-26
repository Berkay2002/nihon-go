
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Normalizes Japanese text by removing whitespace, romaji in parentheses, 
 * and other formatting inconsistencies to make validation more forgiving.
 * 
 * Enhanced version with better handling of various input formats and variations.
 */
export function normalizeJapaneseText(text: string): string {
  if (!text) return '';
  
  return text
    .replace(/\s+/g, '') // Remove all whitespace
    .replace(/\(.*?\)/g, '') // Remove content in parentheses (romaji)
    .replace(/（.*?）/g, '') // Remove content in full-width parentheses
    .replace(/[、。,.:;!?！？]/g, '') // Remove punctuation (both Japanese and English)
    .replace(/[ー－]/g, '') // Remove long vowel marks, as they're often hard to distinguish
    .replace(/[・]/g, '') // Remove middle dots
    .replace(/[^\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Han}]/gu, '') // Keep only Japanese characters
    .toLowerCase(); // Make case-insensitive for romaji/mixed text
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

/**
 * Calculate Levenshtein distance between two strings to allow for small typos
 */
export function levenshteinDistance(a: string, b: string): number {
  const matrix = [];

  // Initialize matrix
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  // Fill matrix
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,  // substitution
          Math.min(
            matrix[i][j - 1] + 1,    // insertion
            matrix[i - 1][j] + 1     // deletion
          )
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

/**
 * Check if two Japanese texts are similar, allowing for small typos or variations
 */
export function areJapaneseTextsSimilar(text1: string, text2: string, threshold = 0.8): boolean {
  const normalized1 = normalizeJapaneseText(text1);
  const normalized2 = normalizeJapaneseText(text2);
  
  // Perfect match after normalization
  if (normalized1 === normalized2) {
    return true;
  }
  
  // For very short strings, be more forgiving
  if (normalized1.length <= 3 || normalized2.length <= 3) {
    return levenshteinDistance(normalized1, normalized2) <= 1;
  }
  
  // For longer strings, use similarity threshold
  const distance = levenshteinDistance(normalized1, normalized2);
  const maxLength = Math.max(normalized1.length, normalized2.length);
  const similarity = 1 - (distance / maxLength);
  
  return similarity >= threshold;
}
