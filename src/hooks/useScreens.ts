import { useState, useEffect, useRef, useCallback } from "react";
import type { ScreenData } from "@/lib/types";
import { storage } from "@/lib/storage";
import { snapToGrid } from "@/lib/workspace-utils";

export function useScreens(workspaceId: string) {
  const [screens, setScreens] = useState<ScreenData[]>([]);
  const [isLoadingScreens, setIsLoadingScreens] = useState(true);
  const [selectedScreenId, setSelectedScreenId] = useState<string | null>(null);
  const screenSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastUpdatedScreenIdRef = useRef<string | null>(null);
  const hasCompletedInitialLoadRef = useRef<boolean>(false);

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
  }, []);

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
  const handleScreenClick = useCallback(
    (
      screenId: string,
      onClearPendingArrow?: () => void,
      onCloseDialogs?: () => void,
      justFinishedDraggingRef?: React.MutableRefObject<string | null>,
    ) => {
      // Don't select if we just finished dragging this screen
      if (justFinishedDraggingRef?.current === screenId) {
        return;
      }
      // Clear pending arrow when clicking on a screen
      if (onClearPendingArrow) {
        onClearPendingArrow();
      }
      // Don't re-select if already selected (prevents double-selection from click event after mouseUp)
      if (selectedScreenId === screenId) {
        return;
      }
      setSelectedScreenId(screenId);
      // Close new screen form if it's open
      if (onCloseDialogs) {
        onCloseDialogs();
      }
    },
    [selectedScreenId],
  );

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
    },
    [screens],
  );

  return {
    screens,
    isLoadingScreens,
    selectedScreenId,
    setSelectedScreenId,
    setScreens,
    handleScreenCreate,
    handleScreenUpdate,
    handleScreenClick,
    handleScreenDelete,
    handleScreenClone,
  };
}

