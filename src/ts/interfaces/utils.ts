'use strict';
import { IDimensions } from './react';

export interface IGenerateMinefieldData {
  gameSeed: string,
  dimensions: IDimensions,
  numMines: number,
}

export interface IMinefieldStats {
  numMines: number,
  numFlags: number,
  numLivesLost: number,
  numRevealedTiles: number,
}