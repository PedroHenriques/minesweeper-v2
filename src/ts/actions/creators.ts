'use strict';
import * as Types from './actionTypes';
import {
  IGenerateMinefieldAction, IStartGameAction, IEndGameAction,
  ICheckGameEndAction, ITileSingleClickAction, ITileBothClickAction,
  IRevealTilesAction, IToggleFlagAction, ISetup, ITiles,
  IShowNewGameSetupAction
} from '../interfaces/redux';
import { IGameConfig } from '../interfaces/react';

export function generateMinefield(
  payload: IGameConfig | null
): IGenerateMinefieldAction {
  return({
    type: Types.GENERATE_MINEFIELD,
    payload: payload,
  });
}

export function showNewGameSetup(): IShowNewGameSetupAction {
  return({
    type: Types.SHOW_NEW_GAME_SETUP,
    payload: undefined,
  });
}

export function startGame(
  setup: ISetup, minefield: string[], tiles: ITiles
): IStartGameAction {
  return({
    type: Types.START_GAME,
    payload: {
      setup,
      minefield,
      tiles,
    },
  });
}

export function endGame(): IEndGameAction {
  return({
    type: Types.END_GAME,
    payload: Date.now(),
  });
}

export function checkGameEnd(): ICheckGameEndAction {
  return({
    type: Types.CHECK_GAME_END,
    payload: undefined,
  });
}

export function tileLeftClick(tileId: string): ITileSingleClickAction {
  return({
    type: Types.TILE_LEFT_CLICK,
    payload: tileId,
  });
}

export function tileRightClick(tileId: string): ITileSingleClickAction {
  return({
    type: Types.TILE_RIGHT_CLICK,
    payload: tileId,
  });
}

export function tileBothClick(tileId: string): ITileBothClickAction {
  return({
    type: Types.TILE_BOTH_CLICK,
    payload: tileId,
  });
}

export function revealTiles(tileIds: string[]): IRevealTilesAction {
  return({
    type: Types.REVEAL_TILES,
    payload: tileIds,
  });
}

export function toggleFlag(tileId: string): IToggleFlagAction {
  return({
    type: Types.TOGGLE_FLAG,
    payload: tileId,
  });
}