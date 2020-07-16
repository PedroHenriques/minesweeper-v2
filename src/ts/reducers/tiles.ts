'use strict';
import {
  START_GAME, REVEAL_TILES, TOGGLE_FLAG, SHOW_NEW_GAME_SETUP
} from '../actions/actionTypes';
import { ITiles, IFluxStandardAction } from '../interfaces/redux';

const initialState: ITiles = {};

export function tiles(
  state: ITiles = initialState,
  action: IFluxStandardAction
): ITiles {
  switch (action.type) {
    case START_GAME:
      return({ ...action.payload.tiles });

    case REVEAL_TILES:
      const updatedTiles: ITiles = {};
      action.payload.forEach((tileId: number) => {
        updatedTiles[tileId] = { ...state[tileId], revealed: true };
      });
      return({ ...state, ...updatedTiles });

    case TOGGLE_FLAG:
      const newTileState = { ...state[action.payload] };
      newTileState.hasFlag = !newTileState.hasFlag;
      return({
        ...state,
        [newTileState.id]: { ...newTileState },
      });

    case SHOW_NEW_GAME_SETUP:
      return initialState;

    default:
      return(state);
  }
}