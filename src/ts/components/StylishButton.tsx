'use strict';
import * as React from 'react';
import { IStylishButtonEvents } from '../interfaces/react';

export interface IStylishButtonProps {
  id: string,
  text: string,
  events: IStylishButtonEvents,
}

export class StylishButton extends React.Component<IStylishButtonProps, {}> {
  render() {
    return(
      <button id={this.props.id} className='stylish-button'
        {...this.props.events}>{this.props.text}</button>
    );
  }
}