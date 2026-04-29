import { useRef, useCallback } from "react";
import type { MouseEvent } from "react";
import { NODE_DEFAULTS } from "../utils/graph";
import type { WorkflowNodeProps } from "../types";

const PORT_RADIUS = 7;

export default function WorkflowNode({
  node,
  zoom,
  isSelected,
  onSelect,
  onPositionChange,
  onConnectionStart,
  onConnectionEnd,
  onPortHover,
  connectingFrom,
}: WorkflowNodeProps) {
  const dragStart = useRef<{
    mx: number;
    my: number;
    nx: number;
    ny: number;
  } | null>(null);
  const defaults = NODE_DEFAULTS[node.type];

  const handleMouseDown = useCallback(
    (e: MouseEvent<SVGGElement>) => {
      if ((e.target as Element).closest(".port")) return; // let port handle it
      e.stopPropagation();
      onSelect(node.id);
      dragStart.current = {
        mx: e.clientX,
        my: e.clientY,
        nx: node.x,
        ny: node.y,
      };

      const onMove = (me: MouseEvent) => {
        if (!dragStart.current) return;
        const dx = (me.clientX - dragStart.current.mx) / zoom;
        const dy = (me.clientY - dragStart.current.my) / zoom;
        onPositionChange(node.id, {
          x: dragStart.current.nx + dx,
          y: dragStart.current.ny + dy,
        });
      };

      const onUp = () => {
        dragStart.current = null;
        window.removeEventListener("mousemove", onMove as any);
        window.removeEventListener("mouseup", onUp);
      };

      window.addEventListener("mousemove", onMove as any);
      window.addEventListener("mouseup", onUp);
    },
    [node, zoom, onSelect, onPositionChange],
  );

  // Port center positions relative to the node's top-left (in canvas coords)
  // Input port: left center; Output port: right center
  const nodeHeight = 64;
  const nodeWidth = 180;

  const inputPortPos = { x: 0, y: nodeHeight / 2 };
  const outputPortPos = { x: nodeWidth, y: nodeHeight / 2 };

  const handleOutputMouseDown = useCallback(
    (e: MouseEvent<SVGGElement>) => {
      e.stopPropagation();
      e.preventDefault();
      const portScreenX = node.x + outputPortPos.x;
      const portScreenY = node.y + outputPortPos.y;
      onConnectionStart(node.id, "output", { x: portScreenX, y: portScreenY });
    },
    [node, onConnectionStart, outputPortPos],
  );

  const handleInputMouseUp = useCallback(
    (e: MouseEvent<SVGGElement>) => {
      e.stopPropagation();
      if (connectingFrom && connectingFrom.nodeId !== node.id) {
        onConnectionEnd(node.id, "input");
      }
    },
    [connectingFrom, node.id, onConnectionEnd],
  );

  const isConnectionTarget =
    connectingFrom && connectingFrom.nodeId !== node.id && defaults.hasInput;
  const isConnectionSource =
    connectingFrom && connectingFrom.nodeId === node.id;

  return (
    <g
      className={`workflow-node-group`}
      transform={`translate(${node.x}, ${node.y})`}
      onMouseDown={handleMouseDown}
    >
      {/* Selection ring */}
      {isSelected && (
        <rect
          x={-4}
          y={-4}
          width={nodeWidth + 8}
          height={nodeHeight + 8}
          rx={12}
          fill="none"
          stroke={defaults.color}
          strokeWidth={1.5}
          opacity={0.5}
          strokeDasharray="4 3"
          className="selection-ring"
        />
      )}

      {/* Node body */}
      <rect
        x={0}
        y={0}
        width={nodeWidth}
        height={nodeHeight}
        rx={8}
        fill="var(--surface2)"
        stroke={isSelected ? defaults.color : "var(--border)"}
        strokeWidth={isSelected ? 1.5 : 1}
        style={{
          filter: isSelected
            ? `drop-shadow(0 0 8px ${defaults.glowColor})`
            : "none",
        }}
      />

      {/* Type accent bar */}
      <rect
        x={0}
        y={0}
        width={4}
        height={nodeHeight}
        rx={2}
        fill={defaults.color}
      />

      {/* Icon */}
      <text
        x={20}
        y={nodeHeight / 2}
        dominantBaseline="middle"
        fontSize={16}
        style={{ userSelect: "none", fontFamily: "var(--font-display)" }}
      >
        {defaults.icon}
      </text>

      {/* Type label */}
      <text
        x={40}
        y={nodeHeight / 2 - 10}
        fill={defaults.color}
        fontSize={9}
        fontFamily="var(--font-mono)"
        fontWeight={600}
        letterSpacing={1.5}
        style={{ textTransform: "uppercase", userSelect: "none" }}
      >
        {node.type}
      </text>

      {/* Node label */}
      <text
        x={40}
        y={nodeHeight / 2 + 6}
        fill="var(--text)"
        fontSize={13}
        fontFamily="var(--font-display)"
        fontWeight={500}
        style={{ userSelect: "none" }}
      >
        {node.label.length > 16 ? node.label.slice(0, 15) + "…" : node.label}
      </text>

      {/* Input port */}
      {defaults.hasInput && (
        <g
          className="port port-input"
          transform={`translate(${inputPortPos.x}, ${inputPortPos.y})`}
          onMouseUp={handleInputMouseUp}
          onMouseEnter={() =>
            onPortHover && onPortHover(node.id, "input", true)
          }
          onMouseLeave={() =>
            onPortHover && onPortHover(node.id, "input", false)
          }
        >
          <circle r={PORT_RADIUS + 4} fill="transparent" />
          <circle
            r={PORT_RADIUS}
            fill={isConnectionTarget ? defaults.color : "var(--surface3)"}
            stroke={defaults.color}
            strokeWidth={1.5}
            style={{
              transition: "fill 0.15s, r 0.15s",
              filter: isConnectionTarget
                ? `drop-shadow(0 0 4px ${defaults.color})`
                : "none",
            }}
          />
          <circle
            r={3}
            fill={isConnectionTarget ? "var(--bg)" : defaults.color}
          />
        </g>
      )}

      {/* Output port */}
      {defaults.hasOutput && (
        <g
          className="port port-output"
          transform={`translate(${outputPortPos.x}, ${outputPortPos.y})`}
          onMouseDown={handleOutputMouseDown}
          onMouseEnter={() =>
            onPortHover && onPortHover(node.id, "output", true)
          }
          onMouseLeave={() =>
            onPortHover && onPortHover(node.id, "output", false)
          }
          style={{ cursor: "crosshair" }}
        >
          <circle r={PORT_RADIUS + 4} fill="transparent" />
          <circle
            r={PORT_RADIUS}
            fill={isConnectionSource ? defaults.color : "var(--surface3)"}
            stroke={defaults.color}
            strokeWidth={1.5}
            style={{
              filter: isConnectionSource
                ? `drop-shadow(0 0 4px ${defaults.color})`
                : "none",
            }}
          />
          <circle
            r={3}
            fill={isConnectionSource ? "var(--bg)" : defaults.color}
          />
        </g>
      )}
    </g>
  );
}
