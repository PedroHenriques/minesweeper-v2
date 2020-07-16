'use strict';
require('core-js/stable');
require('regenerator-runtime/runtime');
import * as React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { App } from './containers/App';
import { store } from './store';
import '../scss/index.scss';

render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('app-container')
);