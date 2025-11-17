"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useSession, signIn } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import JSZip from "jszip";
import Screen from "@/components/Screen";
import UserAvatar from "@/components/UserAvatar";
import WorkspaceHeader from "@/components/WorkspaceHeader";
import CreateScreenPopup from "@/components/CreateScreenPopup";
import NewScreenDialog from "@/components/NewScreenDialog";
import ArrowLine from "@/components/ArrowLine";
import CreateFromTouchableButton from "@/components/CreateFromTouchableButton";
import Viewport, { type ViewportHandle } from "@/components/Viewport";
import { usePersistentState } from "@/hooks/usePersistentState";
import type { ScreenData, ConversationPointArrow } from "@/lib/types";
import { storage } from "@/lib/storage";

// Grid size for snapping
const GRID_SIZE = 16;

// Helper function to snap a value to the grid
const snapToGrid = (value: number): number => {
  return Math.round(value / GRID_SIZE) * GRID_SIZE;
};

export default function WorkspacePage() {
  const params = useParams();
  const router = useRouter();
  const workspaceId = params.id as string;
  useSession(); // Keep for auth initialization
  const [screens, setScreens] = useState<ScreenData[]>([]);
  const [isLoadingScreens, setIsLoadingScreens] = useState(true);
  const [workspaceName, setWorkspaceName] = useState<string>("");
  const [isLoadingWorkspace, setIsLoadingWorkspace] = useState(true);
  const [selectedScreenId, setSelectedScreenId] = useState<string | null>(null);
  const screenSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastUpdatedScreenIdRef = useRef<string | null>(null);
  const hasCompletedInitialLoadRef = useRef<boolean>(false);
  const [isMouseDown, setIsMouseDown] = useState(false);
  // Track mouse button state with a ref for reliable tracking even when mouse leaves viewport
  const isMouseDownRef = useRef(false);
  const [draggedScreenId, setDraggedScreenId] = useState<string | null>(null);
  const draggedScreenIdRef = useRef<string | null>(null);
  const [screenDragStart, setScreenDragStart] = useState({ x: 0, y: 0, screenX: 0, screenY: 0 });
  const [isDraggingScreen, setIsDraggingScreen] = useState(false);
  const justFinishedDraggingRef = useRef<string | null>(null);
  const [isCreateScreenPopupMode, setIsCreateScreenPopupMode] = useState(false);
  const [isNewScreenMode, setIsNewScreenMode] = useState(false);
  const [isCreatingScreen, setIsCreatingScreen] = useState(false);
  const [newScreenInput, setNewScreenInput] = usePersistentState<string>("newScreenInput", "", 300);
  const [newScreenPosition, setNewScreenPosition] = useState({ x: 0, y: 0 });
  const newScreenFormRef = useRef<HTMLDivElement>(null);
  const createScreenPopupRef = useRef<HTMLDivElement>(null);
  const viewportHandleRef = useRef<ViewportHandle>(null);
  const [arrowLine, setArrowLine] = useState<{
    start: { x: number; y: number };
    end: { x: number; y: number };
    startScreenId: string;
    touchableId: string; // aria-roledescription value from the touchable element
    text: string;
    isPending?: boolean; // True when dropped in empty space, waiting for button click
  } | null>(null);
  const [isCloningScreen, setIsCloningScreen] = useState(false);
  const hoveredScreenIdRef = useRef<string | null>(null);

  // Load workspace info
  useEffect(() => {
    const loadWorkspace = async () => {
      try {
        const response = await fetch(`/api/workspaces/${workspaceId}`);
        if (!response.ok) {
          if (response.status === 404) {
            router.push("/files");
            return;
          }
          throw new Error("Failed to load workspace");
        }
        const workspace = await response.json();
        setWorkspaceName(workspace.name || "");
      } catch (error) {
        console.error("Error loading workspace:", error);
        router.push("/files");
      } finally {
        setIsLoadingWorkspace(false);
      }
    };
    if (workspaceId) {
      loadWorkspace();
    }
  }, [workspaceId, router]);

  // Update page title when workspace name changes
  useEffect(() => {
    const displayName = workspaceName || "Untitled workspace";
    document.title = `${displayName} - UI Generator`;
  }, [workspaceName]);

  const handleWorkspaceNameUpdate = async (name: string) => {
    try {
      const response = await fetch(`/api/workspaces/${workspaceId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!response.ok) {
        throw new Error("Failed to update workspace name");
      }
      const updated = await response.json();
      setWorkspaceName(updated.name || "");
    } catch (error) {
      console.error("Error updating workspace name:", error);
    }
  };

  // Handle screen dragging and selection
  const handleMouseDown = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;

    // Don't initiate new screen flow if clicking on the new screen form itself
    if (newScreenFormRef.current?.contains(target)) {
      return;
    }

    // Don't initiate new screen flow if clicking on the create screen popup itself
    if (createScreenPopupRef.current?.contains(target)) {
      return;
    }

    // Hide popup and dialog on any left click (unless clicking on popup/form itself)
    if (isCreateScreenPopupMode) {
      setIsCreateScreenPopupMode(false);
    }
    if (isNewScreenMode) {
      setIsNewScreenMode(false);
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
        // Clear pending arrow when clicking on a screen (will start new drag or selection)
        if (arrowLine?.isPending) {
          setArrowLine(null);
        }
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
      // Clear pending arrow when clicking on viewport (but not on the button itself)
      if (arrowLine?.isPending) {
        const isButtonClick = target.closest("button[aria-label='Create new screen']") !== null;
        if (!isButtonClick) {
          setArrowLine(null);
        }
      }
      // Unselect screen when clicking on empty space
      setSelectedScreenId(null);
      // Dismiss popup and dialog when clicking on empty space
      // (These are also dismissed at the top of handleMouseDown, but ensure they're dismissed here too)
      if (isCreateScreenPopupMode) {
        setIsCreateScreenPopupMode(false);
      }
      if (isNewScreenMode) {
        setIsNewScreenMode(false);
      }
      setIsMouseDown(true);
      isMouseDownRef.current = true; // Track with ref for reliable state
    } else if (isWithinViewport) {
      // Clicking on viewport (but might be on a screen or other element)
      // Still dismiss dialogs if they're open (unless clicking on the dialog itself)
      // This handles cases where dialogs might be blocking viewport clicks
      if (isCreateScreenPopupMode) {
        setIsCreateScreenPopupMode(false);
      }
      if (isNewScreenMode) {
        setIsNewScreenMode(false);
      }
    }
  };

  // Handle mouse move - works with both React events and native MouseEvent
  const handleMouseMove = useCallback(
    (e: React.MouseEvent | MouseEvent) => {
      // Only handle dragging if mouse button is pressed (check ref for reliable state)
      if (!isMouseDownRef.current) {
        console.log("[page] handleMouseMove: mouse not down, ref:", isMouseDownRef.current);
        return;
      }

      // Handle arrow line drawing
      if (arrowLine) {
        console.log("[page] handleMouseMove: updating arrow line", {
          arrowLine,
          clientX: e.clientX,
          clientY: e.clientY,
        });
        const viewportElement = viewportHandleRef.current?.getElement();
        const rect = viewportElement?.getBoundingClientRect();
        if (rect) {
          const endX = e.clientX - rect.left;
          const endY = e.clientY - rect.top;

          // Check if mouse is over a screen (but not the start screen)
          // Use elementFromPoint to get the element at mouse position, as e.target might be a child
          const elementAtPoint =
            typeof document !== "undefined"
              ? document.elementFromPoint(e.clientX, e.clientY)
              : null;
          const screenContainer = elementAtPoint?.closest(
            "[data-screen-container]",
          ) as HTMLElement | null;
          const hoveredScreenId = screenContainer?.id || null;

          // Only update hovered screen if it's different from start screen
          if (hoveredScreenId && hoveredScreenId !== arrowLine.startScreenId) {
            hoveredScreenIdRef.current = hoveredScreenId;
          } else {
            hoveredScreenIdRef.current = null;
          }

          setArrowLine({
            ...arrowLine,
            end: { x: endX, y: endY },
          });
          console.log("[page] Arrow line updated", {
            endX,
            endY,
            hoveredScreenId: hoveredScreenIdRef.current,
          });
        } else {
          console.warn("[page] No viewport rect in handleMouseMove for arrow");
        }
        return; // Don't handle other dragging when drawing arrow
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
        return; // Don't handle panning when potentially dragging a screen
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isMouseDown, arrowLine, draggedScreenId, screenDragStart, isDraggingScreen, screens],
  );

  // Handle mouse up - works with both React events and native MouseEvent
  const handleMouseUp = useCallback(
    (e?: React.MouseEvent | MouseEvent) => {
      // Ignore mouseleave events when dragging a screen or drawing an arrow - only terminate on actual mouseup
      if (e && e.type === "mouseleave") {
        if (draggedScreenIdRef.current || arrowLine) {
          console.log("[page] Ignoring mouseleave event", {
            draggingScreen: !!draggedScreenIdRef.current,
            drawingArrow: !!arrowLine,
          });
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
          setArrowLine(null);
          return;
        }
      }

      // Save arrow when mouse is released (only if connected to a screen)
      if (arrowLine) {
        console.log("[page] handleMouseUp: arrowLine exists, saving arrow", {
          arrowLine,
          hoveredScreenId: hoveredScreenIdRef.current,
        });
        // Check if mouse is over a screen at release time
        let endScreenId = hoveredScreenIdRef.current;

        // Double-check by looking at the element at mouse position if event is available
        if (e && !endScreenId && typeof document !== "undefined") {
          const elementAtPoint = document.elementFromPoint(e.clientX, e.clientY);
          const screenContainer = elementAtPoint?.closest(
            "[data-screen-container]",
          ) as HTMLElement | null;
          endScreenId = screenContainer?.id || null;

          // Only allow if it's a different screen from the start
          if (endScreenId === arrowLine.startScreenId) {
            endScreenId = null;
          }
        }

        // Only save arrow if connected to a screen
        if (endScreenId) {
          console.log("[page] Saving arrow to screen", {
            endScreenId,
            startScreenId: arrowLine.startScreenId,
          });
          const startScreen = screens.find((s) => s.id === arrowLine.startScreenId);

          if (startScreen) {
            // Find the selected conversation point (or use the last one if none selected)
            const conversationPointIndex =
              startScreen.selectedPromptIndex !== null
                ? startScreen.selectedPromptIndex
                : startScreen.conversationPoints.length > 0
                  ? startScreen.conversationPoints.length - 1
                  : null;

            if (
              conversationPointIndex !== null &&
              conversationPointIndex < startScreen.conversationPoints.length
            ) {
              // Get the conversation point
              const conversationPoint = startScreen.conversationPoints[conversationPointIndex];

              // Initialize arrows array if it doesn't exist
              const existingArrows = conversationPoint.arrows || [];

              // Remove any existing arrow from the same touchable
              const filteredArrows = existingArrows.filter(
                (arrow) => arrow.touchableId !== arrowLine.touchableId,
              );

              // Convert start point from viewport coordinates to content coordinates relative to start screen center
              const viewportToContent = viewportHandleRef.current?.viewportToContent;
              if (!viewportToContent) return;
              const startContent = viewportToContent(arrowLine.start.x, arrowLine.start.y);
              const startContentX = startContent.x;
              const startContentY = startContent.y;
              // Relative to screen center
              const startRelativeX = startScreen.position
                ? startContentX - startScreen.position.x
                : 0;
              const startRelativeY = startScreen.position
                ? startContentY - startScreen.position.y
                : 0;

              // Add the new arrow
              const newArrow: ConversationPointArrow = {
                touchableId: arrowLine.touchableId,
                targetScreenId: endScreenId,
                startPoint: { x: startRelativeX, y: startRelativeY },
              };

              const updatedArrows = [...filteredArrows, newArrow];

              // Update the conversation point with the new arrows array
              const updatedConversationPoints = [...startScreen.conversationPoints];
              updatedConversationPoints[conversationPointIndex] = {
                ...conversationPoint,
                arrows: updatedArrows,
              };

              // Update the screen with the updated conversation points
              handleScreenUpdate(arrowLine.startScreenId, {
                conversationPoints: updatedConversationPoints,
              });

              // Persist arrows to database
              const updatedConversationPoint = updatedConversationPoints[conversationPointIndex];
              if (updatedConversationPoint.id) {
                storage
                  .updateDialogEntryArrows(
                    arrowLine.startScreenId,
                    updatedConversationPoint.id,
                    updatedArrows,
                  )
                  .catch((error) => {
                    console.error("Error saving arrows to database:", error);
                  });
              }
            }
          }
          // Clear arrow state after saving
          console.log("[page] Clearing arrow state after saving");
          setArrowLine(null);
          hoveredScreenIdRef.current = null;
          setIsMouseDown(false);
          isMouseDownRef.current = false;
          return;
        } else {
          // Dropped in empty space - keep arrow in pending state with button
          console.log("[page] Arrow dropped in empty space, keeping in pending state");
          setArrowLine({
            ...arrowLine,
            isPending: true,
          });
          hoveredScreenIdRef.current = null;
          setIsMouseDown(false);
          isMouseDownRef.current = false;
          return;
        }
      }

      // Left click on empty space now only deselects (popup moved to right-click)
      // Also clear pending arrow if clicking on empty space (but not on the button itself)
      // Check for pending arrow separately since it might exist even when not actively dragging
      if (e) {
        const target = e.target as HTMLElement;
        // Check if there's a pending arrow and we're not clicking on the button itself
        // Use type assertion to help TypeScript understand that arrowLine can be pending
        const pendingArrow = arrowLine as {
          isPending: true;
          start: { x: number; y: number };
          end: { x: number; y: number };
          startScreenId: string;
          touchableId: string;
          text: string;
        } | null;
        if (
          pendingArrow &&
          pendingArrow.isPending &&
          !target.closest("button[aria-label='Create new screen']")
        ) {
          setArrowLine(null);
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
          handleScreenClick(draggedScreenId);
        }
      }

      // Reset drag and click tracking
      setIsMouseDown(false);
      isMouseDownRef.current = false; // Clear ref state
      setIsDraggingScreen(false);
      setDraggedScreenId(null);
      draggedScreenIdRef.current = null; // Clear ref state
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [arrowLine, screens, draggedScreenId, isDraggingScreen],
  );

  // Handle right-click to show new screen menu
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent default browser context menu

    const target = e.target as HTMLElement;

    // Don't show menu if clicking on the new screen form itself
    if (newScreenFormRef.current?.contains(target)) {
      return;
    }

    // Don't show menu if clicking on the create screen popup itself
    if (createScreenPopupRef.current?.contains(target)) {
      return;
    }

    // Check if clicking on a screen container
    const screenContainer = target.closest("[data-screen-container]") as HTMLElement | null;

    // Only show menu on empty space (not on screens)
    if (!screenContainer) {
      // Check if clicking within viewport
      const viewportElement = viewportHandleRef.current?.getElement();
      const isWithinViewport = viewportElement?.contains(target);
      if (isWithinViewport) {
        // Use clientX/clientY directly for fixed positioning (not affected by viewport transform)
        const position = {
          x: e.clientX,
          y: e.clientY,
        };
        setNewScreenPosition(position);
        // Toggle popup: if already open, close it; otherwise open it
        if (isCreateScreenPopupMode) {
          setIsCreateScreenPopupMode(false);
        } else {
          setIsCreateScreenPopupMode(true);
        }
      }
    }
  };

  // Attach global window listeners when dragging to continue drag even if mouse leaves viewport
  // Attach as soon as draggedScreenId is set (not just when isDraggingScreen is true)
  // This ensures we catch mouse movement even if it leaves the viewport before the 5px threshold
  // Use capture phase to catch events before they can be stopped by other handlers
  useEffect(() => {
    if (draggedScreenId) {
      // Create wrapper functions that match the expected signature
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

  // Attach global window listeners when drawing arrow to continue even if mouse leaves viewport
  // Use capture phase to catch events before they can be stopped by other handlers
  useEffect(() => {
    if (arrowLine) {
      // Create wrapper functions that match the expected signature
      const handleGlobalMouseMove = (e: MouseEvent) => {
        // Only process if mouse button is still down (check ref for reliable state)
        if (isMouseDownRef.current) {
          handleMouseMove(e);
        }
      };
      const handleGlobalMouseUp = (e: MouseEvent) => {
        // Always handle mouse up to ensure arrow creation terminates properly
        // handleMouseUp will check arrowLine internally
        handleMouseUp(e);
      };

      window.addEventListener("mousemove", handleGlobalMouseMove, { capture: true });
      window.addEventListener("mouseup", handleGlobalMouseUp, { capture: true });

      return () => {
        window.removeEventListener("mousemove", handleGlobalMouseMove, { capture: true });
        window.removeEventListener("mouseup", handleGlobalMouseUp, { capture: true });
      };
    }
  }, [arrowLine, handleMouseMove, handleMouseUp]);

  // Center and zoom to 100% when a screen is selected
  const centerAndZoomScreen = useCallback(
    (screenId: string) => {
      // Don't run during SSR
      if (typeof window === "undefined" || typeof document === "undefined") {
        return;
      }
      // Use requestAnimationFrame to ensure DOM is updated
      requestAnimationFrame(() => {
        const screenElement = document.getElementById(screenId);
        const viewportElement = viewportHandleRef.current?.getElement();
        if (screenElement && viewportElement) {
          const viewportRect = viewportElement.getBoundingClientRect();

          // Find the screen data to get its position in content coordinates
          const screen = screens.find((s) => s.id === screenId);

          let screenCenterXContent: number;
          let screenCenterYContent: number;

          if (screen?.position) {
            // Use stored position
            screenCenterXContent = screen.position.x;
            screenCenterYContent = screen.position.y;
          } else {
            // Fallback: get position from DOM (for initial screen or screens without position)
            const screenRect = screenElement.getBoundingClientRect();

            // Get current transform from viewport
            const currentTransform = viewportHandleRef.current?.getTransform();
            if (!currentTransform) return;

            // Convert from viewport coordinates to content coordinates
            // screenRect is in document coordinates, so subtract viewportRect to get viewport-relative
            const screenCenterXViewport =
              screenRect.left + screenRect.width / 2 - viewportRect.left;
            const screenCenterYViewport = screenRect.top + screenRect.height / 2 - viewportRect.top;

            // Convert to content coordinates
            screenCenterXContent =
              (screenCenterXViewport - currentTransform.x) / currentTransform.scale;
            screenCenterYContent =
              (screenCenterYViewport - currentTransform.y) / currentTransform.scale;

            // Viewport center in viewport coordinates
            const viewportCenterX = viewportRect.width / 2;
            const viewportCenterY = viewportRect.height / 2;

            // Calculate new transform to center the screen at scale 1
            const newX = viewportCenterX - screenCenterXContent;
            const newY = viewportCenterY - screenCenterYContent;

            const newTransform = {
              x: newX,
              y: newY,
              scale: 1,
            };
            viewportHandleRef.current?.setTransform(newTransform);
            return; // Early return for fallback case
          }

          // Viewport center in viewport coordinates
          const viewportCenterX = viewportRect.width / 2;
          const viewportCenterY = viewportRect.height / 2;

          // To center the screen, we need:
          // viewportCenter = screenCenterContent * scale + transform
          // So: transform = viewportCenter - screenCenterContent * scale
          // With scale = 1:
          const newX = viewportCenterX - screenCenterXContent;
          const newY = viewportCenterY - screenCenterYContent;

          // Apply the transform and reset scale to 1
          const newTransform = {
            x: newX,
            y: newY,
            scale: 1,
          };
          viewportHandleRef.current?.setTransform(newTransform);
        }
      });
    },
    [screens],
  );

  // Handle screen creation
  const handleScreenCreate = useCallback((screenData: Omit<ScreenData, "id">) => {
    // Generate ID when function is called, not during render
    const timestamp = Date.now();
    const newScreen: ScreenData = {
      ...screenData,
      id: `screen-${timestamp}`,
      // Position will be set when creating from form, otherwise use default
      position: screenData.position || { x: 0, y: 0 },
    };
    setScreens((prevScreens) => [...prevScreens, newScreen]);
    // Don't auto-select - let user click to select if they want
    // setSelectedScreenId(newScreen.id);

    // Don't auto-center/zoom - this disrupts the viewport when creating multiple screens
    // centerAndZoomScreen(newScreen.id);
  }, []);

  // Handle creating a new screen from pending arrow button
  const handleCreateScreenFromPendingArrow = useCallback(async () => {
    if (!arrowLine || !arrowLine.isPending || isCloningScreen) return;

    setIsCloningScreen(true);

    try {
      // Find the original screen from which the arrow is drawn
      const originalScreen = screens.find((s) => s.id === arrowLine.startScreenId);
      if (!originalScreen) {
        console.error("Original screen not found for cloning");
        setIsCloningScreen(false);
        return;
      }

      // Get the active conversation point index (selected or last one)
      const activePointIndex =
        originalScreen.selectedPromptIndex !== null
          ? originalScreen.selectedPromptIndex
          : originalScreen.conversationPoints.length > 0
            ? originalScreen.conversationPoints.length - 1
            : null;

      if (
        activePointIndex === null ||
        activePointIndex >= originalScreen.conversationPoints.length
      ) {
        console.error("No active conversation point found");
        setIsCloningScreen(false);
        return;
      }

      // Get the active conversation point ID (required for clone endpoint)
      const activePoint = originalScreen.conversationPoints[activePointIndex];
      if (!activePoint.id) {
        console.error("Active conversation point has no ID");
        setIsCloningScreen(false);
        return;
      }

      // Create prompt for the new dialog entry
      const prompt = `Create a screen that should be shown after user presses at '${arrowLine.touchableId}'`;

      // Convert arrow end position from viewport coordinates to content coordinates
      const viewportToContent = viewportHandleRef.current?.viewportToContent;
      if (!viewportToContent) {
        setIsCloningScreen(false);
        return;
      }

      const contentPos = viewportToContent(arrowLine.end.x, arrowLine.end.y);
      const contentX = snapToGrid(contentPos.x);
      const contentY = snapToGrid(contentPos.y);

      // Step 1: Clone the screen using the clone endpoint
      const cloneResponse = await fetch(`/api/screens/${arrowLine.startScreenId}/clone`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          convPointId: activePoint.id,
          x: contentX,
          y: contentY,
        }),
      });

      if (!cloneResponse.ok) {
        if (cloneResponse.status === 401) {
          // Save prompt and position for restoration after auth
          await storage.savePendingPrompt(prompt, null, { x: contentX, y: contentY });
          // Trigger sign in - will redirect back after auth
          signIn("google", { callbackUrl: window.location.href });
          setIsCloningScreen(false);
          return;
        }
        throw new Error("Failed to clone screen");
      }

      const clonedScreen: ScreenData = await cloneResponse.json();

      // Step 2: Add new dialog entry to the cloned screen with the prompt
      const timestamp = Date.now();
      const screenWithNewEntry: ScreenData = {
        ...clonedScreen,
        conversationPoints: [
          ...clonedScreen.conversationPoints,
          // Add new incomplete conversation point for the new dialog entry
          {
            prompt,
            html: "",
            title: null,
            timestamp,
            arrows: [],
          },
        ],
        selectedPromptIndex: clonedScreen.conversationPoints.length, // Select the new point
      };

      // Add cloned screen immediately with new incomplete conversation point
      setScreens((prevScreens) => [...prevScreens, screenWithNewEntry]);

      // Step 3: Update the arrow in the original screen's conversation point to point to the cloned screen
      const updatedArrows = [
        ...(activePoint.arrows || []).filter(
          (arrow) => arrow.touchableId !== arrowLine.touchableId,
        ),
        {
          touchableId: arrowLine.touchableId,
          targetScreenId: clonedScreen.id,
          startPoint: {
            // Calculate start point relative to screen center
            x: originalScreen.position
              ? viewportToContent(arrowLine.start.x, arrowLine.start.y).x -
                originalScreen.position.x
              : 0,
            y: originalScreen.position
              ? viewportToContent(arrowLine.start.x, arrowLine.start.y).y -
                originalScreen.position.y
              : 0,
          },
        },
      ];

      setScreens((prevScreens) => {
        const screenIndex = prevScreens.findIndex((s) => s.id === arrowLine.startScreenId);
        if (screenIndex === -1) return prevScreens;

        const screen = prevScreens[screenIndex];
        const updatedConversationPoints = [...screen.conversationPoints];
        updatedConversationPoints[activePointIndex] = {
          ...activePoint,
          arrows: updatedArrows,
        };

        const updatedScreens = [...prevScreens];
        updatedScreens[screenIndex] = {
          ...screen,
          conversationPoints: updatedConversationPoints,
        };
        return updatedScreens;
      });

      // Persist the arrow to the database
      if (activePoint.id) {
        storage
          .updateDialogEntryArrows(arrowLine.startScreenId, activePoint.id, updatedArrows)
          .catch((error) => {
            console.error("Error saving arrow to database:", error);
          });
      }

      // The Screen component's auto-generation effect will handle creating the dialog entry
      // for the new incomplete point and starting HTML generation

      // Clear the pending arrow
      setArrowLine(null);
    } catch (error) {
      console.error("Error creating screen from pending arrow:", error);
      // TODO: Show error to user
    } finally {
      setIsCloningScreen(false);
    }
  }, [arrowLine, screens, isCloningScreen]);

  // Handle creating a new screen from the form
  const handleCreateNewScreen = useCallback(async () => {
    if (!newScreenInput.trim() || isCreatingScreen) return;

    setIsCreatingScreen(true);

    // Convert from browser viewport coordinates (clientX, clientY) to viewport container coordinates,
    // then to content coordinates
    const viewportElement = viewportHandleRef.current?.getElement();
    const viewportToContent = viewportHandleRef.current?.viewportToContent;
    if (!viewportElement || !viewportToContent) return;

    const rect = viewportElement.getBoundingClientRect();
    // Convert from browser viewport coordinates to viewport container coordinates
    const viewportX = newScreenPosition.x - rect.left;
    const viewportY = newScreenPosition.y - rect.top;
    // Convert from viewport container coordinates to content coordinates
    const contentPos = viewportToContent(viewportX, viewportY);
    const contentX = snapToGrid(contentPos.x);
    const contentY = snapToGrid(contentPos.y);

    const prompt = newScreenInput.trim();

    try {
      // Step 1: Create screen via API (without prompt)
      const screenResponse = await fetch(
        `/api/screens?workspaceId=${encodeURIComponent(workspaceId)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            x: contentX,
            y: contentY,
          }),
        },
      );

      if (!screenResponse.ok) {
        if (screenResponse.status === 401) {
          // Save prompt and position for restoration after auth
          await storage.savePendingPrompt(prompt, null, { x: contentX, y: contentY });
          // Trigger sign in - will redirect back after auth
          signIn("google", { callbackUrl: window.location.href });
          setIsCreatingScreen(false);
          return;
        }
        throw new Error("Failed to create screen");
      }

      const newScreen: ScreenData = await screenResponse.json();

      // Add incomplete conversation point immediately so placeholder can show the prompt
      const timestamp = Date.now();
      const screenWithIncompletePoint: ScreenData = {
        ...newScreen,
        conversationPoints: [
          {
            prompt,
            html: "",
            title: null,
            timestamp,
            arrows: [],
          },
        ],
        selectedPromptIndex: 0,
      };

      // Add screen immediately with incomplete conversation point so it appears right away
      // The Screen component's auto-generation effect will handle creating the dialog entry
      setScreens((prevScreens) => [...prevScreens, screenWithIncompletePoint]);

      // Close the form and clear input
      setIsNewScreenMode(false);
      setNewScreenInput("");
      setIsCreatingScreen(false);

      // Don't auto-center/zoom - this disrupts the viewport when creating multiple screens
      // centerAndZoomScreen(newScreen.id);
    } catch (error) {
      console.error("Error creating screen:", error);
      // TODO: Show error to user
      setIsCreatingScreen(false);
    }
  }, [newScreenInput, newScreenPosition, setNewScreenInput, isCreatingScreen, workspaceId]);

  // Handle screen update
  const handleScreenUpdate = useCallback((screenId: string, updates: Partial<ScreenData>) => {
    // Track which screen was updated for efficient saving (only if position or selectedPromptIndex changed)
    if (updates.position || updates.selectedPromptIndex !== undefined) {
      lastUpdatedScreenIdRef.current = screenId;
    }

    // Use functional update to avoid race conditions when multiple screens update simultaneously
    setScreens((prevScreens) => {
      const screenIndex = prevScreens.findIndex((s) => s.id === screenId);
      if (screenIndex === -1) {
        // Screen not found - this shouldn't happen, but log for debugging
        console.warn(`Screen ${screenId} not found in screens array`);
        return prevScreens;
      }

      return prevScreens.map((screen) => {
        if (screen.id === screenId) {
          // Always preserve position unless explicitly updated
          // This ensures position is never lost during updates
          const updatedScreen = { ...screen, ...updates };
          if (!updates.position && screen.position) {
            // Preserve existing position if not being updated
            updatedScreen.position = screen.position;
          }
          return updatedScreen;
        }
        return screen;
      });
    });
  }, []);

  // Handle screen click
  const handleScreenClick = (screenId: string) => {
    // Clear pending arrow when clicking on a screen
    if (arrowLine?.isPending) {
      setArrowLine(null);
    }
    // Don't select if we just finished dragging this screen
    if (justFinishedDraggingRef.current === screenId) {
      return;
    }
    // Don't re-select if already selected (prevents double-selection from click event after mouseUp)
    if (selectedScreenId === screenId) {
      return;
    }
    setSelectedScreenId(screenId);
    // Close new screen form if it's open
    setIsNewScreenMode(false);
    // Close create screen popup if it's open
    setIsCreateScreenPopupMode(false);
    // Disabled: centerAndZoomScreen(screenId);
  };

  // Handle screen deletion
  const handleScreenDelete = useCallback(
    async (screenId: string) => {
      try {
        // Delete from backend
        await storage.deleteScreen(screenId);
        // Update local state
        setScreens((prevScreens) => prevScreens.filter((s) => s.id !== screenId));
        // Deselect if the deleted screen was selected
        if (selectedScreenId === screenId) {
          setSelectedScreenId(null);
        }
      } catch (error) {
        console.error("Error deleting screen:", error);
        // Still update local state to provide immediate feedback
        setScreens((prevScreens) => prevScreens.filter((s) => s.id !== screenId));
        if (selectedScreenId === screenId) {
          setSelectedScreenId(null);
        }
      }
    },
    [selectedScreenId],
  );

  // Handle screen cloning
  const handleScreenClone = useCallback(
    (screenId: string, pointIndex: number) => {
      const originalScreen = screens.find((s) => s.id === screenId);
      if (!originalScreen) {
        console.warn(`Screen ${screenId} not found for cloning`);
        return;
      }

      // Create new screen with conversation history up to and including pointIndex
      // Snap position to grid
      const timestamp = Date.now();
      const clonedScreen: ScreenData = {
        id: `screen-${timestamp}`,
        conversationPoints: originalScreen.conversationPoints.slice(0, pointIndex + 1),
        selectedPromptIndex: pointIndex,
        position: originalScreen.position
          ? {
              x: snapToGrid(originalScreen.position.x + 50),
              y: snapToGrid(originalScreen.position.y + 50),
            }
          : { x: snapToGrid(50), y: snapToGrid(50) },
      };

      setScreens((prevScreens) => [...prevScreens, clonedScreen]);
      // Don't auto-select the cloned screen
    },
    [screens],
  );

  // Helper function to convert string to kebab case
  const toKebabCase = (str: string): string => {
    return str
      .replace(/([a-z])([A-Z])/g, "$1-$2")
      .replace(/[\s_]+/g, "-")
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  };

  // Helper function to wrap HTML with Tailwind and remove links
  const wrapHtmlWithTailwindAndRemoveLinks = (html: string): string => {
    // Remove links by converting <a> tags to <span> tags
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const links = doc.querySelectorAll("a[href]");
    links.forEach((link) => {
      const span = doc.createElement("span");
      // Copy all attributes except href
      Array.from(link.attributes).forEach((attr) => {
        if (attr.name !== "href") {
          span.setAttribute(attr.name, attr.value);
        }
      });
      // Copy all child nodes
      while (link.firstChild) {
        span.appendChild(link.firstChild);
      }
      link.parentNode?.replaceChild(span, link);
    });
    const processedHtml = doc.body.innerHTML;

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Generated UI</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" integrity="sha512-DTOQO9RWCH3ppGqcWaEA1BIZOC6xxalwEsw9c2QQeAIftl+Vegovlnee1c9QX4TctnWMn13TZye+giMm8e2LwA==" crossorigin="anonymous" referrerpolicy="no-referrer" />
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { width: 100%; min-height: 844px; }
    body > * { min-height: 844px; }
  </style>
</head>
<body>
  ${processedHtml}
</body>
</html>`;
  };

  // Handle workspace download
  const handleDownload = useCallback(async () => {
    if (screens.length === 0) {
      console.warn("No screens to download");
      return;
    }

    try {
      const zip = new JSZip();
      const usedFileNames = new Set<string>();

      // Process each screen
      for (const screen of screens) {
        // Get the selected conversation point or the last one
        const conversationPointIndex =
          screen.selectedPromptIndex !== null
            ? screen.selectedPromptIndex
            : screen.conversationPoints.length > 0
              ? screen.conversationPoints.length - 1
              : null;

        if (conversationPointIndex === null || conversationPointIndex >= screen.conversationPoints.length) {
          continue; // Skip screens without conversation points
        }

        const conversationPoint = screen.conversationPoints[conversationPointIndex];
        if (!conversationPoint.html) {
          continue; // Skip screens without HTML content
        }

        // Get screen name from title or use a default
        const screenName = conversationPoint.title || "untitled-screen";
        const baseFileName = toKebabCase(screenName);
        let fileName = `${baseFileName}.html`;
        let counter = 1;

        // Ensure unique filename
        while (usedFileNames.has(fileName)) {
          fileName = `${baseFileName}-${counter}.html`;
          counter++;
        }
        usedFileNames.add(fileName);

        // Wrap HTML with Tailwind and remove links
        const wrappedHtml = wrapHtmlWithTailwindAndRemoveLinks(conversationPoint.html);

        // Add to zip
        zip.file(fileName, wrappedHtml);
      }

      // Generate zip file
      const zipBlob = await zip.generateAsync({ type: "blob" });

      // Create download link
      const url = URL.createObjectURL(zipBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${toKebabCase(workspaceName || "workspace")}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading workspace:", error);
    }
  }, [screens, workspaceName]);

  // Handle overlay click - start arrow from center of clicked overlay
  const handleOverlayClick = useCallback(
    (center: { x: number; y: number }, screenId: string, touchableId: string, text: string) => {
      console.log("[page] handleOverlayClick called", { center, screenId, touchableId, text });
      // Clear any pending arrow when starting a new one
      if (arrowLine?.isPending) {
        setArrowLine(null);
      }
      const viewportElement = viewportHandleRef.current?.getElement();
      const rect = viewportElement?.getBoundingClientRect();
      console.log("[page] Viewport element and rect", { hasElement: !!viewportElement, rect });
      if (rect) {
        // Don't remove existing arrow yet - only remove when arrow is actually created or cancelled
        // This prevents unnecessary server updates when just starting to drag

        // Convert from viewport (browser window) coordinates to viewport container coordinates
        const startX = center.x - rect.left;
        const startY = center.y - rect.top;
        console.log("[page] Setting arrowLine", { startX, startY, screenId, touchableId, text });
        setArrowLine({
          start: { x: startX, y: startY },
          end: { x: startX, y: startY },
          startScreenId: screenId,
          touchableId,
          text,
        });
        setIsMouseDown(true);
        isMouseDownRef.current = true; // Set ref so handleMouseMove can track arrow drawing
        console.log("[page] Set isMouseDown and ref", {
          isMouseDown: true,
          refValue: isMouseDownRef.current,
        });
      } else {
        console.warn("[page] No viewport rect available!");
      }
    },
    [arrowLine],
  );

  // Effect to center screen after selection - DISABLED
  // useEffect(() => {
  //   if (selectedScreenId) {
  //     centerAndZoomScreen(selectedScreenId);
  //   }
  // }, [selectedScreenId, centerAndZoomScreen]);

  // Load screens from storage on mount
  useEffect(() => {
    if (!workspaceId) return;
    const loadData = async () => {
      try {
        // Load screens for this workspace
        const loadedScreens = await storage.loadScreens(workspaceId);
        if (loadedScreens.length > 0) {
          // Get all screen IDs for validation
          const screenIds = new Set(loadedScreens.map((s) => s.id));

          // Clean up invalid arrows (arrows without valid targetScreenId)
          const cleanedScreens = loadedScreens.map((screen) => {
            const cleanedConversationPoints = screen.conversationPoints.map((point) => {
              const arrows = point.arrows || [];
              const validArrows = arrows.filter(
                (arrow) => arrow.targetScreenId && screenIds.has(arrow.targetScreenId),
              );

              // If there are invalid arrows, update the screen
              if (validArrows.length !== arrows.length && point.id) {
                // Update database asynchronously
                storage.updateDialogEntryArrows(screen.id, point.id, validArrows).catch((error) => {
                  console.error(
                    `Error cleaning up invalid arrows for dialog entry ${point.id}:`,
                    error,
                  );
                });
              }

              return {
                ...point,
                arrows: validArrows,
              };
            });

            return {
              ...screen,
              conversationPoints: cleanedConversationPoints,
            };
          });

          setScreens(cleanedScreens);
        }
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setIsLoadingScreens(false);
        // Mark initial load as complete
        hasCompletedInitialLoadRef.current = true;
      }
    };

    loadData();
  }, [workspaceId]);

  // Save screens to storage whenever they change (debounced to prevent race conditions)
  useEffect(() => {
    // Don't save during initial load - wait until load is complete
    // Only save when we know a specific screen was updated (tracked by lastUpdatedScreenIdRef)
    if (!isLoadingScreens && hasCompletedInitialLoadRef.current && screens.length >= 0) {
      const updatedScreenId = lastUpdatedScreenIdRef.current;
      if (updatedScreenId) {
        // Clear existing timeout for individual screen save
        if (screenSaveTimeoutRef.current) {
          clearTimeout(screenSaveTimeoutRef.current);
        }

        // Find the updated screen
        const updatedScreen = screens.find((s) => s.id === updatedScreenId);
        if (updatedScreen) {
          // Debounce save by 300ms to batch rapid updates and prevent race conditions
          screenSaveTimeoutRef.current = setTimeout(() => {
            storage.saveScreen(updatedScreen).catch((error) => {
              console.error("Error saving screen:", error);
            });
            // Clear the ref after saving
            lastUpdatedScreenIdRef.current = null;
          }, 300);
        } else {
          // Screen not found, clear the ref (don't save)
          lastUpdatedScreenIdRef.current = null;
        }
      }
      // If no specific screen is tracked, don't save (prevents saving on initial load)
    }

    // Cleanup timeouts on unmount
    return () => {
      const screenSaveTimeout = screenSaveTimeoutRef.current;
      if (screenSaveTimeout) {
        clearTimeout(screenSaveTimeout);
      }
    };
  }, [screens, isLoadingScreens]);

  if (isLoadingWorkspace) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <>
      <UserAvatar />
      <WorkspaceHeader
        workspaceName={workspaceName}
        onNameUpdate={handleWorkspaceNameUpdate}
        onDownload={handleDownload}
      />
      <Viewport
        ref={viewportHandleRef}
        disabled={!!draggedScreenId || (!!arrowLine && !arrowLine.isPending)}
        onPanStart={() => {
          // Cancel new screen mode if active when panning starts
          if (isNewScreenMode) {
            setIsNewScreenMode(false);
          }
          if (isCreateScreenPopupMode) {
            setIsCreateScreenPopupMode(false);
          }
          // Dismiss pending arrow when starting to pan
          if (arrowLine?.isPending) {
            setArrowLine(null);
          }
        }}
        onContextMenu={handleContextMenu}
        workspaceId={workspaceId}
      >
        <div
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          style={{ cursor: isDraggingScreen ? "grabbing" : "default" }}
        >
          {/* Arrow line overlay - rendered in content coordinates */}
          {arrowLine &&
            (() => {
              const startScreen = screens.find((s) => s.id === arrowLine.startScreenId);
              const endScreenId = hoveredScreenIdRef.current;
              const endScreen = endScreenId ? screens.find((s) => s.id === endScreenId) : null;

              // Convert from viewport coordinates to content coordinates
              const viewportToContent = viewportHandleRef.current?.viewportToContent;
              if (!viewportToContent) return null;
              const startContent = viewportToContent(arrowLine.start.x, arrowLine.start.y);
              const endContent = viewportToContent(arrowLine.end.x, arrowLine.end.y);
              const startContentX = startContent.x;
              const startContentY = startContent.y;
              const endContentX = endContent.x;
              const endContentY = endContent.y;

              const startScreenBounds = startScreen?.position
                ? {
                    x: startScreen.position.x,
                    y: startScreen.position.y,
                    width: 390,
                    height: startScreen.height || 844,
                  }
                : undefined;
              const endScreenBounds = endScreen?.position
                ? {
                    x: endScreen.position.x,
                    y: endScreen.position.y,
                    width: 390,
                    height: endScreen.height || 844,
                  }
                : undefined;
              // Check if arrow is active (related to selected screen)
              const isActive =
                selectedScreenId === arrowLine.startScreenId || selectedScreenId === endScreenId;
              return (
                <>
                  <ArrowLine
                    start={{ x: startContentX, y: startContentY }}
                    end={{ x: endContentX, y: endContentY }}
                    startScreenBounds={startScreenBounds}
                    endScreenBounds={endScreenBounds}
                    isActive={isActive}
                    markerId={`arrow-${arrowLine.startScreenId}-${endScreenId || "pending"}`}
                  />
                  {arrowLine.isPending && (
                    <CreateFromTouchableButton
                      position={{ x: endContentX, y: endContentY }}
                      onClick={handleCreateScreenFromPendingArrow}
                      disabled={isCloningScreen}
                      touchableId={arrowLine.touchableId}
                    />
                  )}
                </>
              );
            })()}
          {/* Render all stored arrows from conversation points */}
          {screens.flatMap((screen) => {
            if (!screen.position) return [];

            return screen.conversationPoints.flatMap(
              (conversationPoint, conversationPointIndex) => {
                // Only show arrows for the currently selected conversation point
                if (screen.selectedPromptIndex !== conversationPointIndex) {
                  return [];
                }

                const arrows = conversationPoint.arrows || [];
                // Filter out arrows without valid targetScreenId
                return arrows
                  .filter((arrow) => {
                    if (!arrow.targetScreenId) return false;
                    const endScreen = screens.find((s) => s.id === arrow.targetScreenId);
                    return !!endScreen;
                  })
                  .map((arrow, arrowIndex) => {
                    const endScreen = screens.find((s) => s.id === arrow.targetScreenId);

                    // Calculate start point: use stored startPoint if available, otherwise use screen center
                    const startContentX = arrow.startPoint
                      ? screen.position!.x + arrow.startPoint.x
                      : screen.position!.x;
                    const startContentY = arrow.startPoint
                      ? screen.position!.y + arrow.startPoint.y
                      : screen.position!.y;

                    // End point is target screen center
                    const endContentX = endScreen?.position ? endScreen.position.x : startContentX;
                    const endContentY = endScreen?.position ? endScreen.position.y : startContentY;

                    const startScreenBounds = {
                      x: screen.position!.x,
                      y: screen.position!.y,
                      width: 390,
                      height: screen.height || 844,
                    };
                    const endScreenBounds = endScreen?.position
                      ? {
                          x: endScreen.position.x,
                          y: endScreen.position.y,
                          width: 390,
                          height: endScreen.height || 844,
                        }
                      : undefined;

                    // Check if arrow is active (related to selected screen)
                    const isActive =
                      selectedScreenId === screen.id || selectedScreenId === endScreen?.id;
                    return (
                      <ArrowLine
                        key={`${screen.id}-${conversationPointIndex}-${arrowIndex}`}
                        start={{ x: startContentX, y: startContentY }}
                        end={{ x: endContentX, y: endContentY }}
                        startScreenBounds={startScreenBounds}
                        endScreenBounds={endScreenBounds}
                        isActive={isActive}
                        markerId={`arrow-${screen.id}-${arrow.targetScreenId}-${conversationPointIndex}-${arrowIndex}`}
                      />
                    );
                  });
              },
            );
          })}
          {!isLoadingScreens && screens.length === 0 && (
            <div
              style={{
                position: "absolute",
                left: "0px",
                top: "0px",
                transform: "translate(-50%, -50%)",
                pointerEvents: "none",
              }}
              className="text-6xl font-light text-gray-300 dark:text-gray-600"
            >
              Right-click to create your first screen
            </div>
          )}
          {screens.map((screen, index) => {
            // Selected screens appear on top, then newer screens
            const zIndex = selectedScreenId === screen.id ? screens.length + 1000 : index + 1;

            return (
              <div
                key={screen.id}
                id={screen.id}
                data-screen-container
                style={{
                  position: "absolute",
                  left: screen.position ? `${screen.position.x}px` : "0px",
                  top: screen.position ? `${screen.position.y}px` : "0px",
                  transform: "translate(-50%, -50%)",
                  zIndex,
                  cursor: isDraggingScreen && draggedScreenId === screen.id ? "grabbing" : "grab",
                }}
              >
                <Screen
                  id={screen.id}
                  isSelected={selectedScreenId === screen.id}
                  onScreenClick={handleScreenClick}
                  onCreate={handleScreenCreate}
                  onUpdate={handleScreenUpdate}
                  onDelete={handleScreenDelete}
                  onClone={handleScreenClone}
                  onOverlayClick={handleOverlayClick}
                  screenData={screen}
                  onCenterAndZoom={centerAndZoomScreen}
                />
              </div>
            );
          })}
        </div>
      </Viewport>

      {/* Create Screen Popup - initial popup with Mobile app button */}
      {/* Rendered outside Viewport to avoid transform effects */}
      {isCreateScreenPopupMode && (
        <CreateScreenPopup
          ref={createScreenPopupRef}
          position={newScreenPosition}
          onSelect={() => {
            setIsCreateScreenPopupMode(false);
            setIsNewScreenMode(true);
          }}
          onDismiss={() => setIsCreateScreenPopupMode(false)}
        />
      )}

      {/* New Screen Dialog */}
      {/* Rendered outside Viewport to avoid transform effects */}
      {isNewScreenMode && (
        <NewScreenDialog
          ref={newScreenFormRef}
          position={newScreenPosition}
          value={newScreenInput}
          onChange={setNewScreenInput}
          onSubmit={handleCreateNewScreen}
          onDismiss={() => setIsNewScreenMode(false)}
          disabled={isCreatingScreen}
        />
      )}
    </>
  );
}
