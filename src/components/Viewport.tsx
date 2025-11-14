"use client";

import {
  useState,
  useRef,
  useEffect,
  useCallback,
  ReactNode,
  forwardRef,
  useImperativeHandle,
} from "react";
import { usePersistentState } from "@/hooks/usePersistentState";
import type { ViewportTransform } from "@/lib/storage";

export interface ViewportHandle {
  getTransform: () => ViewportTransform;
  getTransformRef: () => React.MutableRefObject<ViewportTransform>;
  viewportToContent: (x: number, y: number) => { x: number; y: number };
  contentToViewport: (x: number, y: number) => { x: number; y: number };
  getElement: () => HTMLDivElement | null;
  setTransform: (transform: ViewportTransform) => void;
}

interface ViewportProps {
  children: ReactNode;
  onPanStart?: () => void;
  onPanEnd?: () => void;
  onTransformChange?: (transform: ViewportTransform) => void;
  disabled?: boolean; // When true, panning is disabled (e.g., when dragging a screen)
  onContextMenu?: (e: React.MouseEvent) => void;
}

const Viewport = forwardRef<ViewportHandle, ViewportProps>(function Viewport(
  { children, onPanStart, onPanEnd, onTransformChange, disabled = false, onContextMenu },
  ref,
) {
  const [viewportTransform, setViewportTransform, hasLoaded] =
    usePersistentState<ViewportTransform>("viewportTransform", { x: 0, y: 0, scale: 1 }, 500);
  const viewportTransformRef = useRef<ViewportTransform>({ x: 0, y: 0, scale: 1 });
  const viewportRef = useRef<HTMLDivElement>(null);
  const isInitialMount = useRef(true);

  // Expose methods via ref
  useImperativeHandle(ref, () => ({
    getTransform: () => viewportTransformRef.current,
    getTransformRef: () => viewportTransformRef,
    viewportToContent: (x: number, y: number) => {
      const transform = viewportTransformRef.current;
      return {
        x: (x - transform.x) / transform.scale,
        y: (y - transform.y) / transform.scale,
      };
    },
    contentToViewport: (x: number, y: number) => {
      const transform = viewportTransformRef.current;
      return {
        x: x * transform.scale + transform.x,
        y: y * transform.scale + transform.y,
      };
    },
    getElement: () => viewportRef.current,
    setTransform: (transform: ViewportTransform) => {
      viewportTransformRef.current = transform;
      setViewportTransform(transform);
      onTransformChange?.(transform);
    },
  }));

  const [isDragging, setIsDragging] = useState(false);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Handle panning - only when clicking on empty space
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (disabled) return;

      const target = e.target as HTMLElement;

      // Check if clicking on a screen container
      const screenContainer = target.closest("[data-screen-container]") as HTMLElement | null;

      // Don't pan if clicking on a screen
      if (screenContainer) {
        return;
      }

      // Check if clicking within viewport but not on a screen
      const isWithinViewport = viewportRef.current?.contains(target);
      const isEmptySpace = isWithinViewport && !screenContainer;

      if (isEmptySpace) {
        // Set drag start position for potential dragging
        setDragStart({
          x: e.clientX - viewportTransform.x,
          y: e.clientY - viewportTransform.y,
        });
        setIsMouseDown(true);
      }
    },
    [disabled, viewportTransform, viewportRef],
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      // Only handle dragging if mouse button is pressed
      if (!isMouseDown || disabled) return;

      // Handle viewport panning
      // Check if user started dragging (mouse moved significantly from initial click)
      const deltaX = Math.abs(e.clientX - (dragStart.x + viewportTransform.x));
      const deltaY = Math.abs(e.clientY - (dragStart.y + viewportTransform.y));

      if (!isDragging && (deltaX > 5 || deltaY > 5)) {
        // User started dragging
        setIsDragging(true);
        onPanStart?.();
      }

      if (isDragging) {
        const currentTransform = viewportTransformRef.current;
        const newTransform = {
          ...currentTransform,
          x: e.clientX - dragStart.x,
          y: e.clientY - dragStart.y,
        };
        viewportTransformRef.current = newTransform;
        setViewportTransform(newTransform);
        onTransformChange?.(newTransform);
      }
    },
    [
      isMouseDown,
      disabled,
      dragStart,
      viewportTransform,
      isDragging,
      onPanStart,
      onTransformChange,
      setViewportTransform,
    ],
  );

  const handleMouseUp = useCallback(() => {
    // Don't handle mouse up if viewport is disabled (e.g., when dragging a screen)
    // This prevents mouse leave from terminating screen drags
    if (disabled) return;

    if (isDragging) {
      onPanEnd?.();
    }
    setIsDragging(false);
    setIsMouseDown(false);
  }, [isDragging, onPanEnd, disabled]);

  // Handle zooming with scroll (10% to 100%)
  const handleWheel = useCallback(
    (e: WheelEvent) => {
      if (disabled) return;

      e.preventDefault();
      const delta = e.deltaY * -0.001;
      const currentTransform = viewportTransformRef.current;
      const newScale = Math.min(Math.max(0.1, currentTransform.scale + delta), 1);

      // Zoom towards mouse position
      const rect = viewportRef.current?.getBoundingClientRect();
      if (rect) {
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const scaleChange = newScale / currentTransform.scale;
        const newTransform = {
          x: mouseX - (mouseX - currentTransform.x) * scaleChange,
          y: mouseY - (mouseY - currentTransform.y) * scaleChange,
          scale: newScale,
        };

        // Update ref immediately for next event
        viewportTransformRef.current = newTransform;
        // Update state for rendering
        setViewportTransform(newTransform);
        onTransformChange?.(newTransform);
      }
    },
    [disabled, viewportRef, onTransformChange, setViewportTransform],
  );

  // Add wheel event listener with passive: false to allow preventDefault
  useEffect(() => {
    const element = viewportRef.current;
    if (!element) return;

    element.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      element.removeEventListener("wheel", handleWheel);
    };
  }, [handleWheel, viewportRef]);

  // Initialize viewport transform on mount if no saved value exists
  useEffect(() => {
    if (!hasLoaded || !isInitialMount.current) return;
    if (typeof window === "undefined") return;

    // Check if localStorage has a saved value
    const hasSavedValue = localStorage.getItem("viewportTransform") !== null;

    if (!hasSavedValue) {
      // Center viewport when there are no screens and no saved transform (first time)
      // Center at 0,0 in content coordinates means viewport should be at center of screen
      requestAnimationFrame(() => {
        if (viewportRef.current) {
          const rect = viewportRef.current.getBoundingClientRect();
          const initialTransform = {
            x: rect.width / 2,
            y: rect.height / 2,
            scale: 1,
          };
          viewportTransformRef.current = initialTransform;
          setViewportTransform(initialTransform);
          onTransformChange?.(initialTransform);
        }
      });
    } else {
      // Update ref with loaded transform (from hook)
      viewportTransformRef.current = viewportTransform;
      onTransformChange?.(viewportTransform);
    }
    isInitialMount.current = false;
  }, [hasLoaded, viewportRef, onTransformChange, viewportTransform, setViewportTransform]);

  // Keep ref in sync with state (safety measure)
  useEffect(() => {
    viewportTransformRef.current = viewportTransform;
    // Notify parent of transform changes (but not on initial mount)
    if (!isInitialMount.current) {
      onTransformChange?.(viewportTransform);
    }
  }, [viewportTransform, onTransformChange]);

  const handleMouseLeave = useCallback(() => {
    // Don't handle mouse leave if viewport is disabled (e.g., when dragging a screen)
    // This prevents mouse leave from terminating screen drags
    if (disabled) return;
    handleMouseUp();
  }, [disabled, handleMouseUp]);

  return (
    <div
      ref={viewportRef}
      className="relative h-screen w-screen overflow-hidden bg-gradient-to-br from-sky-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-950 dark:to-neutral-900"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onContextMenu={onContextMenu}
      style={{ cursor: isDragging ? "grabbing" : "grab" }}
    >
      <div
        className="viewport-content relative"
        style={{
          transform: `translate(${viewportTransform.x}px, ${viewportTransform.y}px) scale(${viewportTransform.scale})`,
          transformOrigin: "0 0",
        }}
      >
        {children}
      </div>
    </div>
  );
});

export default Viewport;
