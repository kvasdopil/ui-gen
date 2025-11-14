interface ArrowLineProps {
  start: { x: number; y: number }; // Content coordinates
  end: { x: number; y: number }; // Content coordinates
  startScreenBounds?: { x: number; y: number; width: number; height: number }; // Content coordinates
  endScreenBounds?: { x: number; y: number; width: number; height: number }; // Content coordinates
  isActive?: boolean; // Whether this arrow is related to the active/selected screen
  markerId?: string; // Unique marker ID for this arrow instance
}

// Helper to find intersection of a line with a rectangle
// Returns the intersection point and which side it intersects
function findLineRectIntersection(
  lineStart: { x: number; y: number },
  lineEnd: { x: number; y: number },
  bounds: { x: number; y: number; width: number; height: number },
): { x: number; y: number; side: "top" | "right" | "bottom" | "left" } | null {
  const { x, y, width, height } = bounds;
  const left = x - width / 2;
  const right = x + width / 2;
  const top = y - height / 2;
  const bottom = y + height / 2;

  const dx = lineEnd.x - lineStart.x;
  const dy = lineEnd.y - lineStart.y;

  // Check intersection with each edge
  // Using parametric line equation: P = P0 + t * (P1 - P0)

  let t: number | null = null;
  let side: "top" | "right" | "bottom" | "left" | null = null;
  let intersectionX = 0;
  let intersectionY = 0;

  // Check top edge (y = top, x from left to right)
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

  // Check bottom edge (y = bottom, x from left to right)
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

  // Check left edge (x = left, y from top to bottom)
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

  // Check right edge (x = right, y from top to bottom)
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
    return { x: intersectionX, y: intersectionY, side };
  }

  return null;
}

export default function ArrowLine({
  start,
  end,
  startScreenBounds,
  endScreenBounds,
  isActive = false,
  markerId,
}: ArrowLineProps) {
  // Start from overlay center, end at screen center (or mouse position)
  const startPoint = start;
  const endPoint = end;

  let startIntersection: {
    x: number;
    y: number;
    side: "top" | "right" | "bottom" | "left";
  } | null = null;
  let endIntersection: { x: number; y: number; side: "top" | "right" | "bottom" | "left" } | null =
    null;

  // Find intersection of line from start to end with start screen rectangle
  if (startScreenBounds) {
    startIntersection = findLineRectIntersection(startPoint, endPoint, startScreenBounds);
  }

  // Find intersection of line from start to end with end screen rectangle
  if (endScreenBounds) {
    endIntersection = findLineRectIntersection(startPoint, endPoint, endScreenBounds);
  }

  // Build path: only show Bezier between boundaries, arrow tip at destination boundary
  let path = "";

  if (startIntersection && endIntersection) {
    // Both intersections: Bezier from start boundary to end boundary (arrow tip at end boundary)
    path = `M ${startIntersection.x} ${startIntersection.y}`;

    // Calculate Bezier control points perpendicular to edges
    const offset = 100;
    let c1x = startIntersection.x;
    let c1y = startIntersection.y;
    let c2x = endIntersection.x;
    let c2y = endIntersection.y;

    // Control point 1: offset perpendicular to start edge
    if (startIntersection.side === "top" || startIntersection.side === "bottom") {
      // Horizontal edge: move vertically
      c1y = startIntersection.y + (endIntersection.y > startIntersection.y ? offset : -offset);
    } else {
      // Vertical edge: move horizontally
      c1x = startIntersection.x + (endIntersection.x > startIntersection.x ? offset : -offset);
    }

    // Control point 2: offset perpendicular to end edge
    if (endIntersection.side === "top" || endIntersection.side === "bottom") {
      // Horizontal edge: approach from vertical
      c2y = endIntersection.y + (startIntersection.y > endIntersection.y ? offset : -offset);
    } else {
      // Vertical edge: approach from horizontal
      c2x = endIntersection.x + (startIntersection.x > endIntersection.x ? offset : -offset);
    }

    path += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${endIntersection.x} ${endIntersection.y}`;
  } else if (startIntersection) {
    // Only start intersection: Bezier from start boundary to end (no destination screen)
    path = `M ${startIntersection.x} ${startIntersection.y}`;

    const offset = 100;
    let c1x = startIntersection.x;
    let c1y = startIntersection.y;
    let c2x = endPoint.x;
    let c2y = endPoint.y;

    if (startIntersection.side === "top" || startIntersection.side === "bottom") {
      c1y = startIntersection.y + (endPoint.y > startIntersection.y ? offset : -offset);
      c2y = endPoint.y + (startIntersection.y > endPoint.y ? offset : -offset);
    } else {
      c1x = startIntersection.x + (endPoint.x > startIntersection.x ? offset : -offset);
      c2x = endPoint.x + (startIntersection.x > endPoint.x ? offset : -offset);
    }

    path += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${endPoint.x} ${endPoint.y}`;
  } else if (endIntersection) {
    // Only end intersection: Bezier from start to end boundary (arrow tip at end boundary)
    path = `M ${startPoint.x} ${startPoint.y}`;

    const offset = 100;
    let c1x = startPoint.x;
    let c1y = startPoint.y;
    let c2x = endIntersection.x;
    let c2y = endIntersection.y;

    if (endIntersection.side === "top" || endIntersection.side === "bottom") {
      c1y = startPoint.y + (endIntersection.y > startPoint.y ? offset : -offset);
      c2y = endIntersection.y + (startPoint.y > endIntersection.y ? offset : -offset);
    } else {
      c1x = startPoint.x + (endIntersection.x > startPoint.x ? offset : -offset);
      c2x = endIntersection.x + (startPoint.x > endIntersection.x ? offset : -offset);
    }

    path += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${endIntersection.x} ${endIntersection.y}`;
  } else {
    // No intersections: simple Bezier from start to end
    path = `M ${startPoint.x} ${startPoint.y}`;
    const offset = 100;
    const c1x = startPoint.x + (endPoint.x > startPoint.x ? offset : -offset);
    const c1y = startPoint.y;
    const c2x = endPoint.x;
    const c2y = endPoint.y + (startPoint.y > endPoint.y ? offset : -offset);
    path += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${endPoint.x} ${endPoint.y}`;
  }

  // Calculate bounds for SVG viewBox to cover all possible arrow positions
  const minX = Math.min(startPoint.x, endPoint.x) - 200;
  const minY = Math.min(startPoint.y, endPoint.y) - 200;
  const maxX = Math.max(startPoint.x, endPoint.x) + 200;
  const maxY = Math.max(startPoint.y, endPoint.y) + 200;
  const width = maxX - minX;
  const height = maxY - minY;

  // Adjust path coordinates relative to viewBox origin
  const adjustedPath = path
    .replace(
      /M ([\d.-]+) ([\d.-]+)/,
      (match, x, y) => `M ${parseFloat(x) - minX} ${parseFloat(y) - minY}`,
    )
    .replace(
      /L ([\d.-]+) ([\d.-]+)/g,
      (match, x, y) => `L ${parseFloat(x) - minX} ${parseFloat(y) - minY}`,
    )
    .replace(
      /C ([\d.-]+) ([\d.-]+), ([\d.-]+) ([\d.-]+), ([\d.-]+) ([\d.-]+)/g,
      (match, x1, y1, x2, y2, x3, y3) =>
        `C ${parseFloat(x1) - minX} ${parseFloat(y1) - minY}, ${parseFloat(x2) - minX} ${parseFloat(y2) - minY}, ${parseFloat(x3) - minX} ${parseFloat(y3) - minY}`,
    );

  // Use dark gray for active arrows, lighter gray for inactive
  const strokeColor = isActive ? "#6b7280" : "#d1d5db";
  // Use provided markerId or generate a unique one
  const uniqueMarkerId = markerId || `arrowhead-${Math.random().toString(36).substring(2, 11)}`;

  return (
    <svg
      className="pointer-events-none absolute z-50"
      style={{
        left: `${minX}px`,
        top: `${minY}px`,
        width: `${width}px`,
        height: `${height}px`,
      }}
      viewBox={`0 0 ${width} ${height}`}
    >
      <defs>
        <marker
          id={uniqueMarkerId}
          markerWidth="10"
          markerHeight="10"
          refX="9"
          refY="3"
          orient="auto"
        >
          <polygon points="0 0, 10 3, 0 6" fill={strokeColor} />
        </marker>
      </defs>
      <path
        d={adjustedPath}
        stroke={strokeColor}
        strokeWidth="2"
        fill="none"
        markerEnd={`url(#${uniqueMarkerId})`}
      />
    </svg>
  );
}
