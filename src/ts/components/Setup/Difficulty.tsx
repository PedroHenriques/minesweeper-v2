'use strict';
import * as React from 'react';
import * as Data from '../../data';

export interface IDifficultyProps {
  value: number,
  onChange: (event: React.ChangeEvent<HTMLElement>) => void,
}

export class Difficulty extends React.Component<IDifficultyProps, {}> {
  render() {
    const difficultyOptions: JSX.Element[] = [];
    Data.difficulties.forEach((optionData, index) => {
      const text = `${optionData.name} (${optionData.rows}x` +
        `${optionData.cols} - ${optionData.mines} mines)`;
      difficultyOptions.push(<option key={index} value={index}>{text}</option>);
    });

    return(
      <p key='difficulty'>
        Difficulty:
        <select id='difficulty' value={this.props.value}
          onChange={this.props.onChange}
        >
          {difficultyOptions}
        </select>
      </p>
    );
  }
}