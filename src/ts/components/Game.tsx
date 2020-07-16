'use strict';
import * as React from 'react';
import { Header } from '../containers/Header';
import { Minefield } from '../containers/Minefield';
import { Notification } from './Notification';

export interface IGameProps {
  gameWon?: boolean,
}

export class Game extends React.Component<IGameProps, {}> {
  public constructor(props: IGameProps) {
    super(props);

    this.getNotification = this.getNotification.bind(this);
  }

  /**
   * Returns any notifications to be displayed.
   */
  private getNotification(): string {
    if (this.props.gameWon) { return('Congratulations!'); }
    return('Game Over!');
  }

  render() {
    let notification: string | JSX.Element = '';
    if (this.props.gameWon !== undefined) {
      notification = <Notification id='game-notifs'
        notifText={this.getNotification()}/>;
    }

    return(
      <div id='game'>
        {notification}
        <Header gameEnded={this.props.gameWon !== undefined}/>
        <Minefield />
      </div>
    );
  }
}