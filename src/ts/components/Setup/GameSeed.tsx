'use strict';
import * as React from 'react';

export interface IGameSeedProps {
  value: string,
  onChange: (event: React.ChangeEvent<HTMLElement>) => void,
  onGenerate: () => void,
}

export class GameSeed extends React.Component<IGameSeedProps, {}> {
  render() {
    return(
      <p key='game-seed'>
        Seed:
        <input type='text' id='game-seed' value={this.props.value}
          onChange={this.props.onChange}/>
        <img src={`${BASE_URL}img/dice.png`}
          onClick={this.props.onGenerate} title='Generate new seed!'
          alt='generate new seed'
        />
      </p>
    );
  }
}