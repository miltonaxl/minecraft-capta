import { describe, it, expect } from 'vitest';
import { renderWithStore } from './utils';
import SkillTree from '../Components/SkillTree/SkillTree';
import userEvent from '@testing-library/user-event';
import { Actions } from '../slice';

function buildStateWithRootAndChildren(count: number) {
  const nodesById: any = {};
  const rootId = 'root';
  nodesById[rootId] = { id: rootId, name: 'Root', description: '', image: '', childrenIds: [], completed: false };
  for (let i = 0; i < count; i++) {
    const id = 'c' + i;
    nodesById[id] = { id, name: 'Child' + i, description: '', image: '', childrenIds: [], parentId: rootId, completed: false };
    nodesById[rootId].childrenIds.push(id);
  }
  return { nodesById, rootIds: [rootId], currentUrl: '', loading: false } as any;
}

describe('SkillTree', () => {
  it('renderiza nodos cuando hay un número impar de hijos', async () => {
    const preloaded = buildStateWithRootAndChildren(3);
    const { container } = renderWithStore(<SkillTree />, { preloadedState: preloaded });
    // Esperar a que ReactFlow monte y pinte nodos
    await new Promise((r) => setTimeout(r, 0));
    const rfNodes = container.querySelectorAll('.react-flow__node');
    expect(rfNodes.length).toBe(4); // root + 3 hijos
  });

  it('renderiza nodos cuando hay un número par de hijos', async () => {
    const preloaded = buildStateWithRootAndChildren(2);
    const { container } = renderWithStore(<SkillTree />, { preloadedState: preloaded });
    // Esperar a que ReactFlow monte y pinte nodos
    await new Promise((r) => setTimeout(r, 0));
    const rfNodes = container.querySelectorAll('.react-flow__node');
    expect(rfNodes.length).toBe(3); // root + 2 hijos
  });

  it('permite completar un nodo cuando sus ancestros están completos', async () => {
    const preloaded = buildStateWithRootAndChildren(1);
    const { store, container } = renderWithStore(<SkillTree />, { preloadedState: preloaded });
    // Completar root
    store.dispatch(Actions.toggleComplete('root'));
    // Esperar re-render tras completar root
    await new Promise((r) => setTimeout(r, 0));
    // Simular click en el hijo usando el alt accesible
    const childImg = container.querySelector('img[alt="Child0"]');
    expect(childImg).toBeTruthy();
    const childIcon = childImg!.parentElement! as HTMLElement;
    await userEvent.click(childIcon);
    // Estado: hijo debe estar completado
    const state = store.getState() as any;
    expect(state.nodesById['c0'].completed).toBe(true);
  });
});