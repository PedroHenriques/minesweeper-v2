'use strict';
import { START_GAME, SHOW_NEW_GAME_SETUP } from '../actions/actionTypes';
import { IFluxStandardAction } from '../interfaces/redux';

const initialState: string[] = [];

export function minefield(
  state: string[] = initialState,
  action: IFluxStandardAction
): string[] {
  switch (action.type) {
    case START_GAME:
      return(action.payload.minefield);

    case SHOW_NEW_GAME_SETUP:
      return initialState;

    default:
      return(state);
  }
}