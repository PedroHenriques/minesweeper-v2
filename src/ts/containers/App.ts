'use strict';
import * as React from 'react';
import { Dispatch } from 'redux';
import { connect } from 'react-redux';
import * as Component from '../components/App';
import {
  generateMinefield, endGame, showNewGameSetup
} from '../actions/creators';
import { getGameState } from '../utils/MinefieldUtils';
import { GAME_WON } from '../data';
import { IState } from '../interfaces/redux';
import { IGameConfig } from '../interfaces/react';

interface IMapStateToProps {
  gameStarted: boolean,
  gameWon?: boolean,
}

interface IMapDispatchToProps {
  startGame: (config: IGameConfig) => void,
  resetGame: () => void,
  endGame: () => void,
  newGame: () => void,
}

const mapStateToProps = (state: IState): IMapStateToProps => {
  let gameWon: boolean | undefined;
  if (state.setup && state.setup.gameEndUTC !== null) {
    const minefield = state.minefield.map(tileId => state.tiles[tileId]);
    gameWon = getGameState(minefield, state.setup.numLives) === GAME_WON;
  }

  return({
    gameStarted: (state.setup !== null),
    gameWon
  });
};

const mapDispatchToProps = (dispatch: Dispatch): IMapDispatchToProps => {
  return({
    startGame: (config: IGameConfig): void => {
      dispatch(generateMinefield({ ...config }));
    },
    resetGame: (): void => { dispatch(generateMinefield(null)); },
    endGame: (): void => { dispatch(endGame()); },
    newGame: (): void => { dispatch(showNewGameSetup()); },
  });
};

export const App = connect(
  mapStateToProps, mapDispatchToProps
)(Component.App);