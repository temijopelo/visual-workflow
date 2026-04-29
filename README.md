# FlowForge - Visual Workflow Builder

A powerful, interactive visual workflow builder for designing and managing complex node-based workflows. Create workflows by connecting trigger nodes, action nodes, and output nodes with an intuitive drag-and-drop interface.

## 🎯 Features

- **Node-Based Workflow Design**: Create workflows using Trigger → Action → Output node patterns
- **Real-Time Visualization**: See your workflow as you build it with animated connections
- **Interactive Canvas**:
  - **Scroll to Zoom**: Zoom in/out using your mouse wheel (20% - 250% zoom)
  - **Middle-Click or Left-Click Drag**: Pan around the canvas
  - **Reset View**: Quickly jump back to the default viewport
- **Connection Validation**: Built-in cycle detection and connection rules to ensure valid workflows
- **Properties Panel**: Edit node labels and view connection details
- **Import/Export**: Save and load workflows as JSON
- **Local Persistence**: Workflows automatically save to browser storage
- **Visual Feedback**: Dynamic glow effects, animated flow indicators, and connection hints

## 📦 Code Structure

```
src/
├── App.tsx                          # Main app component, orchestrates modal state
├── component/
│   ├── Canvas.tsx                   # Main canvas viewport with pan/zoom
│   ├── EdgeRenderer.tsx             # Renders workflow connections with gradients
│   ├── Toolbar.tsx                  # Sidebar toolbar with node creation buttons
│   ├── WorkflowNode.tsx             # Individual node component with ports
│   ├── PropertiesPanel.tsx          # Side panel for editing selected node
│   └── shared/
│       └── Toast.tsx                # Toast notification component
├── hooks/
│   ├── useGraph.ts                  # Node and edge state management
│   └── useCanvas.ts                 # Viewport (pan/zoom) state management
├── utils/
│   └── graph.ts                     # Validation, serialization, graph utilities
├── types/
│   └── index.ts                     # TypeScript interfaces for all props
└── styles/
    └── *.css                        # Component-specific styling

```

### Key Components

#### `Canvas.tsx`

- Manages the main SVG canvas and viewport
- Handles mouse interactions (panning, selection, connection dragging)
- Renders the dot grid, workflow nodes, and edge connections
- Responds to scroll wheel for zoom functionality

#### `WorkflowNode.tsx`

- Represents a single node (Trigger, Action, or Output)
- Manages input/output ports for connections
- Handles drag-to-move node positioning
- Emits connection start/end events for the canvas

#### `EdgeRenderer.tsx`

- Renders all edges with smooth cubic Bezier curves
- Gradient colors based on source and target node types
- Animated flow dots along connections
- Invisible hit area for easy edge selection

#### `useGraph.ts` (Hook)

- Manages all node and edge state
- Provides CRUD operations: `addNode`, `updateNodePosition`, `deleteNode`, `addEdge`, `deleteEdge`
- Handles import/export and localStorage persistence
- Returns all state and update functions

#### `useCanvas.ts` (Hook)

- Manages viewport state (pan x/y, zoom level)
- Provides pan controls: `startPan`, `movePan`, `endPan`
- Provides zoom controls: `handleWheel`, `resetViewport`
- Includes zoom bounds (0.2x - 2.5x)
- Converts screen coordinates to canvas coordinates

### Validation & Utilities

`graph.ts` includes:

- **`validateConnection`**: Ensures connections follow rules:
  - No self-loops
  - Trigger nodes cannot receive input
  - Output nodes cannot send output
  - No duplicate edges
  - No cycles (enforces DAG structure)
- **`createNode`**: Factory function for creating nodes with defaults
- **`serializeGraph`**: Converts graph to JSON format

## 🚀 Getting Started

### Prerequisites

- Node.js 16+
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

This starts the Vite development server with HMR. Open your browser to the displayed URL.

### Building

```bash
npm run build
```

Builds the project for production in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

## 💡 Usage Guide

### Creating Nodes

1. Click any button in the left toolbar (⚡ Trigger, ⚙ Action, ◉ Output)
2. Nodes appear near the center with a random offset
3. Drag nodes to reposition them

### Creating Connections

1. Hover over an output port (right side of a node)
2. Click and drag to an input port (left side of a node)
3. A blue dashed line shows your pending connection
4. Release to confirm

**Connection Rules:**

- Trigger nodes: can only output, not receive input
- Output nodes: can only input, not output
- No cycles (DAG enforcement)

### Editing Nodes

1. Click a node to select it
2. The Properties Panel opens on the right
3. Edit the node label and view connection info

### Canvas Navigation

- **Zoom In/Out**: Scroll with mouse wheel (or trackpad)
- **Pan**: Middle-click + drag, or left-click + drag on empty canvas
- **Reset View**: Click the ⊹ button in the toolbar

### Import/Export

1. **Export**: Click ↑ Export JSON to download your workflow
2. **Import**: Click ↓ Import JSON to load a saved workflow
3. **Clear Canvas**: Click ✕ Clear Canvas to reset (confirmation required)

## 🎨 Visual Design

- **Colors**: Each node type has its own color (Trigger, Action, Output)
- **Selection**: Selected nodes show a glowing outline
- **Animations**: Flow dots animate along connections to show direction
- **Feedback**: Toasts appear when you perform actions (create, delete, import, etc.)

## 🛠️ Tech Stack

- **React 18**: UI framework
- **TypeScript**: Type-safe development
- **Vite**: Fast build tool and dev server
- **SVG**: Canvas rendering (scalable vector graphics)
- **CSS Grid/Flexbox**: Layout
- **LocalStorage API**: Persistence

## 📄 Development Notes

### Type Safety

The project is fully typed with TypeScript. Key prop interfaces are defined in `src/types/index.ts`.

### State Management

- **Graph state**: Managed by `useGraph` hook (nodes, edges, operations)
- **UI state**: Managed by React `useState` in components (selections, toasts)
- **Viewport state**: Managed by `useCanvas` hook (pan, zoom)

### CSS Architecture

- Component-scoped CSS files (e.g., `Toolbar.css`, `Canvas.css`)
- CSS Variables for theming (colors, fonts, spacing)
- Responsive grid for sidebar + canvas layout

## 🐛 Troubleshooting

**Q: Why can't I connect these nodes?**

- Check if the connection follows the validation rules (see Connection Rules above)

**Q: My workflow disappeared!**

- Workflows are auto-saved to localStorage. Clear your browser cache if needed. Use Export JSON to backup important workflows.

**Q: Canvas is zoomed in too much, where am I?**

- Click the Reset View button (⊹) in the toolbar to reset to default zoom/pan.

## 📝 License

This project is open source.

---

**Happy building! 🚀**
