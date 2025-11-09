"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { FaMagic } from "react-icons/fa";
import Screen from "@/components/Screen";
import UserAvatar from "@/components/UserAvatar";
import type { ScreenData } from "@/lib/types";
import { storage } from "@/lib/storage";

export default function Home() {
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
  const [isNewScreenMode, setIsNewScreenMode] = useState(false);
  const [newScreenInput, setNewScreenInput] = useState("");
  const [newScreenPosition, setNewScreenPosition] = useState({ x: 0, y: 0 });
  const newScreenFormRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);

  // Handle panning - only when clicking on empty space
  const handleMouseDown = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;

    // Don't initiate new screen flow if clicking on the new screen form itself
    if (newScreenFormRef.current?.contains(target)) {
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
          
          // Calculate new screen position
          const newX = screenDragStart.screenX + contentDeltaX;
          const newY = screenDragStart.screenY + contentDeltaY;
          
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
        return;
      }
    }

    // If user didn't drag and clicked on empty space, initiate new screen flow
    if (!isDragging && !draggedScreenId && wasEmptySpaceClick && clickPosition) {
      // If not already in new screen mode, initiate it
      if (!isNewScreenMode) {
        setNewScreenPosition(clickPosition);
        setIsNewScreenMode(true);
      } else {
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
  const handleScreenCreate = useCallback(
    (screenData: Omit<ScreenData, "id">) => {
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
    },
    [],
  );

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
    const timestamp = Date.now();
    const newScreen: ScreenData = {
      id: `screen-${timestamp}`,
      conversationPoints: [initialConversationPoint],
      selectedPromptIndex: 0,
      position: { x: contentX, y: contentY },
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
    // Disabled: centerAndZoomScreen(screenId);
  };

  // Handle screen deletion
  const handleScreenDelete = useCallback((screenId: string) => {
    setScreens((prevScreens) => prevScreens.filter((s) => s.id !== screenId));
    // Deselect if the deleted screen was selected
    if (selectedScreenId === screenId) {
      setSelectedScreenId(null);
    }
  }, [selectedScreenId]);

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
        {screens.map((screen, index) => {
          // Selected screens appear on top, then newer screens
          const zIndex = selectedScreenId === screen.id 
            ? screens.length + 1000 
            : index + 1;
          
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
              cursor: screen.id === selectedScreenId 
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
              screenData={screen}
            />
          </div>
        )})}
      </div>

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
          <div className="flex flex-col gap-3 rounded-lg border border-gray-300 bg-white p-4 shadow-xl dark:border-gray-600 dark:bg-gray-800">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              What you want to create
            </label>
            <textarea
              value={newScreenInput}
              onChange={(e) => setNewScreenInput(e.target.value)}
              placeholder="Describe the UI you want..."
              rows={6}
              className="w-80 resize-none rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              autoFocus
            />
            <button
              onClick={handleCreateNewScreen}
              disabled={!newScreenInput.trim()}
              className="flex items-center justify-center gap-2 rounded-lg bg-blue-500 px-4 py-2 text-sm text-white shadow-lg transition-colors hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <FaMagic />
              <span>Create</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
