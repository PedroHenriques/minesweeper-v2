'use strict';
import * as React from 'react';
import { Tile } from './Tile';
import { IDimensions, ITileConfig } from '../interfaces/react';

export interface IMinefieldProps {
  gameEnded: boolean,
  dimensions: IDimensions,
  minefield: ITileConfig[],
  handleLeftClick: (tileId: string) => void,
  handleRightClick: (tileId: string) => void,
  handleBothClick: (tileId: string) => void,
}

export interface IMinefieldState {
  smallestViewportDimension: 'width' | 'height',
}

export class Minefield extends
React.Component<IMinefieldProps, IMinefieldState> {
  constructor(props: IMinefieldProps) {
    super(props);
    this.state = { smallestViewportDimension: 'height' };

    this.processResize = this.processResize.bind(this);
  }

  componentDidMount() {
    window.addEventListener('resize', this.processResize);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.processResize);
  }

  private processResize(): void {
    const viewportDimensionDelta = window.innerWidth - window.innerHeight;
    if (
      viewportDimensionDelta < 0 &&
      this.state.smallestViewportDimension === 'height'
    ) {
      this.setState({ smallestViewportDimension: 'width' });
    }
    if (
      viewportDimensionDelta > 0 &&
      this.state.smallestViewportDimension === 'width'
    ) {
      this.setState({ smallestViewportDimension: 'height' });
    }
  }

  render() {
    const tiles: JSX.Element[] = [];
    for (const tile of Object.values(this.props.minefield)) {
      tiles.push(
        <Tile
          key={ tile.id }
          id={ tile.id }
          revealed={ (this.props.gameEnded ? true : tile.revealed) }
          hasMine={ tile.hasMine }
          hasFlag={ tile.hasFlag }
          numAdjacentMines={ tile.numAdjacentMines }
          lastInRow={ tile.col + 1 === this.props.dimensions.cols }
          styles={ {
            gridRow: tile.row + 1,
            gridColumn: tile.col + 1,
          } }
          clickHandlers={ {
            handleLeftClick: this.props.handleLeftClick,
            handleRightClick: this.props.handleRightClick,
            handleBothClick: this.props.handleBothClick,
          } }
        />
      );
    }

    const minefieldStyles: React.CSSProperties = {
      gridAutoRows: `calc(100% / ${this.props.dimensions.rows})`,
      gridAutoColumns: `calc(100% / ${this.props.dimensions.cols})`,
    };

    const classNames: string[] = [`${this.state.smallestViewportDimension}-rf`];
    if (this.props.dimensions.cols > this.props.dimensions.rows) {
      classNames.push('expert');
    }

    return(
      <div id='minefield' className={ classNames.join(' ') }
      style={ minefieldStyles }>
        { tiles }
      </div>
    );
  }
}