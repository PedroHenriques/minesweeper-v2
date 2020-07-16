'use strict';
import { Dispatch, Store } from 'redux';
import { TILE_RIGHT_CLICK } from '../actions/actionTypes';
import { toggleFlag } from '../actions/creators';
import { IState, IFluxStandardAction } from '../interfaces/redux';

export const handleFlags = (store: Store<IState, IFluxStandardAction>) =>
  (next: Dispatch<IFluxStandardAction>) => (action: IFluxStandardAction) => {
    if (action.type !== TILE_RIGHT_CLICK) { return(next(action)); }

    const state = store.getState();
    if (state.tiles[action.payload] && !state.tiles[action.payload].revealed) {
      store.dispatch(toggleFlag(action.payload));
    }
    return;
  };