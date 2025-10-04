import { useEffect, useMemo, useState, useCallback, memo } from 'react';
import { Actions, fetchSkillTree, parseUrlFromLocation } from '../../slice';
import { useAppDispatch, useAppSelector } from '../../store';
import { canComplete as canCompleteDomain } from '../../domain/skillTree';
import styles from './SkillTree.module.css';
import ReactFlow, { Node as RFNode, Edge as RFEdge, NodeProps, Position, Handle, ReactFlowInstance } from 'reactflow';
import 'reactflow/dist/style.css';

function SkillNodeRF({ data }: NodeProps<{ nid: string; name: string; description: string; image: string; completed: boolean; canComplete: boolean }>) {
  const [hover, setHover] = useState(false);

  return (
    <div
      className={`${styles.node} ${data.completed ? styles.completed : ''} ${data.canComplete ? styles.enabled : styles.disabled}`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      title={`${data.name}\n${data.description}`}
    >
      <Handle type="target" position={Position.Left} />
      <div
        className={`${styles.icon} ${data.canComplete ? styles.enabled : styles.disabled}`}
        title={`${data.name}\n${data.description}`}
      >
        <img src={data.image} alt={data.name} title={`${data.name} - ${data.description}`} />
      </div>
      <Handle type="source" position={Position.Right} />
      {hover && (
        <div className={styles.tooltip}>
          <strong>{data.name}</strong>
          <p>{data.description}</p>
        </div>
      )}
    </div>
  );
}

const SkillNodeRFComp = memo(SkillNodeRF);

function SkillTree() {
  const dispatch = useAppDispatch();
  const { rootIds, currentUrl, loading, error, nodesById } = useAppSelector((s) => s);
  const [rfInstance, setRfInstance] = useState<ReactFlowInstance | null>(null);

  useEffect(() => {
    dispatch(parseUrlFromLocation());
  }, [dispatch]);

  useEffect(() => {
    if (currentUrl) dispatch(fetchSkillTree(currentUrl));
  }, [dispatch, currentUrl]);

  const { rfNodes, rfEdges } = useMemo(() => {
    const rfNodes: RFNode[] = [];
    const rfEdges: RFEdge[] = [];
    const visited = new Set<string>();
    const queue = [...rootIds];

    const layerSpacing = 180;
    const rowSpacing = 100;

    const levels: Record<string, number> = {};
    const yIndexById: Record<string, number> = {};
    const nextRowByLevel: Record<number, number> = {};

    while (queue.length) {
      const id = queue.shift()!;
      if (visited.has(id)) continue;
      visited.add(id);
      const n = nodesById[id];
      const level = levels[id] ?? 0;

      let yIndex = yIndexById[id];
      if (yIndex === undefined) {
        const next = nextRowByLevel[level] ?? 0;
        yIndex = next;
        yIndexById[id] = yIndex;
        nextRowByLevel[level] = next + 1;
      }

      const canComplete = canCompleteDomain(nodesById as any, id);

      rfNodes.push({
        id,
        position: { x: level * layerSpacing, y: yIndex * rowSpacing },
        data: {
          nid: id,
          name: n.name,
          description: n.description,
          image: n.image,
          completed: n.completed,
          canComplete,
        },
        type: 'skillNode',
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
      });

      const childLevel = level + 1;
      nextRowByLevel[childLevel] = Math.max(nextRowByLevel[childLevel] ?? 0, yIndex);

      for (const cid of n.childrenIds) {
        if (!(cid in levels)) levels[cid] = childLevel;
        if (yIndexById[cid] === undefined) {
          const start = nextRowByLevel[childLevel] ?? 0;
          yIndexById[cid] = start;
          nextRowByLevel[childLevel] = start + 1;
        }
        rfEdges.push({
          id: `e-${id}-${cid}`,
          source: id,
          target: cid,
          type: 'step',
          style: { stroke: '#ffffff', strokeWidth: 4 },
        });
        queue.push(cid);
      }
    }

    return { rfNodes, rfEdges };
  }, [nodesById, rootIds]);

  const nodeTypes = useMemo(() => ({ skillNode: SkillNodeRFComp }), []);

  const handleNodeClickRF = useCallback((_: any, n: RFNode) => {
    const node = nodesById[n.id];
    if (!node) return;
    // Permite desmarcar siempre; para marcar necesita canComplete
    const allowed = node.completed || canCompleteDomain(nodesById as any, n.id);
    if (allowed) dispatch(Actions.toggleComplete(n.id));
  }, [dispatch, nodesById]);

  // Ajusta la vista automáticamente cuando los nodos están listos
  useEffect(() => {
    if (rfInstance && rfNodes.length > 0) {
      rfInstance.fitView({ padding: 0.1 });
    }
  }, [rfInstance, rfNodes.length]);

  useEffect(() => {
    const onResize = () => {
      if (rfInstance) rfInstance.fitView({ padding: 0.1 });
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [rfInstance]);

  return (
    <div className={styles.tree}>
      {loading && <div className={styles.status}>Cargando...</div>}
      {error && <div className={`${styles.status} ${styles.error}`}>Error: {error}</div>}
      {!loading && !error && (
        <div className={styles.roots}>
          <div style={{ width: '100%', height: '100%' }}>
            <ReactFlow
              style={{ background: 'transparent' }}
              nodes={rfNodes}
              edges={rfEdges}
              fitView
              nodesDraggable={false}
              nodesConnectable={false}
              elementsSelectable={false}
              selectionOnDrag={false}
              panOnDrag={false}
              panOnScroll={false}
              zoomOnScroll={false}
              zoomOnPinch={false}
              zoomOnDoubleClick={false}
              minZoom={0.05}
                maxZoom={2}
                nodeTypes={nodeTypes}
                onInit={(inst) => setRfInstance(inst)}
                onNodeClick={handleNodeClickRF}
              >
            </ReactFlow>
          </div>
        </div>
      )}
    </div>
  );
}

export default SkillTree;
