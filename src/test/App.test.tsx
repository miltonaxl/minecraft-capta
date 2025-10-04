import { describe, it, expect } from 'vitest';
import { renderWithStore } from './utils';
import App from '../App';

describe('App', () => {
  it('renderiza el título y el contenedor', () => {
    const { getByText } = renderWithStore(<App />);
    expect(getByText('Minecraft')).toBeTruthy();
  });
});