import React, { PropsWithChildren } from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import reducer from '../slice';
import type { SliceState } from '../slice';

export function renderWithStore(
  ui: React.ReactElement,
  options?: { preloadedState?: Partial<SliceState> }
) {
  const preloaded: SliceState = {
    nodesById: {},
    rootIds: [],
    currentUrl: '',
    loading: false,
    error: undefined,
    ...options?.preloadedState,
  } as SliceState;

  const store = configureStore({ reducer, preloadedState: preloaded });

  function Wrapper({ children }: PropsWithChildren) {
    return <Provider store={store}>{children}</Provider>;
  }

  return {
    store,
    ...render(ui, { wrapper: Wrapper }),
  };
}