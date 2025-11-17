import { useState, useRef, useEffect, useCallback } from "react";
import type { ViewportHandle } from "@/components/Viewport";
import type { ScreenData } from "@/lib/types";
import { snapToGrid } from "@/lib/workspace-utils";

interface UseScreenDraggingProps {
  screens: ScreenData[];
  selectedScreenId: string | null;
  setSelectedScreenId: (id: string | null) => void;
  handleScreenUpdate: (screenId: string, updates: Partial<ScreenData>) => void;
  handleScreenClick: (screenId: string, onClearPendingArrow?: () => void, onCloseDialogs?: () => void) => void;
  viewportHandleRef: React.RefObject<ViewportHandle | null>;
  onCloseDialogs?: () => void;
  newScreenFormRef: React.RefObject<HTMLDivElement | null>;
  createScreenPopupRef: React.RefObject<HTMLDivElement | null>;
  isMouseDownRef: React.MutableRefObject<boolean>;
  setIsMouseDown: React.Dispatch<React.SetStateAction<boolean>>;
}

export function useScreenDragging({
  screens,
  selectedScreenId,
  setSelectedScreenId,
  handleScreenUpdate,
  handleScreenClick,
  viewportHandleRef,
  onCloseDialogs,
  newScreenFormRef,
  createScreenPopupRef,
  isMouseDownRef,
  setIsMouseDown,
}: UseScreenDraggingProps) {
  const [draggedScreenId, setDraggedScreenId] = useState<string | null>(null);
  const draggedScreenIdRef = useRef<string | null>(null);
  const [screenDragStart, setScreenDragStart] = useState({ x: 0, y: 0, screenX: 0, screenY: 0 });
  const [isDraggingScreen, setIsDraggingScreen] = useState(false);
  const justFinishedDraggingRef = useRef<string | null>(null);

  // Handle mouse down for screen dragging
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      const target = e.target as HTMLElement;

      // Don't initiate new screen flow if clicking on the new screen form itself
      if (newScreenFormRef.current?.contains(target)) {
        return;
      }

      // Don't initiate new screen flow if clicking on the create screen popup itself
      if (createScreenPopupRef.current?.contains(target)) {
        return;
      }

      // Check if clicking on a screen container
      const screenContainer = target.closest("[data-screen-container]") as HTMLElement | null;

      // If clicking on a screen container, check if it's an overlay click first
      if (screenContainer) {
        // Check if clicking on an overlay element (touchable/clickable highlight)
        const isOverlayClick =
          target.hasAttribute("data-overlay-highlight") ||
          target.closest("[data-overlay-highlight]") !== null;

        if (isOverlayClick) {
          // Don't start screen drag, let the overlay handle it (which will start link creation)
          return;
        }

        const screenId = screenContainer.id;
        const screen = screens.find((s) => s.id === screenId);

        if (screen && screen.position) {
          // If dragging a different screen, deselect the current one
          if (screen.id !== selectedScreenId) {
            setSelectedScreenId(null);
          }

          // Set up potential screen drag (but don't mark as dragging yet)
          const viewportElement = viewportHandleRef.current?.getElement();
          if (viewportElement) {
            // Store initial mouse position and screen position
            setScreenDragStart({
              x: e.clientX,
              y: e.clientY,
              screenX: screen.position.x,
              screenY: screen.position.y,
            });
            setDraggedScreenId(screenId);
            draggedScreenIdRef.current = screenId; // Track with ref for reliable state
            setIsDraggingScreen(false); // Not dragging yet, just potential
            setIsMouseDown(true);
            isMouseDownRef.current = true; // Track with ref for reliable state
          }
          return;
        }
        return;
      }

      // Check if clicking within viewport but not on a screen
      const viewportElement = viewportHandleRef.current?.getElement();
      const isWithinViewport = viewportElement?.contains(target);
      const isEmptySpace = isWithinViewport && !screenContainer;

      if (isEmptySpace) {
        // Unselect screen when clicking on empty space
        setSelectedScreenId(null);
        setIsMouseDown(true);
        isMouseDownRef.current = true; // Track with ref for reliable state
      }
    },
    [
      screens,
      selectedScreenId,
      setSelectedScreenId,
      viewportHandleRef,
      isMouseDownRef,
      setIsMouseDown,
      newScreenFormRef,
      createScreenPopupRef,
    ],
  );

  // Handle mouse move for screen dragging
  const handleMouseMove = useCallback(
    (e: React.MouseEvent | MouseEvent) => {
      // Only handle dragging if mouse button is pressed (check ref for reliable state)
      if (!isMouseDownRef.current) {
        return;
      }

      // Handle screen dragging
      if (draggedScreenId) {
        const screen = screens.find((s) => s.id === draggedScreenId);
        if (screen && screen.position) {
          // Calculate mouse movement delta in viewport coordinates
          const deltaX = e.clientX - screenDragStart.x;
          const deltaY = e.clientY - screenDragStart.y;

          // Check if mouse moved significantly (more than 5px) to consider it a drag
          const movedSignificantly = Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5;

          if (movedSignificantly && !isDraggingScreen) {
            // User started dragging the screen
            setIsDraggingScreen(true);
          }

          // Only update position if we're actually dragging
          if (isDraggingScreen) {
            // Get current transform from viewport
            const transform = viewportHandleRef.current?.getTransform();
            if (transform) {
              // Convert delta to content coordinates (accounting for scale)
              const contentDeltaX = deltaX / transform.scale;
              const contentDeltaY = deltaY / transform.scale;

              // Calculate new screen position and snap to grid
              const newX = snapToGrid(screenDragStart.screenX + contentDeltaX);
              const newY = snapToGrid(screenDragStart.screenY + contentDeltaY);

              // Update screen position
              handleScreenUpdate(draggedScreenId, {
                position: { x: newX, y: newY },
              });
            }
          }
        }
      }
    },
    [draggedScreenId, screenDragStart, isDraggingScreen, screens, handleScreenUpdate, viewportHandleRef],
  );

  // Handle mouse up for screen dragging
  const handleMouseUp = useCallback(
    (e?: React.MouseEvent | MouseEvent) => {
      // Ignore mouseleave events when dragging a screen - only terminate on actual mouseup
      if (e && e.type === "mouseleave") {
        if (draggedScreenIdRef.current) {
          return;
        }
      }

      // If event is provided, check if clicking on the new screen form itself
      if (e && "target" in e) {
        const target = e.target as HTMLElement;
        if (newScreenFormRef.current?.contains(target)) {
          setIsMouseDown(false);
          isMouseDownRef.current = false;
          setDraggedScreenId(null);
          draggedScreenIdRef.current = null;
          return;
        }
      }

      // Handle screen click vs drag
      if (draggedScreenId) {
        if (isDraggingScreen) {
          // User dragged the screen - prevent selection
          justFinishedDraggingRef.current = draggedScreenId;
          // Clear after a short delay to allow click handler to check
          setTimeout(() => {
            justFinishedDraggingRef.current = null;
          }, 100);
        } else {
          // User just clicked (didn't drag) - select the screen
          handleScreenClick(draggedScreenId, undefined, onCloseDialogs, justFinishedDraggingRef);
        }
      }

      // Reset drag and click tracking
      setIsMouseDown(false);
      isMouseDownRef.current = false; // Clear ref state
      setIsDraggingScreen(false);
      setDraggedScreenId(null);
      draggedScreenIdRef.current = null; // Clear ref state
    },
    [draggedScreenId, isDraggingScreen, handleScreenClick, onCloseDialogs, newScreenFormRef, justFinishedDraggingRef],
  );

  // Attach global window listeners when dragging to continue drag even if mouse leaves viewport
  useEffect(() => {
    if (draggedScreenId) {
      const handleGlobalMouseMove = (e: MouseEvent) => {
        // Only process if mouse button is still down (check ref for reliable state)
        if (isMouseDownRef.current && draggedScreenIdRef.current) {
          handleMouseMove(e);
        }
      };
      const handleGlobalMouseUp = (e: MouseEvent) => {
        // Always handle mouse up to ensure drag terminates properly
        // Only process if we're actually dragging this screen (check ref for reliable state)
        if (draggedScreenIdRef.current) {
          handleMouseUp(e);
        }
      };

      window.addEventListener("mousemove", handleGlobalMouseMove, { capture: true });
      window.addEventListener("mouseup", handleGlobalMouseUp, { capture: true });

      return () => {
        window.removeEventListener("mousemove", handleGlobalMouseMove, { capture: true });
        window.removeEventListener("mouseup", handleGlobalMouseUp, { capture: true });
      };
    }
  }, [draggedScreenId, handleMouseMove, handleMouseUp]);

  return {
    isMouseDown,
    isMouseDownRef,
    draggedScreenId,
    isDraggingScreen,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    justFinishedDraggingRef,
  };
}

