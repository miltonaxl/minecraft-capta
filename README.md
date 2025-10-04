# Minecraft Skill Tree

Aplicación web que visualiza y gestiona un árbol de habilidades inspirado en Minecraft. Usa React + Vite, Redux Toolkit para estado global y ReactFlow para el layout y renderizado de nodos y aristas.

- Stack: React 18, Redux Toolkit, ReactFlow, TypeScript, Vite.
- Tests: Vitest + Testing Library (jsdom), con polyfills en `src/test/setup.ts`.

## Características
- Visualización de nodos con ReactFlow y aristas tipo "step".
- Tooltips y estados visuales (habilitado, deshabilitado, completado).
- Lógica de completado: solo se puede completar un nodo si sus ancestros están completos.
- Deselección en cascada: al desmarcar un padre se desmarcan todos sus descendientes.
- Fondo global ajustable en `src/index.css` y overlay interior en `src/App.module.css`.

## Scripts
- Iniciar en desarrollo: `npm run start`
- Compilar producción: `npm run build`
- Previsualizar build: `npm run preview`
- Tests unitarios: `npm run test` (con `--run` en CI)
- Cobertura: `npm run test:coverage`
- Lint: `npm run lint`
- Formateo: `npm run format`

Requisitos: Node.js 18+ y npm. Instala dependencias con `npm ci` o `npm install`.

## Ejecución local
1. `npm i`
2. `npm run start`
3. Abre el enlace que muestra Vite (por defecto http://localhost:5173).

## Pruebas
- Ejecuta: `npm run test`
- En CI se usa `npm run test -- --run` para modo no-watch.
- Se incluye un polyfill de `ResizeObserver` en `src/test/setup.ts` para compatibilidad con ReactFlow en jsdom.

## CI
Se incluye GitHub Actions en `.github/workflows/tests.yml` que:
- Instala dependencias con `npm ci`.
- Ejecuta Vitest en modo `--run` en Node 18.

## Estructura
- `src/Components/SkillTree/SkillTree.tsx`: Render del árbol (nodos/edges) y manejo de eventos.
- `src/slice.ts`: Estado global, acciones (incluye deselección en cascada).
- `src/domain/skillTree.ts`: Reglas de negocio (p.ej. `canComplete`).
- `src/test/`: Pruebas de componentes y dominio, utilidades y setup.
- `public/`: recursos estáticos (p.ej. `Background.jpg`).

## Notas de estilo
- Fondo global configurable en `src/index.css` (actualmente `#e6e6e6`).
- Overlay para mejorar contraste en el área interna (ReactFlow) en `src/App.module.css`.
- Opacidad de nodos deshabilitados ajustada en `SkillTree.module.css`.

