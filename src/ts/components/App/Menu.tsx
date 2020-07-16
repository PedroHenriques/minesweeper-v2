'use strict';
import * as React from 'react';
import { StylishButton } from '../StylishButton';

export interface IMenuProps {
  onNewGame: () => void,
  onResetGame: () => void,
}

export class Menu extends React.Component<IMenuProps, {}> {
  render() {
    return(
      <div id='menu'>
        <StylishButton id='new-game-button' text='New Game'
          events={{ onClick: this.props.onNewGame }}/>
        <StylishButton id='reset-game-button' text='Reset Game'
          events={{ onClick: this.props.onResetGame }}/>
        <a href='https://github.com/PedroHenriques/minesweeper-v2' target='_blank'
          className='github-link'>Source Code</a>
      </div>
    );
  }
}