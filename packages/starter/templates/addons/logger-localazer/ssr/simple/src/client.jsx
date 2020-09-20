import React from 'react';
import { hydrate } from 'react-dom';
import createUssr from '@rockpack/ussr';
import { LocalizationObserver, getDefaultLocale } from '@rockpack/localazer';
import App from './App';

const [, Ussr] = createUssr(window.USSR_DATA);

hydrate(
  <Ussr>
    <LocalizationObserver active="en" languages={{ en: getDefaultLocale() }}>
      <App />
    </LocalizationObserver>
  </Ussr>,
  document.getElementById('root')
);
