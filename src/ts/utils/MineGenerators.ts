import { IDimensions } from '../interfaces/react';
import { prng } from 'seedrandom';

/**
 * Randomly selects tile indexes to have mines.
 */
export function pureRNG(
  dimensions: IDimensions, numMines: number, rand: prng
): number[] {
  const mines: number[] = [];
  while (mines.length < numMines) {
    const chosenTileIndex = Math.floor(rand() * dimensions.rows *
      dimensions.cols);
    if (!mines.includes(chosenTileIndex)) {
      mines.push(chosenTileIndex);
    }
  }

  return(mines);
}