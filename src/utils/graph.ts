export function generateId() {
  return Math.random().toString(36).slice(2, 9);
}

export const NODE_TYPES = {
  TRIGGER: "trigger",
  ACTION: "action",
  OUTPUT: "output",
};

export const NODE_DEFAULTS = {
  [NODE_TYPES.TRIGGER]: {
    label: "Trigger",
    color: "var(--trigger)",
    dimColor: "var(--trigger-dim)",
    glowColor: "var(--trigger-glow)",
    hasInput: false,
    hasOutput: true,
    icon: "⚡",
  },
  [NODE_TYPES.ACTION]: {
    label: "Action",
    color: "var(--action)",
    dimColor: "var(--action-dim)",
    glowColor: "var(--action-glow)",
    hasInput: true,
    hasOutput: true,
    icon: "⚙",
  },
  [NODE_TYPES.OUTPUT]: {
    label: "Output",
    color: "var(--output)",
    dimColor: "var(--output-dim)",
    glowColor: "var(--output-glow)",
    hasInput: true,
    hasOutput: false,
    icon: "◉",
  },
};

export function createNode({
  type,
  position,
}: {
  type: string;
  position: { x: number; y: number };
}) {
  return {
    id: generateId(),
    type,
    label: NODE_DEFAULTS[type].label,
    x: position.x,
    y: position.y,
  };
}

/**
 * Validates whether a connection from sourceId to targetId is legal.
 * Rules:
 * - No self-loops
 * - Trigger nodes cannot receive input
 * - Output nodes cannot produce output
 * - No duplicate edges
 * - No cycles (DAG only)
 */
export function validateConnection({
  sourceId,
  targetId,
  sourceType,
  targetType,
  edges,
}: {
  sourceId: string;
  targetId: string;
  sourceType: string;
  targetType: string;
  edges: { source: string; target: string }[];
}) {
  if (sourceId === targetId)
    return { valid: false, reason: "Cannot connect a node to itself" };
  if (targetType === NODE_TYPES.TRIGGER)
    return { valid: false, reason: "Trigger nodes cannot receive connections" };
  if (sourceType === NODE_TYPES.OUTPUT)
    return {
      valid: false,
      reason: "Output nodes cannot have outgoing connections",
    };

  const duplicate = edges.some(
    (e) => e.source === sourceId && e.target === targetId,
  );
  if (duplicate) return { valid: false, reason: "Connection already exists" };

  // Cycle detection: BFS from targetId; if we can reach sourceId, adding this edge creates a cycle
  const adjacency: Record<string, string[]> = {};
  for (const e of edges) {
    if (!adjacency[e.source]) adjacency[e.source] = [];
    adjacency[e.source].push(e.target);
  }
  const visited = new Set<string>();
  const queue: string[] = [targetId];
  while (queue.length > 0) {
    const node = queue.shift();
    if (!node) continue;
    if (node === sourceId)
      return { valid: false, reason: "Connection would create a cycle" };
    if (!visited.has(node)) {
      visited.add(node);
      (adjacency[node] || []).forEach((nextNode) => queue.push(nextNode));
    }
  }

  return { valid: true };
}

export function serializeGraph({
  nodes,
  edges,
}: {
  nodes: any[];
  edges: any[];
}) {
  return JSON.stringify({ nodes, edges }, null, 2);
}
