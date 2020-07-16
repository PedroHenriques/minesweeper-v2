'use strict';
import * as React from 'react';

export interface IHeaderProps {
  minesLeft: number,
  lives: number,
  gameEnded: boolean,
  initialTimer: number,
}

export interface IHeaderState {
  timer: number,
}

export class Header extends React.Component<IHeaderProps, IHeaderState> {
  private intervalId: NodeJS.Timer | null = null;

  constructor(props: IHeaderProps) {
    super(props);
    this.state = { timer: this.props.initialTimer };
  }

  componentDidUpdate(prevProps: IHeaderProps) {
    if (this.props.initialTimer !== prevProps.initialTimer) {
      this.setState({ timer: this.props.initialTimer });
    }
  }

  componentDidMount() {
    this.intervalId = global.setInterval(() => {
      this.setState(prevState => {
        return({ timer: prevState.timer + 1000 });
      });
    }, 1000);
  }

  componentWillUnmount() {
    if (this.intervalId) { global.clearInterval(this.intervalId); }
  }

  render() {
    if (this.props.gameEnded && this.intervalId) {
      global.clearInterval(this.intervalId);
    }

    const timer = Math.floor(this.state.timer / 1000);
    const timerMinutes: string = `${Math.floor(timer / 60)}`.padStart(2, '0');
    const timerSeconds: string = `${timer % 60}`.padStart(2, '0');

    return(
      <div id='header'>
        <div id='game-timer'>
          <img src={`${BASE_URL}img/timer.png`} alt='game timer'/>
          {`${timerMinutes}:${timerSeconds}`}
        </div>
        <div id='mines-left'>
          <img src={`${BASE_URL}img/mine.png`} alt='mines left'/>
          {this.props.minesLeft}
        </div>
        <div id='lives'>
          <img src={`${BASE_URL}img/lives.png`} alt='lives left'/>
          {this.props.lives}
        </div>
      </div>
    );
  }
}