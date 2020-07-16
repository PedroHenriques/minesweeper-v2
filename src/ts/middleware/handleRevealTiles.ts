'use strict';
import { Dispatch, Store } from 'redux';
import { TILE_LEFT_CLICK, TILE_BOTH_CLICK } from '../actions/actionTypes';
import { revealTiles } from '../actions/creators';
import { calcTilesToReveal, countIdentifiedMines } from '../utils/MinefieldUtils';
import { IState, IFluxStandardAction } from '../interfaces/redux';

export const handleRevealTiles = (store: Store<IState, IFluxStandardAction>) =>
  (next: Dispatch<IFluxStandardAction>) => (action: IFluxStandardAction) => {
    if (![TILE_LEFT_CLICK, TILE_BOTH_CLICK].includes(action.type)) {
      return(next(action));
    }

    const state = store.getState();
    const tile = state.tiles[action.payload];
    if (
      tile.hasFlag
      ||
      (action.type === TILE_LEFT_CLICK && tile.revealed)
      ||
      (action.type === TILE_BOTH_CLICK && !tile.revealed)
    ) {
      return;
    }

    const minefield = state.minefield.map(tileID => {
      return({ ...state.tiles[tileID] });
    });

    if (
      action.type === TILE_BOTH_CLICK &&
      tile.revealed &&
      tile.numAdjacentMines > countIdentifiedMines(minefield,
        parseInt(action.payload, 10))
    ) {
      return;
    }

    store.dispatch(
      revealTiles(
        calcTilesToReveal(minefield, parseInt(action.payload, 10))
      )
    );
    return;
  };