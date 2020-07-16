'use strict';
import { GameModes } from '../types/redux';

export interface IDimensions {
  rows: number,
  cols: number,
}

export interface IGameConfig {
  numMines: number,
  dimensions: IDimensions,
  flagsEnabled: boolean,
  numLives: number,
  gameSeed: string,
  gameMode: GameModes,
}

export interface ITileConfig {
  id: string,
  row: number,
  col: number,
  revealed: boolean,
  hasMine: boolean,
  hasFlag: boolean,
  numAdjacentMines: number,
}

export interface IMinefieldData {
  minefield: ITileConfig[],
  numRevealed: number,
}

export interface IDifficulty {
  name: string,
  rows: number,
  cols: number,
  mines: number,
}

export interface IHtmlDimensions {
  width: number,
  height: number,
}

export interface IStylishButtonEvents {
  onClick: () => void,
}