import '@testing-library/jest-dom';

// Mock de window.location sin parámetro ?json para evitar fetch automático en tests
const url = new URL('http://localhost/');
Object.defineProperty(window, 'location', {
  value: url,
  writable: true,
});

// Polyfill mínimo para ResizeObserver requerido por ReactFlow en entorno jsdom
// Evita errores durante el render de componentes que lo usan
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};