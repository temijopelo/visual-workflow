import { useCallback, useRef, useState } from "react";
import useCanvas from "../hooks/useCanvas";
import type { CanvasProps } from "../types";
import EdgeRenderer from "./EdgeRenderer";
import WorkflowNode from "./WorkflowNode";

const NODE_WIDTH = 180;
const NODE_HEIGHT = 64;

export default function Canvas({
  nodes,
  edges,
  selectedNodeId,
  onSelectNode,
  onNodePositionChange,
  onConnectionAdd,
  onEdgeDelete,
  onAddNodeAtPosition,
}: CanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const { viewport, screenToCanvas, startPan, movePan, endPan, handleWheel } =
    useCanvas();

  const [connectingFrom, setConnectingFrom] = useState<{
    nodeId: string;
    portType: "input" | "output";
  } | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      // Middle mouse or space+drag for panning; also plain background drag
      if (e.button === 1 || e.button === 0) {
        const isCanvasBackground =
          e.target === canvasRef.current ||
          (e.target instanceof Element &&
            e.target.classList.contains("canvas-svg"));

        if (isCanvasBackground) {
          onSelectNode(null);
          if (e.button === 0)
            startPan({ screenX: e.clientX, screenY: e.clientY });
        }
        if (e.button === 1)
          startPan({ screenX: e.clientX, screenY: e.clientY });
      }
    },
    [startPan, onSelectNode],
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      movePan({ screenX: e.clientX, screenY: e.clientY });
      if (connectingFrom) {
        const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect) return;
        const canvasPos = screenToCanvas({
          screenX: e.clientX - rect.left,
          screenY: e.clientY - rect.top,
        });
        setMousePos(canvasPos);
      }
    },
    [movePan, connectingFrom, screenToCanvas],
  );

  const handleMouseUp = useCallback(() => {
    endPan();
    if (connectingFrom) {
      setConnectingFrom(null);
    }
  }, [endPan, connectingFrom]);

  // Drop handler to add nodes
  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const type = e.dataTransfer.getData("node-type");
      if (!type) return;
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      const canvasPos = screenToCanvas({
        screenX: e.clientX - rect.left,
        screenY: e.clientY - rect.top,
      });
      onAddNodeAtPosition(type, {
        x: canvasPos.x - NODE_WIDTH / 2,
        y: canvasPos.y - NODE_HEIGHT / 2,
      });
    },
    [screenToCanvas, onAddNodeAtPosition],
  );

  const handleCanvasWheel = useCallback(
    (e: React.WheelEvent<HTMLDivElement>) => {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      handleWheel({ e, canvasRect: rect });
    },
    [handleWheel],
  );

  const handleConnectionStart = useCallback(
    (
      nodeId: string,
      portType: "input" | "output",
      position: { x: number; y: number },
    ) => {
      setConnectingFrom({ nodeId, portType });
      setMousePos(position);
    },
    [],
  );

  const handleConnectionEnd = useCallback(
    (targetNodeId: string, portType: "input" | "output") => {
      if (
        connectingFrom &&
        connectingFrom.nodeId !== targetNodeId &&
        portType === "input"
      ) {
        onConnectionAdd(connectingFrom.nodeId, targetNodeId);
      }
      setConnectingFrom(null);
    },
    [connectingFrom, onConnectionAdd],
  );

  const pendingEdge = connectingFrom
    ? (() => {
        const srcNode = nodes.find((n) => n.id === connectingFrom.nodeId);
        if (!srcNode) return null;
        return {
          x1: srcNode.x + NODE_WIDTH,
          y1: srcNode.y + NODE_HEIGHT / 2,
          x2: mousePos.x,
          y2: mousePos.y,
        };
      })()
    : null;

  const dotSpacing = 24 * viewport.zoom;
  const dotX = viewport.x % dotSpacing;
  const dotY = viewport.y % dotSpacing;
  return (
    <div
      ref={canvasRef}
      className="canvas-container"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      onWheel={handleCanvasWheel}
    >
      {/* Dot grid */}
      <svg
        className="canvas-grid"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
        }}
      >
        <defs>
          <pattern
            id="dots"
            x={dotX}
            y={dotY}
            width={dotSpacing}
            height={dotSpacing}
            patternUnits="userSpaceOnUse"
          >
            <circle
              cx={dotSpacing / 2}
              cy={dotSpacing / 2}
              r={0.8}
              fill="var(--border)"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dots)" />
      </svg>

      {/* Main SVG canvas */}
      <svg
        className="canvas-svg"
        style={{
          width: "100%",
          height: "100%",
          position: "absolute",
          inset: 0,
        }}
        onMouseUp={handleMouseUp}
      >
        <g
          transform={`translate(${viewport.x}, ${viewport.y}) scale(${viewport.zoom})`}
        >
          <EdgeRenderer
            edges={edges}
            nodes={nodes}
            pendingEdge={pendingEdge}
            onEdgeClick={onEdgeDelete}
          />
          {nodes.map((node) => (
            <WorkflowNode
              key={node.id}
              node={node}
              zoom={viewport.zoom}
              isSelected={selectedNodeId === node.id}
              onSelect={onSelectNode}
              onPositionChange={onNodePositionChange}
              onConnectionStart={handleConnectionStart}
              onConnectionEnd={handleConnectionEnd}
              connectingFrom={connectingFrom}
            />
          ))}
        </g>
      </svg>

      {/* Viewport info */}
      <div className="canvas-viewport-info">
        {Math.round(viewport.zoom * 100)}%
      </div>

      {/* Empty state */}
      {nodes.length === 0 && (
        <div className="canvas-empty">
          <div className="empty-icon">◈</div>
          <div className="empty-title">Empty Canvas</div>
          <div className="empty-sub">
            Add nodes from the toolbar to start building your workflow
          </div>
        </div>
      )}
    </div>
  );
}
