'use strict';
import { Dispatch, Store } from 'redux';
import { checkGameEnd } from '../actions/creators';
import { REVEAL_TILES } from '../actions/actionTypes';
import { IState, IFluxStandardAction } from '../interfaces/redux';

export const requestEndGameCheck = (
  store: Store<IState, IFluxStandardAction>
  ) => (next: Dispatch<IFluxStandardAction>) =>
  (action: IFluxStandardAction) => {
    const returnValue = next(action);
    if (action.type === REVEAL_TILES) { store.dispatch(checkGameEnd()); }
    return returnValue;
  };