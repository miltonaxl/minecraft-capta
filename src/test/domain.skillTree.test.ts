/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-ignore - vitest types may not be available during linting
import { describe, it, expect } from 'vitest';
import { normalizeSkillTree, canComplete } from '../domain/skillTree';

describe('domain/skillTree', () => {
  it('normalizeSkillTree should create nodesById and rootIds', () => {
    const input = { name: 'Root', children: [{ name: 'Child' }] };
    const { nodesById, rootIds } = normalizeSkillTree(input);
    expect(rootIds.length).toBe(1);
    const rootId = rootIds[0];
    expect(nodesById[rootId].name).toBe('Root');
    expect(nodesById[rootId].childrenIds.length).toBe(1);
  });

  it('canComplete requires all ancestors completed', () => {
    const { nodesById } = normalizeSkillTree({ name: 'A', children: [{ name: 'B' }, { name: 'C' }] });
    // Complete A
    nodesById['0'].completed = true;
    // B should be completable, C too
    expect(canComplete(nodesById, '1')).toBe(true);
    expect(canComplete(nodesById, '2')).toBe(true);
    // Un-complete A
    nodesById['0'].completed = false;
    expect(canComplete(nodesById, '1')).toBe(false);
  });
});