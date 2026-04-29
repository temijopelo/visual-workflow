import { useState, useCallback, useEffect } from "react";
import { createNode, generateId, validateConnection } from "../utils/graph";

type GraphNode = {
  id: string;
  type: string;
  label: string;
  x: number;
  y: number;
};

type GraphEdge = {
  id: string;
  source: string;
  target: string;
};

const STORAGE_KEY = "workflow-builder-graph";

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function saveToStorage({ nodes, edges }: { nodes: any[]; edges: any[] }) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ nodes, edges }));
  } catch {
    // ignore
  }
}

export default function useGraph() {
  const [nodes, setNodes] = useState<GraphNode[]>(() => {
    const saved = loadFromStorage();
    return saved?.nodes ?? [];
  });
  const [edges, setEdges] = useState<GraphEdge[]>(() => {
    const saved = loadFromStorage();
    return saved?.edges ?? [];
  });

  // Persist on every change
  useEffect(() => {
    saveToStorage({ nodes, edges });
  }, [nodes, edges]);

  const addNode = useCallback(
    ({
      type,
      canvasPosition,
    }: {
      type: string;
      canvasPosition: { x: number; y: number };
    }) => {
      const node = createNode({ type, position: canvasPosition });
      setNodes((prev) => [...prev, node]);
      return node;
    },
    [],
  );

  const updateNodePosition = useCallback(
    ({ id, x, y }: { id: string; x: number; y: number }) => {
      setNodes((prev) => prev.map((n) => (n.id === id ? { ...n, x, y } : n)));
    },
    [],
  );

  const updateNodeLabel = useCallback(
    ({ id, label }: { id: string; label: string }) => {
      setNodes((prev) => prev.map((n) => (n.id === id ? { ...n, label } : n)));
    },
    [],
  );

  const deleteNode = useCallback(({ id }: { id: string }) => {
    setNodes((prev) => prev.filter((n) => n.id !== id));
    setEdges((prev) => prev.filter((e) => e.source !== id && e.target !== id));
  }, []);

  const addEdge = useCallback(
    ({ sourceId, targetId }: { sourceId: string; targetId: string }) => {
      const sourceNode = nodes.find((n) => n.id === sourceId);
      const targetNode = nodes.find((n) => n.id === targetId);
      if (!sourceNode || !targetNode)
        return { valid: false, reason: "Node not found" };

      const result = validateConnection({
        sourceId,
        targetId,
        sourceType: sourceNode.type,
        targetType: targetNode.type,
        edges,
      });
      if (!result.valid) return result;

      const edge = { id: generateId(), source: sourceId, target: targetId };
      setEdges((prev) => [...prev, edge]);
      return { valid: true };
    },
    [nodes, edges],
  );

  const deleteEdge = useCallback(({ id }: { id: string }) => {
    setEdges((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const clearGraph = useCallback(() => {
    setNodes([]);
    setEdges([]);
  }, []);

  const importGraph = useCallback(({ data }: { data: string | object }) => {
    try {
      const parsed = typeof data === "string" ? JSON.parse(data) : data;
      if (!parsed.nodes || !parsed.edges) throw new Error("Invalid format");
      setNodes(parsed.nodes as GraphNode[]);
      setEdges(parsed.edges as GraphEdge[]);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }, []);

  return {
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
  };
}
