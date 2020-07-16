'use strict';
import * as React from 'react';
import { connect } from 'react-redux';
import * as Component from '../components/Header';
import { getMinefieldStats } from '../utils/MinefieldUtils';
import { IState } from '../interfaces/redux';

interface IMapStateToProps {
  minesLeft: number,
  lives: number,
  initialTimer: number,
}

const mapStateToProps = (state: IState): IMapStateToProps => {
  let minesLeft: number = 0;
  let lives: number = 0;
  let initialTimer: number = 0;

  if (state.setup !== null) {
    const minefieldStats = getMinefieldStats(
      state.minefield.map(tileId => state.tiles[tileId])
    );

    minesLeft = minefieldStats.numMines - minefieldStats.numFlags;
    lives = state.setup.numLives - minefieldStats.numLivesLost;
    initialTimer = Date.now() - state.setup.gameStartUTC;
  }

  return({ minesLeft, lives, initialTimer });
};

export const Header = connect(mapStateToProps)(Component.Header);