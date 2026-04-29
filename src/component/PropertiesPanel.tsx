import { useState, useEffect } from "react";
import { NODE_DEFAULTS } from "../utils/graph";
import type { PropertiesPanelProps } from "../types";

export default function PropertiesPanel({
  node,
  onLabelChange,
  onDelete,
  onClose,
}: PropertiesPanelProps) {
  const [label, setLabel] = useState(node.label);

  useEffect(() => {
    setLabel(node.label);
  }, [node.id, node.label]);

  const def = NODE_DEFAULTS[node.type];

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (label.trim()) {
      onLabelChange(node.id, label.trim());
    }
  };

  return (
    <aside className="properties-panel">
      <div className="props-header" style={{ backgroundColor: def.color }}>
        <div className="props-type-badge">
          <span>{def.icon}</span>
          <span className="props-type-text">{node.type}</span>
        </div>
        <button className="props-close" onClick={onClose} title="Close panel">
          ✕
        </button>
      </div>

      <div className="props-body">
        <div className="props-field">
          <label className="props-label">Node ID</label>
          <div className="props-id">{node.id}</div>
        </div>

        <form className="props-field" onSubmit={handleSubmit}>
          <label className="props-label" htmlFor="node-label">
            Label
          </label>
          <div className="props-input-row">
            <input
              id="node-label"
              type="text"
              className="props-input"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              maxLength={40}
            />
            <button type="submit" className="props-save-btn" title="Save label">
              ✓
            </button>
          </div>
        </form>

        <div className="props-field">
          <label className="props-label">Ports</label>
          <div className="props-port-info">
            <span
              className={`port-badge ${def.hasInput ? "active" : "inactive"}`}
            >
              ← Input
            </span>
            <span
              className={`port-badge ${def.hasOutput ? "active" : "inactive"}`}
            >
              Output →
            </span>
          </div>
        </div>

        <div className="props-field">
          <label className="props-label">Position</label>
          <div className="props-pos">
            <span className="pos-coord">x: {Math.round(node.x)}</span>
            <span className="pos-coord">y: {Math.round(node.y)}</span>
          </div>
        </div>
      </div>

      <div className="props-footer">
        <button className="props-delete-btn" onClick={() => onDelete(node.id)}>
          Delete Node
        </button>
      </div>
    </aside>
  );
}
