'use strict';
import { combineReducers } from 'redux';
import { setup } from './setup';
import { minefield } from './minefield';
import { tiles } from './tiles';
import { IState } from '../interfaces/redux';

export const reducer = combineReducers<IState>({ setup, minefield, tiles });