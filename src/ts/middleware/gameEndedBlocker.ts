'use strict';
import { Dispatch, Store } from 'redux';
import {
  GENERATE_MINEFIELD, START_GAME, SHOW_NEW_GAME_SETUP
} from '../actions/actionTypes';
import { IState, IFluxStandardAction } from '../interfaces/redux';

export const gameEndedBlocker = (store: Store<IState, IFluxStandardAction>) =>
  (next: Dispatch<IFluxStandardAction>) => (action: IFluxStandardAction) => {
    const state = store.getState();
    const allowedTypes = [GENERATE_MINEFIELD, START_GAME, SHOW_NEW_GAME_SETUP];

    if (
      state.setup && state.setup.gameEndUTC !== null &&
      !allowedTypes.includes(action.type)
    ) {
      return;
    }

    return(next(action));
  };