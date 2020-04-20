import { useContext, useState, useRef, SetStateAction, useMemo } from 'react';
import get from 'lodash/get';
import set from 'lodash/set';
import has from 'lodash/has';
import { isBackend } from './utils';
import { UssrContext } from './Ussr';

type useUssrEffectInterface = [unknown, SetStateAction<unknown>, (cb: () => unknown) => void];

interface UssrState {
  state: unknown;
  setState: SetStateAction<unknown>;
}

export const useUssrState = (key: string, defaultValue: unknown): [unknown, SetStateAction<unknown>] => {
  const hook = useRef<false | UssrState>(false);
  const { loading, initState } = useContext(UssrContext);
  
  const loaded = !loading;
  const isClient = !isBackend();
  const hookIsNotReady = hook.current === false;
  
  const setOnTheClient = isClient && loaded && hookIsNotReady;
  
  if (setOnTheClient && has(initState, key) && process.env.NODE_ENV !== 'production') {
    /* eslint-disable no-console */
    console.error('key should be unique!');
    /* eslint-disable no-console */
    console.error(`The key "${key}" is already exist in InitialState`);
  }
  
  const appStateFragment = useMemo(() => get(initState, key, defaultValue), []);
  const [state, setState] = useState(appStateFragment);
  
  if (!hook.current) {
    hook.current = {
      state,
      setState: (componentState: unknown, skip: boolean): void => {
        const s = typeof componentState === 'function' ? componentState(state) : componentState;
        set(initState, key, s);
  
        if (!skip) {
          setState(s);
        }
      }
    };
  }
  
  return [hook.current.state, hook.current.setState];
};

export const useWillMount = (cb: () => Promise<unknown>): void => {
  const { addEffect, loading, ignoreWillMount } = useContext(UssrContext);
  const loaded = !loading;
  const isClient = !isBackend();
  const onLoadOnTheClient = isClient && loaded && typeof cb === 'function';
  const onLoadOnTheBackend = isBackend() && typeof cb === 'function';
  
  if (ignoreWillMount) {
    return;
  }
  
  if (onLoadOnTheClient) {
    cb();
  } else if (onLoadOnTheBackend) {
    const effect = cb();
    const isEffect = typeof effect.then === 'function';
    if (isBackend() && isEffect) {
      addEffect(effect);
    }
  }
};

export const useApplyEffects = (cb: () => Promise<unknown> | Promise<unknown>[]): void => {
  const { addEffect } = useContext(UssrContext);
  const onLoadOnTheBackend = isBackend() && typeof cb === 'function';
  if (onLoadOnTheBackend) {
    const effect = cb();
    if (Array.isArray(effect)) {
      effect.forEach((e) => {
        const isEffect = typeof e.then === 'function';
        if (isBackend() && isEffect) {
          addEffect(e);
        }
      });
    } else {
      const isEffect = typeof effect.then === 'function';
      if (isBackend() && isEffect) {
        addEffect(effect);
      }
    }
  }
};

export const useUssrEffect = (key: string, defaultValue: unknown): useUssrEffectInterface => {
  const initHook = useRef(true);
  const { initState, addEffect, loading, ignoreWillMount } = useContext(UssrContext);
  
  const loaded = !loading;
  const isClient = !isBackend();
  const setOnTheClient = isClient && loaded && initHook.current;
  
  if (setOnTheClient && has(initState, key) && process.env.NODE_ENV !== 'production') {
    /* eslint-disable no-console */
    console.error('key should be unique!');
    /* eslint-disable no-console */
    console.error(`The key "${key}" is already exist in InitialState`);
  }
  
  const appStateFragment = get(initState, key, defaultValue);
  const [state, _setState] = useState(appStateFragment);
  
  const setState = (componentState: unknown, skip: boolean): void => {
    set(initState, key, componentState);
    
    if (!skip) {
      _setState(componentState);
    }
  };
  
  const willMount = (cb: () => Promise<unknown>): void => {
    if (ignoreWillMount) {
      return;
    }
    const onLoadOnTheClient = isClient && loaded && initHook.current && typeof cb === 'function';
    const onLoadOnTheBackend = isBackend() && typeof cb === 'function';
  
    initHook.current = false;
    
    if (onLoadOnTheClient) {
      cb();
    } else if (onLoadOnTheBackend) {
      const effect = cb();
      const isEffect = typeof effect.then === 'function';
      if (isBackend() && isEffect) {
        addEffect(effect);
      }
    }
  };
  
  return [
    state,
    setState,
    willMount
  ];
};
