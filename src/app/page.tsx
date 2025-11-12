"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import Screen from "@/components/Screen";
import UserAvatar from "@/components/UserAvatar";
import CreateScreenPopup from "@/components/CreateScreenPopup";
import NewScreenDialog from "@/components/NewScreenDialog";
import ArrowLine from "@/components/ArrowLine";
import Viewport, { type ViewportHandle } from "@/components/Viewport";
import { usePersistentState } from "@/hooks/usePersistentState";
import type { ScreenData, ConversationPointArrow } from "@/lib/types";
import { storage } from "@/lib/storage";
import { screenDataToYjs, yjsToScreenData, getYjsProvider } from "@/lib/yjs-provider";
import * as Y from "yjs";

// Grid size for snapping
const GRID_SIZE = 16;

// Helper function to snap a value to the grid
const snapToGrid = (value: number): number => {
  return Math.round(value / GRID_SIZE) * GRID_SIZE;
};

export default function Home() {
  useSession(); // Keep for auth initialization
  const [screens, setScreens] = useState<ScreenData[]>([]);
  const [isLoadingScreens, setIsLoadingScreens] = useState(true);
  const [selectedScreenId, setSelectedScreenId] = useState<string | null>(null);
  const screensSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [draggedScreenId, setDraggedScreenId] = useState<string | null>(null);
  const [screenDragStart, setScreenDragStart] = useState({ x: 0, y: 0, screenX: 0, screenY: 0 });
  const [isDraggingScreen, setIsDraggingScreen] = useState(false);
  const justFinishedDraggingRef = useRef<string | null>(null);
  const [isCreateScreenPopupMode, setIsCreateScreenPopupMode] = useState(false);
  const [isNewScreenMode, setIsNewScreenMode] = useState(false);
  const [newScreenInput, setNewScreenInput] = usePersistentState<string>(
    "newScreenInput",
    "",
    300,
  );
  const [newScreenPosition, setNewScreenPosition] = useState({ x: 0, y: 0 });
  const newScreenFormRef = useRef<HTMLDivElement>(null);
  const createScreenPopupRef = useRef<HTMLDivElement>(null);
  const viewportHandleRef = useRef<ViewportHandle>(null);
  const [arrowLine, setArrowLine] = useState<{
    start: { x: number; y: number };
    end: { x: number; y: number };
    startScreenId: string;
    overlayIndex: number;
  } | null>(null);
  const hoveredScreenIdRef = useRef<string | null>(null);
  const yjsScreensMapRef = useRef<Y.Map<Y.Map<unknown>> | null>(null);
  const isYjsInitializedRef = useRef(false);
  const screensRef = useRef<ScreenData[]>([]);

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

    // If clicking on a screen container, check if it's unselected
    if (screenContainer) {
      const screenId = screenContainer.id;
      const screen = screens.find((s) => s.id === screenId);

      // Only allow dragging if screen is not selected
      if (screen && screen.id !== selectedScreenId) {
        // Deselect current screen when starting to drag another screen
        setSelectedScreenId(null);

        // Set up potential screen drag (but don't mark as dragging yet)
        const viewportElement = viewportHandleRef.current?.getElement();
        if (viewportElement && screen.position) {
          // Store initial mouse position and screen position
          setScreenDragStart({
            x: e.clientX,
            y: e.clientY,
            screenX: screen.position.x,
            screenY: screen.position.y,
          });
          setDraggedScreenId(screenId);
          setIsDraggingScreen(false); // Not dragging yet, just potential
          setIsMouseDown(true);
        }
        return;
      }
      // If screen is selected, let it handle the click (don't drag)
      return;
    }

    // Check if clicking within viewport but not on a screen
    const viewportElement = viewportHandleRef.current?.getElement();
    const isWithinViewport = viewportElement?.contains(target);
    const isEmptySpace = isWithinViewport && !screenContainer;

    if (isEmptySpace) {
      // Unselect screen when clicking on empty space
      setSelectedScreenId(null);
      // Dismiss popup and dialog when clicking on empty space
      if (isCreateScreenPopupMode) {
        setIsCreateScreenPopupMode(false);
      }
      if (isNewScreenMode) {
        setIsNewScreenMode(false);
      }
      setIsMouseDown(true);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    // Only handle dragging if mouse button is pressed
    if (!isMouseDown) return;

    // Handle arrow line drawing
    if (arrowLine) {
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
  };

  const handleMouseUp = (e?: React.MouseEvent) => {
    // If event is provided, check if clicking on the new screen form itself
    if (e) {
      const target = e.target as HTMLElement;
      if (newScreenFormRef.current?.contains(target)) {
        setIsMouseDown(false);
        setDraggedScreenId(null);
        setArrowLine(null);
        return;
      }
    }

    // Save arrow when mouse is released (only if connected to a screen)
    if (arrowLine) {
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
        const startScreen = screens.find((s) => s.id === arrowLine.startScreenId);

        if (startScreen) {
          // Find the selected conversation point (or use the last one if none selected)
          const conversationPointIndex =
            startScreen.selectedPromptIndex !== null
              ? startScreen.selectedPromptIndex
              : startScreen.conversationPoints.length > 0
                ? startScreen.conversationPoints.length - 1
                : null;

          if (conversationPointIndex !== null && conversationPointIndex < startScreen.conversationPoints.length) {
            // Get the conversation point
            const conversationPoint = startScreen.conversationPoints[conversationPointIndex];

            // Initialize arrows array if it doesn't exist
            const existingArrows = conversationPoint.arrows || [];

            // Remove any existing arrow from the same overlay index
            const filteredArrows = existingArrows.filter(
              (arrow) => arrow.overlayIndex !== arrowLine.overlayIndex,
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
              overlayIndex: arrowLine.overlayIndex,
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
          }
        }
      }

      // Cancel arrow creation (clear state) regardless of whether it was saved
      setArrowLine(null);
      hoveredScreenIdRef.current = null;
      setIsMouseDown(false);
      return;
    }

    // Left click on empty space now only deselects (popup moved to right-click)

    // Handle screen click vs drag
    if (draggedScreenId) {
      if (isDraggingScreen) {
        // User dragged the screen - prevent selection
        justFinishedDraggingRef.current = draggedScreenId;
        // Clear after a short delay to allow click handler to check

        // SYNC DRAG COMPLETION VIA YJS
        const draggedScreen = screens.find((s) => s.id === draggedScreenId);
        if (draggedScreen && yjsScreensMapRef.current && isYjsInitializedRef.current && yjsScreensMapRef.current.doc) {
          const hasCompletedPoints = draggedScreen.conversationPoints.some(
            (point) => point.html && point.html.trim().length > 0,
          );
          if (hasCompletedPoints) {
            yjsScreensMapRef.current.doc.transact(() => {
              const yScreen = screenDataToYjs(draggedScreen);
              yjsScreensMapRef.current!.set(draggedScreenId, yScreen);
            }, "user-action");
          }
        }

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
    setIsDraggingScreen(false);
    setDraggedScreenId(null);
  };

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
        const rect = viewportElement?.getBoundingClientRect();
        if (rect) {
          const position = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
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
    }
  };


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
            const screenCenterYViewport =
              screenRect.top + screenRect.height / 2 - viewportRect.top;

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

  // Handle screen creation - SYNC VIA YJS
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

        // Sync to Yjs (only if screen has completed conversation points)
        if (yjsScreensMapRef.current && isYjsInitializedRef.current && yjsScreensMapRef.current.doc) {
          const hasCompletedPoints = newScreen.conversationPoints.some(
            (point) => point.html && point.html.trim().length > 0,
          );
          if (hasCompletedPoints) {
            yjsScreensMapRef.current.doc.transact(() => {
              const yScreen = screenDataToYjs(newScreen);
              yjsScreensMapRef.current!.set(newScreen.id, yScreen);
            }, "user-action");
          }
        }

    // Don't auto-select - let user click to select if they want
    // setSelectedScreenId(newScreen.id);

    // Don't auto-center/zoom - this disrupts the viewport when creating multiple screens
    // centerAndZoomScreen(newScreen.id);
  }, []);

  // Handle creating a new screen from the form
  const handleCreateNewScreen = useCallback(() => {
    if (!newScreenInput.trim()) return;

    // Convert form position (viewport coordinates) to viewport-content coordinates
    const viewportToContent = viewportHandleRef.current?.viewportToContent;
    if (!viewportToContent) return;
    const contentPos = viewportToContent(newScreenPosition.x, newScreenPosition.y);
    const contentX = contentPos.x;
    const contentY = contentPos.y;

    // Create initial conversation point with the user prompt (HTML will be added after generation)
    const initialConversationPoint = {
      prompt: newScreenInput.trim(),
      html: "",
      title: null,
      timestamp: Date.now(),
    };

    // Create the screen with initial conversation point (will trigger generation)
    // Snap position to grid
    const timestamp = Date.now();
    const newScreen: ScreenData = {
      id: `screen-${timestamp}`,
      conversationPoints: [initialConversationPoint],
      selectedPromptIndex: 0,
      position: { x: snapToGrid(contentX), y: snapToGrid(contentY) },
    };

    setScreens((prevScreens) => [...prevScreens, newScreen]);
    // Don't auto-select - let user click to select if they want
    // setSelectedScreenId(newScreen.id);

    // Close the form and clear input
    setIsNewScreenMode(false);
    setNewScreenInput("");

    // Don't auto-center/zoom - this disrupts the viewport when creating multiple screens
    // centerAndZoomScreen(newScreen.id);
  }, [newScreenInput, newScreenPosition, setNewScreenInput]);

  // Handle screen update - SYNC VIA YJS (only for completed screens)
  const handleScreenUpdate = useCallback((screenId: string, updates: Partial<ScreenData>) => {
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

          // Sync to Yjs (only if screen has completed conversation points)
          if (yjsScreensMapRef.current && isYjsInitializedRef.current && yjsScreensMapRef.current.doc) {
            const hasCompletedPoints = updatedScreen.conversationPoints.some(
              (point) => point.html && point.html.trim().length > 0,
            );
            if (hasCompletedPoints) {
              yjsScreensMapRef.current.doc.transact(() => {
                const yScreen = screenDataToYjs(updatedScreen);
                yjsScreensMapRef.current!.set(screenId, yScreen);
              }, "user-action");
            } else {
              // Remove incomplete screens from Yjs
              yjsScreensMapRef.current.delete(screenId);
            }
          }

          return updatedScreen;
        }
        return screen;
      });
    });
  }, []);

  // Handle screen click
  const handleScreenClick = (screenId: string) => {
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

  // Handle screen deletion - SYNC VIA YJS
  const handleScreenDelete = useCallback(
    (screenId: string) => {
      setScreens((prevScreens) => prevScreens.filter((s) => s.id !== screenId));
      // Deselect if the deleted screen was selected
      if (selectedScreenId === screenId) {
        setSelectedScreenId(null);
      }

      // Sync deletion to Yjs
      if (yjsScreensMapRef.current && isYjsInitializedRef.current && yjsScreensMapRef.current.doc) {
        yjsScreensMapRef.current.doc.transact(() => {
          yjsScreensMapRef.current!.delete(screenId);
        }, "user-action");
      }
    },
    [selectedScreenId],
  );

  // Handle screen cloning - SYNC VIA YJS
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

      // Sync to Yjs (only if cloned screen has completed conversation points)
      if (yjsScreensMapRef.current && isYjsInitializedRef.current && yjsScreensMapRef.current.doc) {
        const hasCompletedPoints = clonedScreen.conversationPoints.some(
          (point) => point.html && point.html.trim().length > 0,
        );
        if (hasCompletedPoints) {
          yjsScreensMapRef.current.doc.transact(() => {
            const yScreen = screenDataToYjs(clonedScreen);
            yjsScreensMapRef.current!.set(clonedScreen.id, yScreen);
          }, "user-action");
        }
      }

      // Don't auto-select the cloned screen
    },
    [screens],
  );

  // Handle overlay click - start arrow from center of clicked overlay
  const handleOverlayClick = useCallback(
    (center: { x: number; y: number }, screenId: string, overlayIndex: number) => {
      const viewportElement = viewportHandleRef.current?.getElement();
      const rect = viewportElement?.getBoundingClientRect();
      if (rect) {
        const startScreen = screens.find((s) => s.id === screenId);
        if (startScreen) {
          // Find the selected conversation point (or use the last one if none selected)
          const conversationPointIndex =
            startScreen.selectedPromptIndex !== null
              ? startScreen.selectedPromptIndex
              : startScreen.conversationPoints.length > 0
                ? startScreen.conversationPoints.length - 1
                : null;

          if (conversationPointIndex !== null && conversationPointIndex < startScreen.conversationPoints.length) {
            // Get the conversation point
            const conversationPoint = startScreen.conversationPoints[conversationPointIndex];

            // Remove any existing arrow from the same overlay
            const existingArrows = conversationPoint.arrows || [];
            const filteredArrows = existingArrows.filter(
              (arrow) => arrow.overlayIndex !== overlayIndex,
            );

            // Update the conversation point to remove the arrow
            const updatedConversationPoints = [...startScreen.conversationPoints];
            updatedConversationPoints[conversationPointIndex] = {
              ...conversationPoint,
              arrows: filteredArrows,
            };

            // Update the screen
            handleScreenUpdate(screenId, {
              conversationPoints: updatedConversationPoints,
            });
          }
        }

        // Convert from viewport (browser window) coordinates to viewport container coordinates
        const startX = center.x - rect.left;
        const startY = center.y - rect.top;
        setArrowLine({
          start: { x: startX, y: startY },
          end: { x: startX, y: startY },
          startScreenId: screenId,
          overlayIndex,
        });
        setIsMouseDown(true);
      }
    },
    [screens, handleScreenUpdate],
  );

  // Effect to center screen after selection - DISABLED
  // useEffect(() => {
  //   if (selectedScreenId) {
  //     centerAndZoomScreen(selectedScreenId);
  //   }
  // }, [selectedScreenId, centerAndZoomScreen]);

  // Keep screensRef in sync with screens state
  useEffect(() => {
    screensRef.current = screens;
  }, [screens]);

  // Initialize Yjs and load screens from storage on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        // Get Yjs provider from storage
        const yjsProvider = (storage as { getYjsProvider?: () => ReturnType<typeof getYjsProvider> | null }).getYjsProvider?.();
        if (yjsProvider) {
          const screensMap = yjsProvider.getScreensMap();
          yjsScreensMapRef.current = screensMap;
          isYjsInitializedRef.current = true;

          // Subscribe to Yjs changes (remote updates)
          const handleYjsUpdate = () => {
            if (!screensMap) return;

            const yjsScreens: ScreenData[] = [];
            screensMap.forEach((yScreen: Y.Map<unknown>) => {
              try {
                const screenData = yjsToScreenData(yScreen);
                // Add selectedPromptIndex if missing (client-side state)
                const fullScreenData: ScreenData = {
                  ...screenData,
                  selectedPromptIndex: screenData.selectedPromptIndex ?? null,
                };
                yjsScreens.push(fullScreenData);
              } catch (error: unknown) {
                console.error("Error converting Yjs screen to ScreenData:", error);
              }
            });

            // Only update if screens have actually changed to prevent infinite loops
            const currentScreens = screensRef.current;
            if (currentScreens.length !== yjsScreens.length) {
              setScreens(yjsScreens);
              storage.saveScreens(yjsScreens).catch((error) => {
                console.error("Error saving screens to IndexedDB:", error);
              });
              return;
            }

            // Compare screens by ID to check if anything changed
            const screensChanged = yjsScreens.some((yjsScreen) => {
              const currentScreen = currentScreens.find((s) => s.id === yjsScreen.id);
              if (!currentScreen) return true; // New screen added
              // Deep comparison of key properties
              return (
                JSON.stringify(currentScreen.position) !== JSON.stringify(yjsScreen.position) ||
                JSON.stringify(currentScreen.conversationPoints) !== JSON.stringify(yjsScreen.conversationPoints) ||
                currentScreen.height !== yjsScreen.height
              );
            }) || currentScreens.some((currentScreen) => {
              // Check if any screen was removed
              return !yjsScreens.find((s) => s.id === currentScreen.id);
            });

            if (screensChanged) {
              // Update React state with Yjs data
              setScreens(yjsScreens);
              // Also save to IndexedDB for offline support
              storage.saveScreens(yjsScreens).catch((error) => {
                console.error("Error saving screens to IndexedDB:", error);
              });
            }
          };

          // Initial load from Yjs
          handleYjsUpdate();

          // Subscribe to Yjs changes
          screensMap.observe(handleYjsUpdate);

          // Cleanup
          return () => {
            screensMap.unobserve(handleYjsUpdate);
          };
        } else {
          // Fallback: load from IndexedDB only
          const loadedScreens = await storage.loadScreens();
          if (loadedScreens.length > 0) {
            setScreens(loadedScreens);
          }
          setIsLoadingScreens(false);
        }
      } catch (error) {
        console.error("Error loading data:", error);
        setIsLoadingScreens(false);
      } finally {
        setIsLoadingScreens(false);
      }
    };

    loadData();
  }, []);

  // Save screens to IndexedDB whenever they change (debounced to prevent race conditions)
  // Note: Yjs sync happens directly in screen operations, this is just for IndexedDB backup
  useEffect(() => {
    if (!isLoadingScreens && screens.length >= 0 && isYjsInitializedRef.current) {
      // Clear existing timeout
      if (screensSaveTimeoutRef.current) {
        clearTimeout(screensSaveTimeoutRef.current);
      }

      // Debounce save by 300ms to batch rapid updates and prevent race conditions
      screensSaveTimeoutRef.current = setTimeout(() => {
        // Only save to IndexedDB, Yjs sync is handled in operations
        (storage as { idbStorage?: { saveScreens: (screens: ScreenData[]) => Promise<void> } }).idbStorage?.saveScreens(screens).catch((error: unknown) => {
          console.error("Error saving screens to IndexedDB:", error);
        });
      }, 300);
    }

    // Cleanup timeout on unmount
    return () => {
      if (screensSaveTimeoutRef.current) {
        clearTimeout(screensSaveTimeoutRef.current);
      }
    };
  }, [screens, isLoadingScreens]);



  return (
    <>
      <UserAvatar />
      <Viewport
        ref={viewportHandleRef}
        disabled={!!draggedScreenId}
        onPanStart={() => {
          // Cancel new screen mode if active when panning starts
          if (isNewScreenMode) {
            setIsNewScreenMode(false);
          }
          if (isCreateScreenPopupMode) {
            setIsCreateScreenPopupMode(false);
          }
        }}
      >
        <div
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onContextMenu={handleContextMenu}
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
              return (
                <ArrowLine
                  start={{ x: startContentX, y: startContentY }}
                  end={{ x: endContentX, y: endContentY }}
                  startScreenBounds={startScreenBounds}
                  endScreenBounds={endScreenBounds}
                />
              );
            })()}
          {/* Render all stored arrows from conversation points */}
          {screens.flatMap((screen) => {
            if (!screen.position) return [];

            return screen.conversationPoints.flatMap((conversationPoint, conversationPointIndex) => {
              const arrows = conversationPoint.arrows || [];
              return arrows.map((arrow, arrowIndex) => {
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

                return (
                  <ArrowLine
                    key={`${screen.id}-${conversationPointIndex}-${arrowIndex}`}
                    start={{ x: startContentX, y: startContentY }}
                    end={{ x: endContentX, y: endContentY }}
                    startScreenBounds={startScreenBounds}
                    endScreenBounds={endScreenBounds}
                  />
                );
              });
            });
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
                  cursor:
                    screen.id === selectedScreenId
                      ? "default"
                      : isDraggingScreen && draggedScreenId === screen.id
                        ? "grabbing"
                        : "grab",
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

        {/* Create Screen Popup - initial popup with Mobile app button */}
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
        {isNewScreenMode && (
          <NewScreenDialog
            ref={newScreenFormRef}
            position={newScreenPosition}
            value={newScreenInput}
            onChange={setNewScreenInput}
            onSubmit={handleCreateNewScreen}
            onDismiss={() => setIsNewScreenMode(false)}
          />
        )}
      </Viewport>
    </>
  );
}
