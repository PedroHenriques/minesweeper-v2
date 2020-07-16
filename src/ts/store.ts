'use strict';
import { createStore, compose } from 'redux';
import { reducer } from './reducers/index';
import { middleware } from './middleware/index';
import { IState, IFluxStandardAction } from './interfaces/redux';

const initialStore: IState = {
  setup: null,
  minefield: [],
  tiles: {}
};

const composeEnhancers = ( process.env.NODE_ENV !== 'production' &&
  (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ ) || compose;

export const store = createStore<IState, IFluxStandardAction, {}, {}>(
  reducer,
  initialStore,
  composeEnhancers(middleware)
);