import { useState, useRef, useEffect, useCallback } from "react";
import { signIn } from "next-auth/react";
import type { ViewportHandle } from "@/components/Viewport";
import type { ScreenData, ConversationPointArrow } from "@/lib/types";
import { storage } from "@/lib/storage";
import { snapToGrid } from "@/lib/workspace-utils";

export type ArrowLine = {
  start: { x: number; y: number };
  end: { x: number; y: number };
  startScreenId: string;
  touchableId: string; // aria-roledescription value from the touchable element
  text: string;
  isPending?: boolean; // True when dropped in empty space, waiting for button click
};

interface UseArrowDrawingProps {
  screens: ScreenData[];
  selectedScreenId: string | null;
  handleScreenUpdate: (screenId: string, updates: Partial<ScreenData>) => void;
  setScreens: React.Dispatch<React.SetStateAction<ScreenData[]>>;
  viewportHandleRef: React.RefObject<ViewportHandle | null>;
  isMouseDownRef: React.MutableRefObject<boolean>;
  setIsMouseDown: React.Dispatch<React.SetStateAction<boolean>>;
  newScreenFormRef: React.RefObject<HTMLDivElement | null>;
}

export function useArrowDrawing({
  screens,
  selectedScreenId,
  handleScreenUpdate,
  setScreens,
  viewportHandleRef,
  isMouseDownRef,
  setIsMouseDown,
  newScreenFormRef,
}: UseArrowDrawingProps) {
  const [arrowLine, setArrowLine] = useState<ArrowLine | null>(null);
  const [isCloningScreen, setIsCloningScreen] = useState(false);
  const hoveredScreenIdRef = useRef<string | null>(null);

  // Handle mouse move for arrow drawing
  const handleMouseMove = useCallback(
    (e: React.MouseEvent | MouseEvent) => {
      // Only handle dragging if mouse button is pressed (check ref for reliable state)
      if (!isMouseDownRef.current) {
        return;
      }

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
      }
    },
    [arrowLine, viewportHandleRef, isMouseDownRef],
  );

  // Handle mouse up for arrow drawing
  const handleMouseUp = useCallback(
    (e?: React.MouseEvent | MouseEvent) => {
      // Ignore mouseleave events when drawing an arrow - only terminate on actual mouseup
      if (e && e.type === "mouseleave") {
        if (arrowLine) {
          return;
        }
      }

      // If event is provided, check if clicking on the new screen form itself
      if (e && "target" in e) {
        const target = e.target as HTMLElement;
        if (newScreenFormRef.current?.contains(target)) {
          setIsMouseDown(false);
          isMouseDownRef.current = false;
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
          setArrowLine(null);
          hoveredScreenIdRef.current = null;
          setIsMouseDown(false);
          isMouseDownRef.current = false;
          return;
        } else {
          // Dropped in empty space - keep arrow in pending state with button
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

      // Clear pending arrow if clicking on empty space (but not on the button itself)
      if (e) {
        const target = e.target as HTMLElement;
        const pendingArrow = arrowLine as ArrowLine | null;
        if (
          pendingArrow &&
          pendingArrow.isPending &&
          !target.closest("button[aria-label='Create new screen']")
        ) {
          setArrowLine(null);
        }
      }
    },
    [arrowLine, screens, handleScreenUpdate, viewportHandleRef, setIsMouseDown, isMouseDownRef, newScreenFormRef],
  );

  // Handle overlay click - start arrow from center of clicked overlay
  const handleOverlayClick = useCallback(
    (center: { x: number; y: number }, screenId: string, touchableId: string, text: string) => {
      // Clear any pending arrow when starting a new one
      if (arrowLine?.isPending) {
        setArrowLine(null);
      }
      const viewportElement = viewportHandleRef.current?.getElement();
      const rect = viewportElement?.getBoundingClientRect();
      if (rect) {
        // Convert from viewport (browser window) coordinates to viewport container coordinates
        const startX = center.x - rect.left;
        const startY = center.y - rect.top;
        setArrowLine({
          start: { x: startX, y: startY },
          end: { x: startX, y: startY },
          startScreenId: screenId,
          touchableId,
          text,
        });
        setIsMouseDown(true);
        isMouseDownRef.current = true; // Set ref so handleMouseMove can track arrow drawing
      }
    },
    [arrowLine, viewportHandleRef, setIsMouseDown, isMouseDownRef],
  );

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

      // Check hard limit of 20 conversation points per screen
      if (clonedScreen.conversationPoints.length >= 20) {
        console.error("Cannot add conversation point: maximum limit of 20 reached");
        setIsCloningScreen(false);
        // TODO: Show error to user
        return;
      }

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

      // Clear the pending arrow
      setArrowLine(null);
    } catch (error) {
      console.error("Error creating screen from pending arrow:", error);
      // TODO: Show error to user
    } finally {
      setIsCloningScreen(false);
    }
  }, [arrowLine, screens, isCloningScreen, viewportHandleRef, setScreens]);

  // Attach global window listeners when drawing arrow to continue even if mouse leaves viewport
  useEffect(() => {
    if (arrowLine) {
      const handleGlobalMouseMove = (e: MouseEvent) => {
        // Only process if mouse button is still down (check ref for reliable state)
        if (isMouseDownRef.current) {
          handleMouseMove(e);
        }
      };
      const handleGlobalMouseUp = (e: MouseEvent) => {
        // Always handle mouse up to ensure arrow creation terminates properly
        handleMouseUp(e);
      };

      window.addEventListener("mousemove", handleGlobalMouseMove, { capture: true });
      window.addEventListener("mouseup", handleGlobalMouseUp, { capture: true });

      return () => {
        window.removeEventListener("mousemove", handleGlobalMouseMove, { capture: true });
        window.removeEventListener("mouseup", handleGlobalMouseUp, { capture: true });
      };
    }
  }, [arrowLine, handleMouseMove, handleMouseUp, isMouseDownRef]);

  return {
    arrowLine,
    setArrowLine,
    isCloningScreen,
    hoveredScreenIdRef,
    handleMouseMove,
    handleMouseUp,
    handleOverlayClick,
    handleCreateScreenFromPendingArrow,
  };
}

