import type { CSSProperties } from "react";
import type { ToolbarProps } from "../types";
import { NODE_DEFAULTS, NODE_TYPES } from "../utils/graph";

export default function Toolbar({
  onAddNode,
  onClear,
  onExport,
  onImport,
  onResetView,
  nodeCount,
  edgeCount,
}: ToolbarProps) {
  const handleImportClick = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json,application/json";
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        const result = ev.target?.result;
        if (typeof result === "string") onImport(result);
      };
      reader.readAsText(file);
    };
    input.click();
  };
  return (
    <aside className="toolbar">
      <div className="toolbar-brand">
        <span className="brand-icon">◈</span>
        <div>
          <div className="brand-name">FlowForge</div>
          <div className="brand-sub">Workflow Builder</div>
        </div>
      </div>

      <div className="toolbar-section">
        <div className="section-label">Add Node</div>
        {Object.values(NODE_TYPES).map((type) => {
          const def = NODE_DEFAULTS[type];
          return (
            <button
              key={type}
              className="add-node-btn"
              style={
                {
                  "--node-color": def.color,
                  "--node-dim": def.dimColor,
                } as CSSProperties
              }
              onClick={() => onAddNode(type)}
              title={`Add ${type} node`}
            >
              <span className="btn-icon">{def.icon}</span>
              <span className="btn-label">{def.label}</span>
              <span className="btn-type">{type}</span>
            </button>
          );
        })}
      </div>

      <div className="toolbar-section">
        <div className="section-label">View</div>
        <button className="action-btn secondary" onClick={onResetView}>
          <span>⊹</span> Reset View
        </button>
      </div>

      <div className="toolbar-section">
        <div className="section-label">Graph</div>
        <button className="action-btn" onClick={onExport}>
          <span>↑</span> Export JSON
        </button>
        <button className="action-btn" onClick={handleImportClick}>
          <span>↓</span> Import JSON
        </button>
        <button className="action-btn danger" onClick={onClear}>
          <span>✕</span> Clear Canvas
        </button>
      </div>

      <div className="toolbar-stats">
        <div className="stat">
          <span className="stat-value">{nodeCount}</span>
          <span className="stat-label">nodes</span>
        </div>
        <div className="stat-divider" />
        <div className="stat">
          <span className="stat-value">{edgeCount}</span>
          <span className="stat-label">edges</span>
        </div>
      </div>

      <div className="toolbar-hints">
        <div className="hint">Drag output port → input port to connect</div>
        <div className="hint">Click edge to delete</div>
        <div className="hint">Scroll to zoom · Middle-drag to pan</div>
        <div className="hint">Click node to select · Del to delete</div>
      </div>
    </aside>
  );
}
