'use strict';
import * as React from 'react';
import { IGameConfig } from '../interfaces/react';
import { GameModes } from '../types/redux';
import * as Data from '../data';
import { Difficulty } from './Setup/Difficulty';
import { FlagsEnabled } from './Setup/FlagsEnabled';
import { NumberLives } from './Setup/NumberLives';
import { GameSeed } from './Setup/GameSeed';
import { StylishButton } from './StylishButton';
import * as Utils from '../utils/SetupUtils';

export interface ISetupProps {
  onStart: (gameConfig: IGameConfig) => void,
}

export interface ISetupState {
  difficulty: number,
  flagsEnabled: boolean,
  numLives: number,
  gameSeed: string,
  gameMode: GameModes,
}

export class Setup extends React.Component<ISetupProps, ISetupState> {
  constructor(props: ISetupProps) {
    super(props);

    this.state = {
      difficulty: 0,
      flagsEnabled: true,
      numLives: 1,
      gameSeed: Utils.generateSeed(),
      gameMode: 'classic',
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleStart = this.handleStart.bind(this);
    this.handleGenerateSeed = this.handleGenerateSeed.bind(this);
  }

  /**
   * Handles changes to the configuration html elements.
   */
  public handleChange(event: React.ChangeEvent<HTMLElement>): void {
    switch (event.target.id) {
      case 'difficulty':
        if ((event.target as HTMLSelectElement).selectedIndex === undefined) {
          return;
        }
        const selectedIndex = (event.target as HTMLSelectElement).selectedIndex;
        if (Data.difficulties[selectedIndex] === undefined) {
          return;
        }
        this.setState({ difficulty: selectedIndex });
        break;

      case 'flags-enabled':
        if ((event.target as HTMLInputElement).checked === undefined) {
          return;
        }
        this.setState({
          flagsEnabled: (event.target as HTMLInputElement).checked,
        });
        break;

      case 'number-lives':
        if (
          (event.target as HTMLInputElement).type !== 'number' &&
          (event.target as HTMLInputElement).type !== 'text'
        ) {
          return;
        }
        const numLives = parseInt((event.target as HTMLInputElement).value, 10);
        if (numLives < 1) {
          return;
        }
        this.setState({ numLives });
        break;

      case 'game-seed':
        if ((event.target as HTMLInputElement).type !== 'text') {
          return;
        }
        this.setState({ gameSeed: (event.target as HTMLInputElement).value });
        break;

      default:
        return;
    }
  }

  /**
   * Handles a click on the "Start Game" button.
   */
  public handleStart(): void {
    this.props.onStart({
      numMines: Data.difficulties[this.state.difficulty].mines,
      dimensions: {
        rows: Data.difficulties[this.state.difficulty].rows,
        cols: Data.difficulties[this.state.difficulty].cols
      },
      flagsEnabled: this.state.flagsEnabled,
      numLives: this.state.numLives,
      gameSeed: this.state.gameSeed,
      gameMode: this.state.gameMode,
    });
  }

  /**
   * Handles a call for a new game seed.
   */
  public handleGenerateSeed(): void {
    this.setState({ gameSeed: Utils.generateSeed() });
  }

  render() {
    return(
      <div id='setup'>
        <Difficulty
          value={ this.state.difficulty } onChange={ this.handleChange }
        />
        <FlagsEnabled
          checked={ this.state.flagsEnabled } onChange={ this.handleChange }
        />
        <NumberLives
          value={ this.state.numLives } onChange={ this.handleChange }
        />
        <GameSeed
          value={ this.state.gameSeed } onChange={ this.handleChange }
          onGenerate={this.handleGenerateSeed}
        />
        <StylishButton
          id='start-button' text='Start Game'
          events={{ onClick: this.handleStart }}
        />
      </div>
    );
  }
}