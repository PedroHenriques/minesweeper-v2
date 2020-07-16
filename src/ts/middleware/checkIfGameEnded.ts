'use strict';
import { Dispatch, Store } from 'redux';
import { CHECK_GAME_END } from '../actions/actionTypes';
import { endGame } from '../actions/creators';
import { getGameState } from '../utils/MinefieldUtils';
import { GAME_WON, GAME_LOST } from '../data';
import { IState, IFluxStandardAction } from '../interfaces/redux';

export const checkIfGameEnded = (store: Store<IState, IFluxStandardAction>) =>
  (next: Dispatch<IFluxStandardAction>) => (action: IFluxStandardAction) => {
    if (action.type !== CHECK_GAME_END) { return next(action); }

    const state = store.getState();
    if (state.setup === null) { return; }

    const minefield = state.minefield.map(tileId => state.tiles[tileId]);
    const gameState = getGameState(minefield, state.setup.numLives);

    if ([GAME_WON, GAME_LOST].includes(gameState)) {
      store.dispatch(endGame());
    }
    return;
  };