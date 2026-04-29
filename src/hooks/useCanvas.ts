import { useState, useCallback, useRef } from "react";

const MIN_ZOOM = 0.2;
const MAX_ZOOM = 2.5;
const ZOOM_SENSITIVITY = 0.001;

export default function useCanvas() {
  const [viewport, setViewport] = useState({ x: 0, y: 0, zoom: 1 });
  const isPanning = useRef(false);
  const panStart = useRef({ x: 0, y: 0, vpx: 0, vpy: 0 });

  const screenToCanvas = useCallback(
    ({
      screenX,
      screenY,
      vp,
    }: {
      screenX: number;
      screenY: number;
      vp?: any;
    }) => {
      const v = vp || viewport;
      return {
        x: (screenX - v.x) / v.zoom,
        y: (screenY - v.y) / v.zoom,
      };
    },
    [viewport],
  );

  const startPan = useCallback(
    ({ screenX, screenY }: { screenX: number; screenY: number }) => {
      isPanning.current = true;
      panStart.current = {
        x: screenX,
        y: screenY,
        vpx: viewport.x,
        vpy: viewport.y,
      };
    },
    [viewport],
  );

  const movePan = useCallback(
    ({ screenX, screenY }: { screenX: number; screenY: number }) => {
      if (!isPanning.current) return;
      const dx = screenX - panStart.current.x;
      const dy = screenY - panStart.current.y;
      setViewport((v) => ({
        ...v,
        x: panStart.current.vpx + dx,
        y: panStart.current.vpy + dy,
      }));
    },
    [],
  );

  const endPan = useCallback(() => {
    isPanning.current = false;
  }, []);

  const handleWheel = useCallback(
    ({
      e,
      canvasRect,
    }: {
      e: React.WheelEvent<HTMLDivElement>;
      canvasRect: DOMRect;
    }) => {
      e.preventDefault();
      const delta = -e.deltaY * ZOOM_SENSITIVITY;
      // const newZoom = Math.min(
      //   MAX_ZOOM,
      //   Math.max(MIN_ZOOM, viewport.zoom * (1 + delta * 8)),
      // );

      // Zoom toward mouse position
      const mouseX = e.clientX - canvasRect.left;
      const mouseY = e.clientY - canvasRect.top;

      setViewport((v) => {
        const z = Math.min(
          MAX_ZOOM,
          Math.max(MIN_ZOOM, v.zoom * (1 + delta * 8)),
        );
        const scale = z / v.zoom;
        return {
          x: mouseX - scale * (mouseX - v.x),
          y: mouseY - scale * (mouseY - v.y),
          zoom: z,
        };
      });
    },
    [viewport],
  );

  const resetViewport = useCallback(() => {
    setViewport({ x: 0, y: 0, zoom: 1 });
  }, []);

  return {
    viewport,
    screenToCanvas,
    startPan,
    movePan,
    endPan,
    handleWheel,
    resetViewport,
    isPanning,
  };
}
