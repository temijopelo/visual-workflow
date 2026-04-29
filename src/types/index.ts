export type ToastType = "info" | "success" | "error";

export interface ToastProps {
  message: string;
  type?: ToastType;
  onDismiss: () => void;
}

export interface ToolbarProps {
  onAddNode: (type: string) => void;
  onClear: () => void;
  onExport: () => void;
  onImport: (data: string | object) => void;
  onResetView: () => void;
  nodeCount: number;
  edgeCount: number;
}

export interface CanvasProps {
  nodes: any[];
  edges: any[];
  selectedNodeId: string | null;
  onSelectNode: (id: string | null) => void;
  onNodePositionChange: (
    id: string,
    position: { x: number; y: number },
  ) => void;
  onConnectionAdd: (sourceId: string, targetId: string) => void;
  onEdgeDelete: (id: string) => void;
  onAddNodeAtPosition: (
    type: string,
    position: { x: number; y: number },
  ) => void;
}

export interface WorkflowNodeProps {
  node: any;
  zoom: number;
  isSelected: boolean;
  onSelect: (id: string | null) => void;
  onPositionChange: (id: string, position: { x: number; y: number }) => void;
  onConnectionStart: (
    nodeId: string,
    portType: "input" | "output",
    position: { x: number; y: number },
  ) => void;
  onConnectionEnd: (nodeId: string, portType: "input" | "output") => void;
  onPortHover?: (
    nodeId: string,
    portType: "input" | "output" | null,
    isHovering: boolean,
  ) => void;
  connectingFrom: { nodeId: string; portType: "input" | "output" } | null;
}

export interface PropertiesPanelProps {
  node: any;
  onLabelChange: (id: string, label: string) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}
