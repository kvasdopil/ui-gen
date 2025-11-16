"use client";

import { useEffect, useRef } from "react";
import { dia, shapes } from "@joint/core";

interface Arrow {
  id: string;
  start: { x: number; y: number };
  end: { x: number; y: number };
  startScreenBounds?: { x: number; y: number; width: number; height: number };
  endScreenBounds?: { x: number; y: number; width: number; height: number };
  isActive?: boolean;
}

interface JointJSArrowsProps {
  arrows: Arrow[];
  viewportScale?: number;
}

const GRID_SIZE = 16;

// Use static large bounds to cover all possible coordinates (including negative)
// This avoids recalculating bounds and positioning the container dynamically
const STATIC_BOUNDS = {
  minX: -50000,
  minY: -50000,
  maxX: 50000,
  maxY: 50000,
};
const STATIC_WIDTH = STATIC_BOUNDS.maxX - STATIC_BOUNDS.minX;
const STATIC_HEIGHT = STATIC_BOUNDS.maxY - STATIC_BOUNDS.minY;

const snapToGrid = (value: number): number => {
  return Math.round(value / GRID_SIZE) * GRID_SIZE;
};

function findLineRectIntersection(
  lineStart: { x: number; y: number },
  lineEnd: { x: number; y: number },
  bounds: { x: number; y: number; width: number; height: number },
): { x: number; y: number; side: "top" | "right" | "bottom" | "left" } | null {
  // Validate inputs
  if (
    !Number.isFinite(lineStart.x) ||
    !Number.isFinite(lineStart.y) ||
    !Number.isFinite(lineEnd.x) ||
    !Number.isFinite(lineEnd.y) ||
    !Number.isFinite(bounds.x) ||
    !Number.isFinite(bounds.y) ||
    !Number.isFinite(bounds.width) ||
    !Number.isFinite(bounds.height)
  ) {
    return null;
  }

  const { x, y, width, height } = bounds;
  const left = x - width / 2;
  const right = x + width / 2;
  const top = y - height / 2;
  const bottom = y + height / 2;

  const dx = lineEnd.x - lineStart.x;
  const dy = lineEnd.y - lineStart.y;

  // Validate dx and dy
  if (!Number.isFinite(dx) || !Number.isFinite(dy)) {
    return null;
  }

  let t: number | null = null;
  let side: "top" | "right" | "bottom" | "left" | null = null;
  let intersectionX = 0;
  let intersectionY = 0;

  if (dy !== 0) {
    const tTop = (top - lineStart.y) / dy;
    if (tTop >= 0 && tTop <= 1) {
      const xAtTop = lineStart.x + tTop * dx;
      if (xAtTop >= left && xAtTop <= right) {
        if (t === null || tTop < t) {
          t = tTop;
          side = "top";
          intersectionX = xAtTop;
          intersectionY = top;
        }
      }
    }
  }

  if (dy !== 0) {
    const tBottom = (bottom - lineStart.y) / dy;
    if (tBottom >= 0 && tBottom <= 1) {
      const xAtBottom = lineStart.x + tBottom * dx;
      if (xAtBottom >= left && xAtBottom <= right) {
        if (t === null || tBottom < t) {
          t = tBottom;
          side = "bottom";
          intersectionX = xAtBottom;
          intersectionY = bottom;
        }
      }
    }
  }

  if (dx !== 0) {
    const tLeft = (left - lineStart.x) / dx;
    if (tLeft >= 0 && tLeft <= 1) {
      const yAtLeft = lineStart.y + tLeft * dy;
      if (yAtLeft >= top && yAtLeft <= bottom) {
        if (t === null || tLeft < t) {
          t = tLeft;
          side = "left";
          intersectionX = left;
          intersectionY = yAtLeft;
        }
      }
    }
  }

  if (dx !== 0) {
    const tRight = (right - lineStart.x) / dx;
    if (tRight >= 0 && tRight <= 1) {
      const yAtRight = lineStart.y + tRight * dy;
      if (yAtRight >= top && yAtRight <= bottom) {
        if (t === null || tRight < t) {
          t = tRight;
          side = "right";
          intersectionX = right;
          intersectionY = yAtRight;
        }
      }
    }
  }

  if (t !== null && side !== null) {
    // Validate intersection point before returning
    if (Number.isFinite(intersectionX) && Number.isFinite(intersectionY)) {
      return { x: intersectionX, y: intersectionY, side };
    }
  }

  return null;
}

export default function JointJSArrows({ arrows, viewportScale = 1 }: JointJSArrowsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<dia.Graph | null>(null);
  const paperRef = useRef<dia.Paper | null>(null);
  const linksRef = useRef<Map<string, dia.Link>>(new Map());
  const rectsRef = useRef<Map<string, dia.Element>>(new Map());

  const groupArrowsByTarget = (arrows: Arrow[]): Map<string, Arrow[]> => {
    const grouped = new Map<string, Arrow[]>();
    arrows.forEach((arrow) => {
      const targetKey = arrow.endScreenBounds
        ? `${arrow.endScreenBounds.x},${arrow.endScreenBounds.y}`
        : `${snapToGrid(arrow.end.x)},${snapToGrid(arrow.end.y)}`;
      if (!grouped.has(targetKey)) {
        grouped.set(targetKey, []);
      }
      grouped.get(targetKey)!.push(arrow);
    });
    return grouped;
  };

  useEffect(() => {
    if (!containerRef.current) return;

    if (!graphRef.current) {
      graphRef.current = new dia.Graph();
    }

    if (!paperRef.current) {
      // Validate static bounds before creating paper
      if (
        !Number.isFinite(STATIC_WIDTH) ||
        !Number.isFinite(STATIC_HEIGHT) ||
        !Number.isFinite(STATIC_BOUNDS.minX) ||
        !Number.isFinite(STATIC_BOUNDS.minY)
      ) {
        console.error("Invalid static bounds:", STATIC_BOUNDS);
        return;
      }

      paperRef.current = new dia.Paper({
        el: containerRef.current,
        model: graphRef.current,
        width: STATIC_WIDTH,
        height: STATIC_HEIGHT,
        gridSize: GRID_SIZE,
        drawGrid: false,
        interactive: false,
        background: {
          color: "transparent",
        },
      });
      // Translate paper so origin (0,0) is at the center of the static bounds
      // Ensure translation values are valid
      const translateX = -STATIC_BOUNDS.minX;
      const translateY = -STATIC_BOUNDS.minY;
      if (Number.isFinite(translateX) && Number.isFinite(translateY)) {
        paperRef.current.translate(translateX, translateY);
      } else {
        console.error("Invalid translation values:", { translateX, translateY });
      }
    }

    // Clear existing links and rectangles
    linksRef.current.forEach((link) => {
      link.remove();
    });
    linksRef.current.clear();
    rectsRef.current.forEach((rect) => {
      rect.remove();
    });
    rectsRef.current.clear();

    // Collect unique screen bounds for debugging
    const screenBoundsSet = new Set<string>();
    const screenBoundsMap = new Map<
      string,
      {
        type: "start" | "end";
        x: number;
        y: number;
        width: number;
        height: number;
      }
    >();

    arrows.forEach((arrow) => {
      if (arrow.startScreenBounds) {
        const bounds = arrow.startScreenBounds;
        // Use JSON stringify to handle negative numbers correctly
        const key = JSON.stringify({
          type: "start",
          x: bounds.x,
          y: bounds.y,
          width: bounds.width,
          height: bounds.height,
        });
        if (!screenBoundsSet.has(key)) {
          screenBoundsSet.add(key);
          screenBoundsMap.set(key, {
            type: "start",
            x: bounds.x,
            y: bounds.y,
            width: bounds.width,
            height: bounds.height,
          });
        }
      }
      if (arrow.endScreenBounds) {
        const bounds = arrow.endScreenBounds;
        // Use JSON stringify to handle negative numbers correctly
        const key = JSON.stringify({
          type: "end",
          x: bounds.x,
          y: bounds.y,
          width: bounds.width,
          height: bounds.height,
        });
        if (!screenBoundsSet.has(key)) {
          screenBoundsSet.add(key);
          screenBoundsMap.set(key, {
            type: "end",
            x: bounds.x,
            y: bounds.y,
            width: bounds.width,
            height: bounds.height,
          });
        }
      }
    });

    // Render screen bounding rectangles for debugging
    screenBoundsMap.forEach((bounds) => {
      const { type, x, y, width, height } = bounds;

      // Validate values
      if (
        !Number.isFinite(x) ||
        !Number.isFinite(y) ||
        !Number.isFinite(width) ||
        !Number.isFinite(height)
      ) {
        console.warn("Invalid screen bounds values:", { x, y, width, height });
        return;
      }

      const rect = new shapes.standard.Rectangle({
        position: { x: x - width / 2, y: y - height / 2 },
        size: { width, height },
        attrs: {
          body: {
            fill: "transparent",
            stroke: type === "start" ? "#3b82f6" : "#10b981",
            strokeWidth: 1,
            strokeDasharray: "5,5",
            opacity: 0.5,
          },
        },
      });

      graphRef.current!.addCell(rect);
      rectsRef.current.set(JSON.stringify(bounds), rect);
    });

    const groupedArrows = groupArrowsByTarget(arrows);

    groupedArrows.forEach((arrowGroup) => {
      if (arrowGroup.length === 0) return;

      arrowGroup.forEach((arrow, index) => {
        // Validate coordinates to prevent NaN
        if (
          !Number.isFinite(arrow.start.x) ||
          !Number.isFinite(arrow.start.y) ||
          !Number.isFinite(arrow.end.x) ||
          !Number.isFinite(arrow.end.y)
        ) {
          console.warn("Invalid arrow coordinates:", arrow);
          return;
        }

        let startPoint = { x: arrow.start.x, y: arrow.start.y };
        let endPoint = { x: arrow.end.x, y: arrow.end.y };

        let startIntersection: {
          x: number;
          y: number;
          side: "top" | "right" | "bottom" | "left";
        } | null = null;
        let endIntersection: {
          x: number;
          y: number;
          side: "top" | "right" | "bottom" | "left";
        } | null = null;

        if (arrow.startScreenBounds) {
          // Validate screen bounds before using
          const bounds = arrow.startScreenBounds;
          if (
            Number.isFinite(bounds.x) &&
            Number.isFinite(bounds.y) &&
            Number.isFinite(bounds.width) &&
            Number.isFinite(bounds.height)
          ) {
            startIntersection = findLineRectIntersection(startPoint, endPoint, bounds);
            if (
              startIntersection &&
              Number.isFinite(startIntersection.x) &&
              Number.isFinite(startIntersection.y)
            ) {
              startPoint = { x: startIntersection.x, y: startIntersection.y };
            }
          } else {
            console.warn("Invalid startScreenBounds:", bounds);
          }
        }

        if (arrow.endScreenBounds) {
          // Validate screen bounds before using
          const bounds = arrow.endScreenBounds;
          if (
            Number.isFinite(bounds.x) &&
            Number.isFinite(bounds.y) &&
            Number.isFinite(bounds.width) &&
            Number.isFinite(bounds.height)
          ) {
            endIntersection = findLineRectIntersection(startPoint, endPoint, bounds);
            if (
              endIntersection &&
              Number.isFinite(endIntersection.x) &&
              Number.isFinite(endIntersection.y)
            ) {
              endPoint = { x: endIntersection.x, y: endIntersection.y };
            }
          } else {
            console.warn("Invalid endScreenBounds:", bounds);
          }
        }

        startPoint = { x: snapToGrid(startPoint.x), y: snapToGrid(startPoint.y) };
        endPoint = { x: snapToGrid(endPoint.x), y: snapToGrid(endPoint.y) };

        // Validate snapped coordinates
        if (
          !Number.isFinite(startPoint.x) ||
          !Number.isFinite(startPoint.y) ||
          !Number.isFinite(endPoint.x) ||
          !Number.isFinite(endPoint.y)
        ) {
          console.warn("Invalid snapped coordinates:", { startPoint, endPoint });
          return;
        }

        let offsetEndPoint = { ...endPoint };
        if (arrowGroup.length > 1 && endIntersection) {
          const offsetDistance = 20;
          const offsetIndex = index - (arrowGroup.length - 1) / 2;

          // Validate offsetIndex before using
          if (Number.isFinite(offsetIndex)) {
            if (endIntersection.side === "top" || endIntersection.side === "bottom") {
              const offsetX = snapToGrid(endPoint.x + offsetIndex * offsetDistance);
              if (Number.isFinite(offsetX)) {
                offsetEndPoint = {
                  ...offsetEndPoint,
                  x: offsetX,
                };
              }
            } else {
              const offsetY = snapToGrid(endPoint.y + offsetIndex * offsetDistance);
              if (Number.isFinite(offsetY)) {
                offsetEndPoint = {
                  ...offsetEndPoint,
                  y: offsetY,
                };
              }
            }
          }
        }

        // Final validation before creating points
        if (
          !Number.isFinite(startPoint.x) ||
          !Number.isFinite(startPoint.y) ||
          !Number.isFinite(offsetEndPoint.x) ||
          !Number.isFinite(offsetEndPoint.y)
        ) {
          console.warn("Invalid final coordinates:", { startPoint, offsetEndPoint });
          return;
        }

        // Create JointJS points directly from our coordinates
        // Use plain objects instead of g.Point to avoid potential issues
        const sourceX = snapToGrid(startPoint.x);
        const sourceY = snapToGrid(startPoint.y);
        const targetX = snapToGrid(offsetEndPoint.x);
        const targetY = snapToGrid(offsetEndPoint.y);

        // Validate coordinates before creating link
        if (
          !Number.isFinite(sourceX) ||
          !Number.isFinite(sourceY) ||
          !Number.isFinite(targetX) ||
          !Number.isFinite(targetY)
        ) {
          console.warn("Invalid JointJS coordinates:", { sourceX, sourceY, targetX, targetY });
          return;
        }

        const link = new shapes.standard.Link({
          source: { x: sourceX, y: sourceY },
          target: { x: targetX, y: targetY },
          attrs: {
            line: {
              stroke: arrow.isActive ? "#6b7280" : "#d1d5db",
              strokeWidth: 2,
              targetMarker: {
                type: "path",
                d: "M 10 -5 L 0 0 L 10 5 Z",
                fill: arrow.isActive ? "#6b7280" : "#d1d5db",
              },
            },
          },
          router: {
            name: "metro",
            args: {
              step: GRID_SIZE,
              padding: 0,
              maximumLoops: 2000,
            },
          },
          connector: {
            name: "rounded",
            args: {
              radius: 10,
            },
          },
        });

        graphRef.current!.addCell(link);
        linksRef.current.set(arrow.id, link);
      });
    });

    // Paper dimensions and translation are set once during initialization
    // No need to recalculate or update them

    return () => {
      // Cleanup handled above
    };
  }, [arrows, viewportScale]);

  // Use static positioning - container covers the entire static bounds area
  // Positioned at minX, minY to ensure negative coordinates are visible
  return (
    <div
      ref={containerRef}
      className="pointer-events-none absolute z-50"
      style={{
        left: `${STATIC_BOUNDS.minX}px`,
        top: `${STATIC_BOUNDS.minY}px`,
        width: `${STATIC_WIDTH}px`,
        height: `${STATIC_HEIGHT}px`,
        overflow: "visible",
      }}
    />
  );
}
