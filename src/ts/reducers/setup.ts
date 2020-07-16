'use strict';
import { START_GAME, END_GAME, SHOW_NEW_GAME_SETUP } from '../actions/actionTypes';
import { ISetup, IFluxStandardAction } from '../interfaces/redux';

const initialState: ISetup | null = null;

export function setup(
  state: ISetup | null = initialState,
  action: IFluxStandardAction
): ISetup | null {
  switch (action.type) {
    case START_GAME:
      return({ ...action.payload.setup });

    case END_GAME:
      if (state === null) {
        return(null);
      } else {
        return({ ...state, gameEndUTC: action.payload });
      }

    case SHOW_NEW_GAME_SETUP:
      return initialState;

    default:
      return(state);
  }
}