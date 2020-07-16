'use strict';
import * as React from 'react';
import { IGameConfig } from '../interfaces/react';
import { Menu } from './App/Menu';
import { Setup } from './Setup';
import { Game } from './Game';

export interface IAppProps {
  gameStarted: boolean,
  gameWon?: boolean,
  startGame: (config: IGameConfig) => void,
  resetGame: () => void,
  endGame: () => void,
  newGame: () => void,
}

export class App extends React.Component<IAppProps, {}> {
  public constructor(props: IAppProps) {
    super(props);

    this.handleNewGame = this.handleNewGame.bind(this);
    this.handleStart = this.handleStart.bind(this);
  }

  /**
   * Handles clicks on the "New Game" button.
   */
  public handleNewGame(): void {
    this.props.newGame();
  }

  /**
   * Handles clicks on the "Start Game" button.
   */
  public handleStart(config: IGameConfig): void {
    this.props.startGame(config);
  }

  render() {
    const children: JSX.Element[] = [];
    if (this.props.gameStarted) {
      children.push(
        <Menu
          key='menu' onNewGame={this.handleNewGame}
          onResetGame={this.props.resetGame}
        />
      );
      children.push(
        <Game key='game' gameWon={this.props.gameWon} />
      );
    } else {
      children.push(<Setup key='setup' onStart={this.handleStart}/>);
    }

    return(
      <div id='app'>
        {children}
      </div>
    );
  }
}