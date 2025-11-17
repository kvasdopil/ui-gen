import { useState, useRef, useCallback } from "react";
import { signIn } from "next-auth/react";
import { usePersistentState } from "@/hooks/usePersistentState";
import type { ViewportHandle } from "@/components/Viewport";
import type { ScreenData } from "@/lib/types";
import { storage } from "@/lib/storage";
import { snapToGrid } from "@/lib/workspace-utils";

interface UseScreenCreationProps {
  workspaceId: string;
  setScreens: React.Dispatch<React.SetStateAction<ScreenData[]>>;
  viewportHandleRef: React.RefObject<ViewportHandle | null>;
}

export function useScreenCreation({
  workspaceId,
  setScreens,
  viewportHandleRef,
}: UseScreenCreationProps) {
  const [isCreateScreenPopupMode, setIsCreateScreenPopupMode] = useState(false);
  const [isNewScreenMode, setIsNewScreenMode] = useState(false);
  const [isCreatingScreen, setIsCreatingScreen] = useState(false);
  const [newScreenInput, setNewScreenInput] = usePersistentState<string>("newScreenInput", "", 300);
  const [newScreenPosition, setNewScreenPosition] = useState({ x: 0, y: 0 });
  const newScreenFormRef = useRef<HTMLDivElement>(null);
  const createScreenPopupRef = useRef<HTMLDivElement>(null);

  // Handle right-click to show new screen menu
  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
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
    },
    [isCreateScreenPopupMode, viewportHandleRef],
  );

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
    } catch (error) {
      console.error("Error creating screen:", error);
      // TODO: Show error to user
      setIsCreatingScreen(false);
    }
  }, [newScreenInput, newScreenPosition, setNewScreenInput, isCreatingScreen, workspaceId, viewportHandleRef, setScreens]);

  return {
    isCreateScreenPopupMode,
    setIsCreateScreenPopupMode,
    isNewScreenMode,
    setIsNewScreenMode,
    isCreatingScreen,
    newScreenInput,
    setNewScreenInput,
    newScreenPosition,
    newScreenFormRef,
    createScreenPopupRef,
    handleContextMenu,
    handleCreateNewScreen,
  };
}

