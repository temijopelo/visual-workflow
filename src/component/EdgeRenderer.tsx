import { NODE_DEFAULTS } from "../utils/graph";

const NODE_WIDTH = 180;
const NODE_HEIGHT = 64;

function getPortCenter({
  node,
  side,
}: {
  node: any;
  side: "input" | "output";
}) {
  if (side === "output") {
    return { x: node.x + NODE_WIDTH, y: node.y + NODE_HEIGHT / 2 };
  }
  return { x: node.x, y: node.y + NODE_HEIGHT / 2 };
}

/**
 * Generates a smooth cubic bezier path between two points.
 * The curve bends horizontally for left-to-right connections.
 */
function cubicPath({
  x1,
  y1,
  x2,
  y2,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}) {
  const dx = Math.abs(x2 - x1);
  const controlOffset = Math.max(80, dx * 0.5);
  const cx1 = x1 + controlOffset;
  const cy1 = y1;
  const cx2 = x2 - controlOffset;
  const cy2 = y2;
  return `M ${x1} ${y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2} ${y2}`;
}

export default function EdgeRenderer({
  edges,
  nodes,
  pendingEdge,
  onEdgeClick,
}: {
  edges: any[];
  nodes: any[];
  pendingEdge: any;
  onEdgeClick: (id: string) => void;
}) {
  const nodeMap: Record<string, any> = {};
  for (const n of nodes) nodeMap[n.id] = n;

  return (
    <g className="edges-layer">
      {/* Rendered edges */}
      {edges.map((edge) => {
        const src = nodeMap[edge.source];
        const tgt = nodeMap[edge.target];
        if (!src || !tgt) return null;

        const from = getPortCenter({ node: src, side: "output" });
        const to = getPortCenter({ node: tgt, side: "input" });
        const path = cubicPath({ x1: from.x, y1: from.y, x2: to.x, y2: to.y });

        // Color gradient based on source node type
        const srcColor = NODE_DEFAULTS[src.type].color;
        const tgtColor = NODE_DEFAULTS[tgt.type].color;
        const gradId = `grad-${edge.id}`;

        return (
          <g key={edge.id} className="edge-group">
            <defs>
              <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={srcColor} stopOpacity={0.9} />
                <stop offset="100%" stopColor={tgtColor} stopOpacity={0.9} />
              </linearGradient>
            </defs>
            {/* Wide invisible hit area for clicking */}
            <path
              d={path}
              fill="none"
              stroke="transparent"
              strokeWidth={16}
              style={{ cursor: "pointer" }}
              onClick={() => onEdgeClick(edge.id)}
            />
            {/* Visible edge */}
            <path
              d={path}
              fill="none"
              stroke={`url(#${gradId})`}
              strokeWidth={2}
              strokeLinecap="round"
              style={{ pointerEvents: "none" }}
            />
            {/* Animated flow dot */}
            <circle
              r={3}
              fill={srcColor}
              opacity={0.85}
              style={{ pointerEvents: "none" }}
            >
              <animateMotion dur="2s" repeatCount="indefinite" path={path} />
            </circle>
            {/* Arrowhead at target */}
            <ArrowHead
              to={to}
              from={getPortCenter({ node: src, side: "output" })}
              color={tgtColor}
            />
          </g>
        );
      })}

      {/* Pending/in-progress connection */}
      {pendingEdge && (
        <path
          d={cubicPath({
            x1: pendingEdge.x1,
            y1: pendingEdge.y1,
            x2: pendingEdge.x2,
            y2: pendingEdge.y2,
          })}
          fill="none"
          stroke="var(--text-dim)"
          strokeWidth={1.5}
          strokeDasharray="6 4"
          strokeLinecap="round"
          style={{ pointerEvents: "none" }}
        />
      )}
    </g>
  );
}

function ArrowHead({
  to,
  from,
  color,
}: {
  to: { x: number; y: number };
  from: { x: number; y: number };
  color: string;
}) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const angle = Math.atan2(dy, dx) * (180 / Math.PI);
  return (
    <polygon
      points="-6,-4 0,0 -6,4"
      fill={color}
      transform={`translate(${to.x}, ${to.y}) rotate(${angle})`}
      style={{ pointerEvents: "none" }}
    />
  );
}
