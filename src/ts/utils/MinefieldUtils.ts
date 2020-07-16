'use strict';
import * as Data from '../data';
import * as Generators from './MineGenerators';
import * as SeedRandom from 'seedrandom';
import { IGenerateMinefieldData, IMinefieldStats } from '../interfaces/utils';
import { IDimensions, ITileConfig } from '../interfaces/react';
import { ITile } from '../interfaces/redux';

/**
 * Determines the state of the current game.
 */
export function getGameState(
  minefield: ITile[], numLives: number
): Data.gameState {
  const minefieldStats = getMinefieldStats(minefield);
  if (minefieldStats.numLivesLost >= numLives) { return Data.GAME_LOST; }
  if (
    minefield.length - minefieldStats.numRevealedTiles +
    minefieldStats.numLivesLost === minefieldStats.numMines
  ){
    return Data.GAME_WON;
  }

  return Data.GAME_RUNNING;
}

/**
 * Handles calculating the number of mines, flags and lives lost for a given
 * minefield state.
 */
export function getMinefieldStats(minefield: ITileConfig[]): IMinefieldStats {
  let numMines = 0;
  let numFlags = 0;
  let numLivesLost = 0;
  let numRevealedTiles = 0;

  minefield.forEach(tile => {
    if (tile.hasMine) {
      numMines++;
      if (tile.revealed) { numLivesLost++; }
    }
    if (tile.hasFlag) { numFlags++; }
    if (tile.revealed) { numRevealedTiles++; }
  });

  return({ numMines, numFlags, numLivesLost, numRevealedTiles });
}

/**
 * Generates a new minefield. Returns the minefield and the number of tiles
 * already revealed.
 */
export function generateMinefield(data: IGenerateMinefieldData): ITileConfig[] {
  const prng = SeedRandom(data.gameSeed);

  let minefield: ITile[];
  let revealTiles: string[] | null;
  do {
    minefield = [];
    let tileId: number = 0;
    for (let row = 0; row < data.dimensions.rows; row++) {
      for (let col = 0; col < data.dimensions.cols; col++) {
        minefield.push({
          id: `${tileId++}`,
          row,
          col,
          revealed: false,
          hasMine: false,
          hasFlag: false,
          numAdjacentMines: 0,
        });
      }
    }

    const offsets: number[][] = [
      [-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]
    ];
    const mines = Generators.pureRNG(data.dimensions, data.numMines, prng);
    mines.forEach(mineTileIndex => {
      minefield[mineTileIndex].hasMine = true;
      const adjacentTiles = findTileIndexes(
        data.dimensions, mineTileIndex, offsets
      );
      adjacentTiles.forEach(tileIndex => {
        minefield[tileIndex].numAdjacentMines++;
      });
    });

    revealTiles = chooseInitialPatch(data.dimensions, minefield, prng);
  } while (revealTiles === null);

  revealTiles.forEach(index => {
    minefield[parseInt(index, 10)].revealed = true;
  });

  return(minefield);
}

/**
 * Finds all the relevant tile indexes, by applying the offsets to the index
 * of focus. Will only return valid tile indexes.
 */
export function findTileIndexes(
  dimensions: IDimensions,
  focusIndex: number,
  offsets: number[][]
): number[] {
  const indexes: number[] = [];

  const rowIndex: number = Math.floor(focusIndex / dimensions.cols);
  const colIndex: number = focusIndex - rowIndex * dimensions.cols;
  offsets.forEach(offset => {
    const [rowOffset, colOffset] = offset;
    if (
      rowIndex + rowOffset < 0 || colIndex + colOffset < 0 ||
      rowIndex + rowOffset >= dimensions.rows ||
      colIndex + colOffset >= dimensions.cols
    ) {
      return;
    }

    indexes.push(
      colIndex + colOffset + (rowIndex + rowOffset) * dimensions.cols
    );
  });

  return(indexes);
}

/**
 * Determines the tiles that should be revealed based on 1 tile becoming
 * revealed. Only returns valid and not revealed tile indexes.
 */
export function calcTilesToReveal(
  minefield: ITile[],
  tileIndex: number
): string[] {
  if (!minefield[tileIndex].revealed && !isTileEmpty(minefield[tileIndex])) {
    return([minefield[tileIndex].id]);
  }

  const dimensions: IDimensions = {
    rows: minefield[minefield.length - 1].row + 1,
    cols: minefield[minefield.length - 1].col + 1,
  };
  const offsets: number[][] = [
    [-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]
  ];

  const tilesToReveal: string[] = [];
  const tilesChecked: number[] = [];
  const queue: number[] = [
    tileIndex,
    ...findTileIndexes(dimensions, tileIndex, offsets),
  ];
  do {
    const focusedIndex = queue.pop();
    if (focusedIndex === undefined) { continue; }

    tilesChecked.push(focusedIndex);

    if (tilesToReveal.includes(minefield[focusedIndex].id)) { continue; }

    if (!minefield[focusedIndex].hasFlag) {
      if (!minefield[focusedIndex].revealed) {
        tilesToReveal.push(minefield[focusedIndex].id);
      }
      if (isTileEmpty(minefield[focusedIndex])) {
        queue.push(...findTileIndexes(dimensions, focusedIndex, offsets)
          .filter(index => !tilesChecked.includes(index)));
      }
    }
  } while (queue.length > 0);

  return(tilesToReveal);
}

/**
 * Counts the number of flags and revealed mines in tiles adjacent to the
 * provided index.
 */
export function countIdentifiedMines(
  minefield: ITile[],
  tileIndex: number
): number {
  const dimensions: IDimensions = {
    rows: minefield[minefield.length - 1].row + 1,
    cols: minefield[minefield.length - 1].col + 1,
  };
  const offsets: number[][] = [
    [-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]
  ];

  let result: number = 0;
  findTileIndexes(dimensions, tileIndex, offsets).forEach(index => {
    const tile: ITile = minefield[index];
    if (tile.hasFlag || (tile.revealed && tile.hasMine)) { result++; }
  });

  return result;
}

/**
 * Selects one of the empty patches of tiles or returns null if there are no
 * empty patches.
 */
function chooseInitialPatch(
  dimensions: IDimensions,
  minefield: ITile[],
  prng: SeedRandom.prng
): string[] | null {
  const numberTiles: number = dimensions.rows * dimensions.cols;

  const queue: number[] = [];
  minefield.forEach((tile, index) => {
    if (isTileEmpty(tile)) {
      queue.push(index);
    }
  });

  const emptyPatches: string[][] = [];
  const checkedTiles: string[] = [];
  while (queue.length > 0) {
    const index = queue.pop();
    if (index === undefined || checkedTiles.includes(minefield[index].id)) {
      continue;
    }
    const patch = calcTilesToReveal(minefield, index);
    checkedTiles.push(...patch);
    if (patch.length >= Math.round(Data.initialPatchMinSize * numberTiles)) {
      emptyPatches.push(patch);
    }
  }

  if (emptyPatches.length === 0) {
    return(null);
  } else {
    return(emptyPatches[Math.floor(prng() * emptyPatches.length)]);
  }
}

/**
 * Determines if the provided tile is an empty square, aka, has no mine and no
 * number to display.
 */
function isTileEmpty(tile: ITile): boolean {
  return(!tile.hasMine && tile.numAdjacentMines === 0);
}