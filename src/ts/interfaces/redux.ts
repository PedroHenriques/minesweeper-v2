'use strict';
import { Action } from 'redux';
import { IGameConfig } from './react';
import { GameModes } from '../types/redux';

export interface IState {
  setup: ISetup | null,
  minefield: string[],
  tiles: ITiles,
}

export interface ISetup {
  numLives: number,
  flagsEnabled: boolean,
  gameSeed: string,
  gameMode: GameModes,
  gameStartUTC: number,
  gameEndUTC: number | null,
}

export interface ITiles {
  [key: string]: ITile,
}

export interface ITile {
  id: string,
  row: number,
  col: number,
  revealed: boolean,
  hasMine: boolean,
  hasFlag: boolean,
  numAdjacentMines: number,
}

export interface IFluxStandardAction extends Action {
  error?: boolean,
  payload: any,
  meta?: any,
}

export interface IGenerateMinefieldAction extends IFluxStandardAction {
  payload: IGameConfig | null,
}

export interface IShowNewGameSetupAction extends IFluxStandardAction {
  payload: undefined,
}

export interface IStartGameAction extends IFluxStandardAction {
  payload: {
    setup: ISetup,
    minefield: string[],
    tiles: ITiles,
  },
}

export interface IEndGameAction extends IFluxStandardAction {
  payload: number,
}

export interface ICheckGameEndAction extends IFluxStandardAction {
  payload: undefined,
}

export interface ITileSingleClickAction extends IFluxStandardAction {
  payload: string,
}

export interface ITileBothClickAction extends IFluxStandardAction {
  payload: string,
}

export interface IRevealTilesAction extends IFluxStandardAction {
  payload: string[],
}

export interface IToggleFlagAction extends IFluxStandardAction {
  payload: string,
}