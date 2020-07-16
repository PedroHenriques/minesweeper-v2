'use strict';
import * as React from 'react';

export interface ITileProps {
  id: string,
  revealed: boolean,
  hasMine: boolean,
  hasFlag: boolean,
  numAdjacentMines: number,
  lastInRow: boolean,
  styles: React.CSSProperties,
  clickHandlers: {
    handleLeftClick: (tileId: string) => void,
    handleRightClick: (tileId: string) => void,
    handleBothClick: (tileId: string) => void,
  },
}

export class Tile extends React.Component<ITileProps, {}> {
  private timeoutId: NodeJS.Timer | null = null;
  private timeoutDuration: number = 500;

  public constructor(props: ITileProps) {
    super(props);

    this.onMouseUp = this.onMouseUp.bind(this);
  }

  /**
   * Handles a mouse up event on a Tile.
   */
  public onMouseUp(releasedButtonCode: number, buttonsCode: number): void {
    if (releasedButtonCode === 0 && buttonsCode === 0) {
      if (this.timeoutId === null) {
        this.props.clickHandlers.handleLeftClick(this.props.id);
      } else {
        global.clearTimeout(this.timeoutId);
        this.timeoutId = null;
        this.props.clickHandlers.handleBothClick(this.props.id);
      }
    } else if (releasedButtonCode === 2 && buttonsCode === 0) {
      if (this.timeoutId === null) {
        this.props.clickHandlers.handleRightClick(this.props.id);
      } else {
        global.clearTimeout(this.timeoutId);
        this.timeoutId = null;
        this.props.clickHandlers.handleBothClick(this.props.id);
      }
    } else if (
      (releasedButtonCode === 0 && buttonsCode === 2) ||
      (releasedButtonCode === 2 && buttonsCode === 1)
    ) {
      this.timeoutId = global.setTimeout(() => {
        this.timeoutId = null;
        this.onMouseUp(releasedButtonCode, 0);
      }, this.timeoutDuration);
    }
    return;
  }

  componentWillUnmount() {
    if (this.timeoutId === null) { return; }
    global.clearTimeout(this.timeoutId);
  }

  render() {
    const classList: string[] = ['tile'];
    let content: string | JSX.Element = '';

    if (this.props.revealed) {
      classList.push('revealed');
      if (this.props.hasFlag) {
        if (this.props.hasMine) {
          classList.push('flag');
        } else {
          classList.push('incorrect-flag');
        }
      } else if (this.props.hasMine) {
        classList.push('mine');
      } else if (this.props.numAdjacentMines > 0) {
        classList.push(`adjacent-${this.props.numAdjacentMines}`);
        content = <span>{`${this.props.numAdjacentMines}`}</span>;
      }
    } else if (this.props.hasFlag) {
      classList.push('flag');
    }
    if (this.props.lastInRow) {
      classList.push('last-in-row');
    }

    return(
      <div id={`tile-${this.props.id}`} className={classList.join(' ')}
        onMouseUp={(e) => { this.onMouseUp(e.button, e.buttons); }}
        onContextMenu={(e) => e.preventDefault()}
        style={this.props.styles}
      >
        { content }
      </div>
    );
  }
}