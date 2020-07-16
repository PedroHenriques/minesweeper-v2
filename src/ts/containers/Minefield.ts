'use strict';
import * as React from 'react';
import { Dispatch } from 'redux';
import { connect } from 'react-redux';
import * as Component from '../components/Minefield';
import {
  tileLeftClick, tileBothClick, tileRightClick
} from '../actions/creators';
import { IState, ITile } from '../interfaces/redux';
import { IDimensions, ITileConfig } from '../interfaces/react';

interface IMapStateToProps {
  gameEnded: boolean,
  dimensions: IDimensions,
  minefield: ITileConfig[],
}

interface IMapDispatchToProps {
  handleLeftClick: (tileId: string) => void,
  handleRightClick: (tileId: string) => void,
  handleBothClick: (tileId: string) => void,
}

const mapStateToProps = (state: IState): IMapStateToProps => {
  let numRows: number = 0;
  let numCols: number = 0;
  let minefield: ITile[] = [];

  if (state.minefield.length > 0) {
    minefield = state.minefield.map(tileId => {
      const tile = state.tiles[tileId];
      if (tile.row > numRows) { numRows = tile.row; }
      if (tile.col > numCols) { numCols = tile.col; }

      return({ ...tile });
    });

    numRows++;
    numCols++;
  }

  return({
    gameEnded: state.setup !== null && state.setup.gameEndUTC !== null,
    dimensions: {
      rows: numRows,
      cols: numCols,
    },
    minefield,
  });
};

const mapDispatchToProps = (
  dispatch: Dispatch
): IMapDispatchToProps => {
  return({
    handleLeftClick: (tileId: string): void => {
      dispatch(tileLeftClick(tileId));
    },
    handleRightClick: (tileId: string): void => {
      dispatch(tileRightClick(tileId));
    },
    handleBothClick: (tileId: string): void => {
      dispatch(tileBothClick(tileId));
    },
  });
};

export const Minefield = connect(
  mapStateToProps, mapDispatchToProps
)(Component.Minefield);