"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { FaMagic } from "react-icons/fa";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import Screen from "@/components/Screen";
import UserAvatar from "@/components/UserAvatar";
import CreateScreenPopup from "@/components/CreateScreenPopup";
import ArrowLine from "@/components/ArrowLine";
import type { ScreenData, ConversationPointArrow } from "@/lib/types";
import { storage } from "@/lib/storage";

// Grid size for snapping
const GRID_SIZE = 16;

// Helper function to snap a value to the grid
const snapToGrid = (value: number): number => {
  return Math.round(value / GRID_SIZE) * GRID_SIZE;
};

export default function Home() {
  const { data: session, status } = useSession();
  const [screens, setScreens] = useState<ScreenData[]>([]);
  const [isLoadingScreens, setIsLoadingScreens] = useState(true);
  const [isLoadingViewport, setIsLoadingViewport] = useState(true);
  const [selectedScreenId, setSelectedScreenId] = useState<string | null>(null);
  const [viewportTransform, setViewportTransform] = useState({ x: 0, y: 0, scale: 1 });
  const viewportSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const screensSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [clickPosition, setClickPosition] = useState<{ x: number; y: number } | null>(null);
  const [wasEmptySpaceClick, setWasEmptySpaceClick] = useState(false);
  const [draggedScreenId, setDraggedScreenId] = useState<string | null>(null);
  const [screenDragStart, setScreenDragStart] = useState({ x: 0, y: 0, screenX: 0, screenY: 0 });
  const [isDraggingScreen, setIsDraggingScreen] = useState(false);
  const justFinishedDraggingRef = useRef<string | null>(null);
  const [isCreateScreenPopupMode, setIsCreateScreenPopupMode] = useState(false);
  const [isNewScreenMode, setIsNewScreenMode] = useState(false);
  const [newScreenInput, setNewScreenInput] = useState("");
  const [newScreenPosition, setNewScreenPosition] = useState({ x: 0, y: 0 });
  const newScreenFormRef = useRef<HTMLDivElement>(null);
  const createScreenPopupRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const pendingPromptProcessedRef = useRef(false);
  const [arrowLine, setArrowLine] = useState<{
    start: { x: number; y: number };
    end: { x: number; y: number };
    startScreenId: string;
    overlayIndex: number;
  } | null>(null);
  const hoveredScreenIdRef = useRef<string | null>(null);

  // Handle panning - only when clicking on empty space
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
        const rect = viewportRef.current?.getBoundingClientRect();
        if (rect && screen.position) {
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
    const isWithinViewport = viewportRef.current?.contains(target);
    const isEmptySpace = isWithinViewport && !screenContainer;

    if (isEmptySpace) {
      // Store whether a screen was selected before we deselect (for popup logic)
      const hadSelectedScreen = selectedScreenId !== null;

      // Unselect screen when clicking on empty space
      setSelectedScreenId(null);

      // Store click position and that it was empty space for handling on mouse up
      // Only show popup if no screen was selected (not if we just deselected one)
      const rect = viewportRef.current?.getBoundingClientRect();
      if (rect) {
        setClickPosition({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        });
        // Only mark as empty space click if no screen was selected (allows popup on second click)
        setWasEmptySpaceClick(!hadSelectedScreen);
      }

      // Set drag start position for potential dragging
      setDragStart({
        x: e.clientX - viewportTransform.x,
        y: e.clientY - viewportTransform.y,
      });
      setIsMouseDown(true);
    } else {
      // Reset click tracking if not empty space
      setClickPosition(null);
      setWasEmptySpaceClick(false);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    // Only handle dragging if mouse button is pressed
    if (!isMouseDown) return;

    // Handle arrow line drawing
    if (arrowLine) {
      const rect = viewportRef.current?.getBoundingClientRect();
      if (rect) {
        const endX = e.clientX - rect.left;
        const endY = e.clientY - rect.top;

        // Check if mouse is over a screen (but not the start screen)
        // Use elementFromPoint to get the element at mouse position, as e.target might be a child
        const elementAtPoint = document.elementFromPoint(e.clientX, e.clientY);
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
          // Convert delta to content coordinates (accounting for scale)
          const contentDeltaX = deltaX / viewportTransform.scale;
          const contentDeltaY = deltaY / viewportTransform.scale;

          // Calculate new screen position and snap to grid
          const newX = snapToGrid(screenDragStart.screenX + contentDeltaX);
          const newY = snapToGrid(screenDragStart.screenY + contentDeltaY);

          // Update screen position
          handleScreenUpdate(draggedScreenId, {
            position: { x: newX, y: newY },
          });
        }
      }
      // Prevent panning as soon as we have a draggedScreenId (even before 5px threshold)
      // This prevents viewport panning from interfering with screen drag
      return; // Don't handle panning when potentially dragging a screen
    }

    // Handle viewport panning (only if not dragging a screen)
    // Check if user started dragging (mouse moved significantly from initial click)
    const deltaX = Math.abs(e.clientX - (dragStart.x + viewportTransform.x));
    const deltaY = Math.abs(e.clientY - (dragStart.y + viewportTransform.y));

    if (!isDragging && (deltaX > 5 || deltaY > 5)) {
      // User started dragging - cancel new screen mode if active
      if (isNewScreenMode) {
        setIsNewScreenMode(false);
      }
      // Cancel create screen popup if active
      if (isCreateScreenPopupMode) {
        setIsCreateScreenPopupMode(false);
      }
      setIsDragging(true);
    }

    if (isDragging) {
      setViewportTransform({
        ...viewportTransform,
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = (e?: React.MouseEvent) => {
    // If event is provided, check if clicking on the new screen form itself
    if (e) {
      const target = e.target as HTMLElement;
      if (newScreenFormRef.current?.contains(target)) {
        setIsDragging(false);
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
      if (e && !endScreenId) {
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
            // Viewport to content: (viewport - transform) / scale
            const startContentX = (arrowLine.start.x - viewportTransform.x) / viewportTransform.scale;
            const startContentY = (arrowLine.start.y - viewportTransform.y) / viewportTransform.scale;
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

    // If user didn't drag and clicked on empty space, initiate new screen flow
    if (!isDragging && !draggedScreenId && wasEmptySpaceClick && clickPosition) {
      // If not already in create screen popup mode, initiate it
      if (!isCreateScreenPopupMode && !isNewScreenMode) {
        setNewScreenPosition(clickPosition);
        setIsCreateScreenPopupMode(true);
      } else if (isCreateScreenPopupMode) {
        // If already in popup mode and clicking outside, dismiss it
        setIsCreateScreenPopupMode(false);
      } else if (isNewScreenMode) {
        // If already in new screen mode and clicking outside, cancel it (input is preserved)
        setIsNewScreenMode(false);
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
    setIsDragging(false);
    setIsMouseDown(false);
    setIsDraggingScreen(false);
    setDraggedScreenId(null);
    setClickPosition(null);
    setWasEmptySpaceClick(false);
  };

  // Handle zooming with scroll (10% to 100%)
  const handleWheel = useCallback(
    (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY * -0.001;
      const newScale = Math.min(Math.max(0.1, viewportTransform.scale + delta), 1);

      // Zoom towards mouse position
      const rect = viewportRef.current?.getBoundingClientRect();
      if (rect) {
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const scaleChange = newScale / viewportTransform.scale;
        setViewportTransform({
          x: mouseX - (mouseX - viewportTransform.x) * scaleChange,
          y: mouseY - (mouseY - viewportTransform.y) * scaleChange,
          scale: newScale,
        });
      }
    },
    [viewportTransform],
  );

  // Add wheel event listener with passive: false to allow preventDefault
  useEffect(() => {
    const element = viewportRef.current;
    if (!element) return;

    element.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      element.removeEventListener("wheel", handleWheel);
    };
  }, [handleWheel]);

  // Center and zoom to 100% when a screen is selected - DISABLED
  // const centerAndZoomScreen = useCallback(
  //   (screenId: string) => {
  //     // Use requestAnimationFrame to ensure DOM is updated
  //     requestAnimationFrame(() => {
  //       const screenElement = document.getElementById(screenId);
  //       if (screenElement && viewportRef.current) {
  //         const viewportRect = viewportRef.current.getBoundingClientRect();

  //         // Find the screen data to get its position in content coordinates
  //         const screen = screens.find((s) => s.id === screenId);

  //         let screenCenterXContent: number;
  //         let screenCenterYContent: number;

  //         if (screen?.position) {
  //           // Use stored position
  //           screenCenterXContent = screen.position.x;
  //           screenCenterYContent = screen.position.y;
  //         } else {
  //           // Fallback: get position from DOM (for initial screen or screens without position)
  //           const screenRect = screenElement.getBoundingClientRect();

  //           // Get current transform from state
  //           setViewportTransform((currentTransform) => {
  //             // Convert from viewport coordinates to content coordinates
  //             // screenRect is in document coordinates, so subtract viewportRect to get viewport-relative
  //             const screenCenterXViewport =
  //               screenRect.left + screenRect.width / 2 - viewportRect.left;
  //             const screenCenterYViewport =
  //               screenRect.top + screenRect.height / 2 - viewportRect.top;

  //             // Convert to content coordinates
  //             screenCenterXContent =
  //               (screenCenterXViewport - currentTransform.x) / currentTransform.scale;
  //             screenCenterYContent =
  //               (screenCenterYViewport - currentTransform.y) / currentTransform.scale;

  //             // Viewport center in viewport coordinates
  //             const viewportCenterX = viewportRect.width / 2;
  //             const viewportCenterY = viewportRect.height / 2;

  //             // Calculate new transform to center the screen at scale 1
  //             const newX = viewportCenterX - screenCenterXContent;
  //             const newY = viewportCenterY - screenCenterYContent;

  //             return {
  //               x: newX,
  //               y: newY,
  //               scale: 1,
  //             };
  //           });
  //           return; // Early return for fallback case
  //         }

  //         // Viewport center in viewport coordinates
  //         const viewportCenterX = viewportRect.width / 2;
  //         const viewportCenterY = viewportRect.height / 2;

  //         // To center the screen, we need:
  //         // viewportCenter = screenCenterContent * scale + transform
  //         // So: transform = viewportCenter - screenCenterContent * scale
  //         // With scale = 1:
  //         const newX = viewportCenterX - screenCenterXContent;
  //         const newY = viewportCenterY - screenCenterYContent;

  //         // Apply the transform and reset scale to 1
  //         setViewportTransform({
  //           x: newX,
  //           y: newY,
  //           scale: 1,
  //         });
  //       }
  //     });
  //   },
  //   [screens],
  // );

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

  // Handle creating a new screen from the form
  const handleCreateNewScreen = useCallback(() => {
    if (!newScreenInput.trim()) return;

    // Convert form position (viewport coordinates) to viewport-content coordinates
    // Account for the transform: translate(x, y) scale(scale)
    const contentX = (newScreenPosition.x - viewportTransform.x) / viewportTransform.scale;
    const contentY = (newScreenPosition.y - viewportTransform.y) / viewportTransform.scale;

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
  }, [newScreenInput, newScreenPosition, viewportTransform]);

  // Handle screen update
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

  // Handle screen deletion
  const handleScreenDelete = useCallback(
    (screenId: string) => {
      setScreens((prevScreens) => prevScreens.filter((s) => s.id !== screenId));
      // Deselect if the deleted screen was selected
      if (selectedScreenId === screenId) {
        setSelectedScreenId(null);
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
      // Select the cloned screen
      setSelectedScreenId(clonedScreen.id);
    },
    [screens],
  );

  // Handle overlay click - start arrow from center of clicked overlay
  const handleOverlayClick = useCallback(
    (center: { x: number; y: number }, screenId: string, overlayIndex: number) => {
      const rect = viewportRef.current?.getBoundingClientRect();
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

  // Load screens and viewport transform from storage on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load screens
        const loadedScreens = await storage.loadScreens();
        if (loadedScreens.length > 0) {
          setScreens(loadedScreens);
        }

        // Load viewport transform
        const loadedTransform = await storage.loadViewportTransform();
        if (loadedTransform) {
          setViewportTransform(loadedTransform);
        } else if (loadedScreens.length === 0) {
          // Center viewport when there are no screens and no saved transform (first time)
          // Center at 0,0 in content coordinates means viewport should be at center of screen
          requestAnimationFrame(() => {
            if (viewportRef.current) {
              const rect = viewportRef.current.getBoundingClientRect();
              setViewportTransform({
                x: rect.width / 2,
                y: rect.height / 2,
                scale: 1,
              });
            }
          });
        }
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setIsLoadingScreens(false);
        setIsLoadingViewport(false);
      }
    };

    loadData();
  }, []);

  // Save screens to storage whenever they change (debounced to prevent race conditions)
  useEffect(() => {
    if (!isLoadingScreens && screens.length >= 0) {
      // Clear existing timeout
      if (screensSaveTimeoutRef.current) {
        clearTimeout(screensSaveTimeoutRef.current);
      }

      // Debounce save by 300ms to batch rapid updates and prevent race conditions
      screensSaveTimeoutRef.current = setTimeout(() => {
        storage.saveScreens(screens).catch((error) => {
          console.error("Error saving screens:", error);
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

  // Save viewport transform to storage whenever it changes (debounced)
  useEffect(() => {
    if (!isLoadingViewport) {
      // Clear existing timeout
      if (viewportSaveTimeoutRef.current) {
        clearTimeout(viewportSaveTimeoutRef.current);
      }

      // Debounce save by 500ms to avoid too many writes
      viewportSaveTimeoutRef.current = setTimeout(() => {
        storage.saveViewportTransform(viewportTransform).catch((error) => {
          console.error("Error saving viewport transform:", error);
        });
      }, 500);
    }

    // Cleanup timeout on unmount
    return () => {
      if (viewportSaveTimeoutRef.current) {
        clearTimeout(viewportSaveTimeoutRef.current);
      }
    };
  }, [viewportTransform, isLoadingViewport]);

  // Reset pending prompt processed flag when session changes
  useEffect(() => {
    pendingPromptProcessedRef.current = false;
  }, [session?.user?.id]);

  // Check for pending prompts after auth completes
  useEffect(() => {
    const restorePendingPrompt = async () => {
      // Only process once per session change
      if (pendingPromptProcessedRef.current) return;

      // Wait for auth to complete and screens to load
      if (status === "loading" || isLoadingScreens) return;

      // Only process if authenticated
      if (!session) return;

      pendingPromptProcessedRef.current = true;

      try {
        const pending = await storage.loadPendingPrompt();
        if (!pending) return;

        // Clear the pending prompt immediately to prevent reprocessing
        await storage.clearPendingPrompt();

        if (pending.screenId) {
          // Screen already exists (either new or existing) - find it and select it
          // The Screen component will auto-retry generation if there's an incomplete point
          const screen = screens.find((s) => s.id === pending.screenId);
          if (screen) {
            setSelectedScreenId(pending.screenId);
          }
        }
      } catch (error) {
        console.error("Error restoring pending prompt:", error);
        pendingPromptProcessedRef.current = false; // Allow retry on error
      }
    };

    restorePendingPrompt();
  }, [session, status, isLoadingScreens, screens, viewportTransform]);

  return (
    <div
      ref={viewportRef}
      className="relative h-screen w-screen overflow-hidden bg-gradient-to-br from-sky-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-950 dark:to-neutral-900"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      style={{ cursor: isDraggingScreen ? "grabbing" : isDragging ? "grabbing" : "grab" }}
    >
      <UserAvatar />
      <div
        className="viewport-content relative"
        style={{
          transform: `translate(${viewportTransform.x}px, ${viewportTransform.y}px) scale(${viewportTransform.scale})`,
          transformOrigin: "0 0",
        }}
      >
        {/* Arrow line overlay - rendered in content coordinates */}
        {arrowLine &&
          (() => {
            const startScreen = screens.find((s) => s.id === arrowLine.startScreenId);
            const endScreenId = hoveredScreenIdRef.current;
            const endScreen = endScreenId ? screens.find((s) => s.id === endScreenId) : null;

            // Convert from viewport coordinates to content coordinates
            const startContentX =
              (arrowLine.start.x - viewportTransform.x) / viewportTransform.scale;
            const startContentY =
              (arrowLine.start.y - viewportTransform.y) / viewportTransform.scale;
            const endContentX = (arrowLine.end.x - viewportTransform.x) / viewportTransform.scale;
            const endContentY = (arrowLine.end.y - viewportTransform.y) / viewportTransform.scale;

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
            className="text-2xl font-light text-gray-300 dark:text-gray-600"
          >
            Click anywhere to create your first screen
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

      {/* New Screen Form - positioned absolutely in viewport coordinates */}
      {isNewScreenMode && (
        <div
          ref={newScreenFormRef}
          className="fixed z-50"
          style={{
            left: `${newScreenPosition.x}px`,
            top: `${newScreenPosition.y}px`,
            transform: "translate(-50%, -50%)",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <Card className="flex w-80 flex-col gap-3 p-4">
            <Label htmlFor="new-screen-textarea" className="text-sm">
              What you want to create
            </Label>
            <Textarea
              id="new-screen-textarea"
              value={newScreenInput}
              onChange={(e) => setNewScreenInput(e.target.value)}
              placeholder="Describe the UI you want..."
              rows={6}
              className="text-sm"
              autoFocus
            />
            <Button
              onClick={handleCreateNewScreen}
              disabled={!newScreenInput.trim()}
              className="flex items-center justify-center gap-2 text-sm"
            >
              <FaMagic />
              <span>Create</span>
            </Button>
          </Card>
        </div>
      )}
    </div>
  );
}
