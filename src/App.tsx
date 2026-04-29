import { useCallback, useState } from "react";
import Toolbar from "./component/Toolbar";
import useGraph from "./hooks/useGraph";
import useCanvas from "./hooks/useCanvas";
import { serializeGraph } from "./utils/graph";
import Toast from "./component/shared/Toast";
import type { ToastType } from "./types";
import Canvas from "./component/Canvas";
import PropertiesPanel from "./component/PropertiesPanel";

function App() {
  const {
    nodes,
    edges,
    addNode,
    updateNodePosition,
    updateNodeLabel,
    deleteNode,
    addEdge,
    deleteEdge,
    clearGraph,
    importGraph,
  } = useGraph();
  const { resetViewport } = useCanvas();
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<
    { id: string; message: string; type: ToastType }[]
  >([]);
  const handleSelectNode = useCallback((id: string | null) => {
    setSelectedNodeId(id);
  }, []);

  const showToast = useCallback((message: string, type: ToastType = "info") => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const selectedNode = nodes.find((n) => n.id === selectedNodeId) || null;

  const handleAddNode = useCallback(
    (type: string) => {
      // Add near center with slight random offset
      const cx = window.innerWidth / 2 - 220; // account for sidebar
      const cy = window.innerHeight / 2;
      const jitter = () => (Math.random() - 0.5) * 200;
      const node = addNode({
        type,
        canvasPosition: { x: cx + jitter(), y: cy + jitter() },
      });
      setSelectedNodeId(node.id);
    },
    [addNode],
  );

  const handleAddNodeAtPosition = useCallback(
    (type: string, position: { x: number; y: number }) => {
      const node = addNode({ type, canvasPosition: position });
      setSelectedNodeId(node.id);
    },
    [addNode],
  );

  const handleClear = useCallback(() => {
    if (nodes.length === 0) return;
    if (window.confirm("Clear the entire canvas? This cannot be undone.")) {
      clearGraph();
      setSelectedNodeId(null);
      showToast("Canvas cleared", "info");
    }
  }, [clearGraph, nodes.length, showToast]);

  const handleExport = useCallback(() => {
    const json = serializeGraph({ nodes, edges });
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "workflow.json";
    a.click();
    URL.revokeObjectURL(url);
    showToast("Exported workflow.json", "success");
    console.log("[FlowForge] Graph export:\n", json);
  }, [nodes, edges, showToast]);

  const handleImport = useCallback(
    (jsonString: string | object) => {
      const result = importGraph({ data: jsonString });
      if (result.success) {
        setSelectedNodeId(null);
        showToast("Workflow imported successfully", "success");
      } else {
        showToast(`Import failed: ${result.error ?? "Unknown error"}`, "error");
      }
    },
    [importGraph, showToast],
  );

  const handleConnectionAdd = useCallback(
    (sourceId: string, targetId: string) => {
      const result = addEdge({ sourceId, targetId });
      if (!result.valid) {
        showToast(result.reason ?? "Invalid connection", "error");
      }
    },
    [addEdge, showToast],
  );

  const handleEdgeDelete = useCallback(
    (edgeId: string) => {
      deleteEdge({ id: edgeId });
      showToast("Connection removed", "info");
    },
    [deleteEdge, showToast],
  );

  const handleDeleteNode = useCallback(
    (id: string) => {
      deleteNode({ id });
      setSelectedNodeId(null);
      showToast("Node deleted", "info");
    },
    [deleteNode, showToast],
  );

  return (
    <main className="flex min-h-screen w-full overflow-hidden bg-bg font-bold justify-between">
      <Toolbar
        onAddNode={handleAddNode}
        onClear={handleClear}
        onExport={handleExport}
        onImport={handleImport}
        onResetView={resetViewport}
        nodeCount={nodes.length}
        edgeCount={edges.length}
      />

      <Canvas
        nodes={nodes}
        edges={edges}
        selectedNodeId={selectedNodeId}
        onSelectNode={handleSelectNode}
        onNodePositionChange={(id, position) => {
          updateNodePosition({ id, x: position.x, y: position.y });
        }}
        onConnectionAdd={handleConnectionAdd}
        onEdgeDelete={handleEdgeDelete}
        onAddNodeAtPosition={handleAddNodeAtPosition}
      />

      {selectedNode && (
        <PropertiesPanel
          node={selectedNode}
          onLabelChange={(id: string, label: string) =>
            updateNodeLabel({ id, label })
          }
          onDelete={handleDeleteNode}
          onClose={() => setSelectedNodeId(null)}
        />
      )}

      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 space-x-2 z-50 flex">
        {toasts.map((t: { id: string; message: string; type: ToastType }) => (
          <Toast
            key={t.id}
            message={t.message}
            type={t.type}
            onDismiss={() => dismissToast(t.id)}
          />
        ))}
      </div>
    </main>
  );
}

export default App;
