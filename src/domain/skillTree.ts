// Domain helpers for Skill Tree
// - Pure functions, no side-effects
// - Easy to unit test

export type MinimalNode = {
    id: string;
    name: string;
    description: string;
    image: string;
    childrenIds: string[];
    parentId?: string;
    completed: boolean;
};

export type NodesById = Record<string, MinimalNode>;

export function normalizeSkillTree(input: unknown): { nodesById: NodesById; rootIds: string[] } {
    const roots = Array.isArray(input) ? (input as any[]) : [input as any];
    const nodesById: NodesById = {};
    const rootIds: string[] = [];
    let nextId = 0;

    const walk = (node: any, parentId?: string): string => {
        const id = String(nextId++);
        nodesById[id] = {
            id,
            name: node.name ?? '',
            description: node.description ?? '',
            image: node.image ?? '',
            childrenIds: [],
            parentId,
            completed: false,
        };
        if (!parentId) rootIds.push(id);
        const children: any[] = Array.isArray(node.children) ? node.children : [];
        for (const child of children) {
            const childId = walk(child, id);
            nodesById[id].childrenIds.push(childId);
        }
        return id;
    };

    for (const r of roots) walk(r);
    return { nodesById, rootIds };
}

export function canComplete(nodesById: NodesById, id: string): boolean {
    const node = nodesById[id];
    if (!node) return false;
    let pid = node.parentId;
    while (pid) {
        const p = nodesById[pid];
        if (!p || !p.completed) return false;
        pid = p.parentId;
    }
    return true;
}