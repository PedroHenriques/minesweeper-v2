'use strict';

/**
 * Generates a random string to be used as a game seed.
 */
export function generateSeed(): string {
  const charCodes: number[] = [];
  const numChars: number = Math.floor(Math.random() * 8 + 3);
  for (let i = 0; i < numChars; i++) {
    charCodes.push(Math.floor(Math.random() * 94 + 33));
  }

  return(String.fromCharCode(...charCodes));
}