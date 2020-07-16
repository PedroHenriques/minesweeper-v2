'use strict';
import { Dispatch, Store } from 'redux';
import { normalize } from 'normalizr';
import { minefieldSchema } from '../schemas';
import { GENERATE_MINEFIELD } from '../actions/actionTypes';
import { startGame } from '../actions/creators';
import { generateMinefield, getMinefieldStats } from '../utils/MinefieldUtils';
import { IState, IFluxStandardAction } from '../interfaces/redux';
import { IDimensions } from '../interfaces/react';
import { GameModes } from '../types/redux';

export const handleGenerateMinefield =
  (store: Store<IState, IFluxStandardAction>) =>
  (next: Dispatch<IFluxStandardAction>) =>
  (action: IFluxStandardAction) => {
    if (action.type !== GENERATE_MINEFIELD) { return(next(action)); }

    let gameSeed: string;
    let dimensions: IDimensions;
    let numMines: number;
    let numLives: number;
    let flagsEnabled: boolean;
    let gameMode: GameModes;

    if (action.payload === null) {
      const state = store.getState();
      if (state.setup === null) { return; }

      const lastTile = state.tiles[state.minefield[state.minefield.length - 1]];

      dimensions = { rows: lastTile.row + 1, cols: lastTile.col + 1 };
      ({ gameSeed, numLives, flagsEnabled, gameMode } = state.setup);
      ({ numMines } = getMinefieldStats(
        state.minefield.map(tileId => state.tiles[tileId])));
    } else {
      ({ gameSeed, dimensions, numMines, numLives, flagsEnabled, gameMode } =
        action.payload);
    }

    const rawMinefield = generateMinefield({ gameSeed, dimensions, numMines });
    const normalizedMinefield = normalize(rawMinefield, minefieldSchema);
    if (
      normalizedMinefield === undefined ||
      normalizedMinefield.entities === undefined ||
      normalizedMinefield.entities.tiles === undefined
    ){
      return;
    }

    store.dispatch(startGame(
      {
        numLives,
        flagsEnabled,
        gameSeed,
        gameMode,
        gameStartUTC: Date.now(),
        gameEndUTC: null,
      },
      normalizedMinefield.result,
      normalizedMinefield.entities.tiles
    ));
    return;
  };