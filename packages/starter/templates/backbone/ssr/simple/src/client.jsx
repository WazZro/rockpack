import React from 'react';
import { hydrate } from 'react-dom';
import createUssr from '@rockpack/ussr';
import { App } from './App';

const [, Ussr] = createUssr(window.USSR_DATA);

hydrate(
  <Ussr>
    <App />
  </Ussr>,
  document.getElementById('root')
);
