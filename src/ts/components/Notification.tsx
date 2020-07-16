'use strict';
import * as React from 'react';
import { StylishButton } from './StylishButton';

export interface INotificationProps {
  id: string,
  notifText: string,
}

export interface INotificationState {
  hideNotif: boolean,
}

export class Notification extends
React.Component<INotificationProps, INotificationState> {
  constructor(props: INotificationProps) {
    super(props);
    this.state = { hideNotif: false };

    this.handleHide = this.handleHide.bind(this);
  }

  /**
   * Handles hiding the game notification element.
   */
  public handleHide(): void {
    this.setState({ hideNotif: true });
  }

  render() {
    if (this.state.hideNotif) { return(''); }

    return(
      <div id={ this.props.id } className='notification-box'>
        <p>{ this.props.notifText }</p>
        <StylishButton id='notification-ok' text='Ok'
          events={{ onClick: this.handleHide }}/>
      </div>
    );
  }
}