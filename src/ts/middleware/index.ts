'use strict';
import * as Redux from 'redux';
import { gameEndedBlocker } from './gameEndedBlocker';
import { checkIfGameEnded } from './checkIfGameEnded';
import { handleFlags } from './handleFlags';
import { handleRevealTiles } from './handleRevealTiles';
import { handleGenerateMinefield } from './handleGenerateMinefield';
import { requestEndGameCheck } from './requestEndGameCheck';

export const middleware = Redux.applyMiddleware(
  gameEndedBlocker, checkIfGameEnded, handleGenerateMinefield, handleFlags,
  handleRevealTiles, requestEndGameCheck
);