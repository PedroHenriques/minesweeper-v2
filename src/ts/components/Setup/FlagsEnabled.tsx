'use strict';
import * as React from 'react';

export interface IFlagsEnabledProps {
  checked: boolean,
  onChange: (event: React.ChangeEvent<HTMLElement>) => void,
}

export class FlagsEnabled extends React.Component<IFlagsEnabledProps, {}> {
  render() {
    return(
      <p key='flags-enabled'>
        <input type='checkbox' id='flags-enabled' onChange={this.props.onChange}
          checked={this.props.checked}/>
        <label htmlFor='flags-enabled'>
          Enable flags
        </label>
      </p>
    );
  }
}