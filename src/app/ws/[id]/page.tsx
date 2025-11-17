"use client";

import { useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import Screen from "@/components/Screen";
import UserAvatar from "@/components/UserAvatar";
import WorkspaceHeader from "@/components/WorkspaceHeader";
import CreateScreenPopup from "@/components/CreateScreenPopup";
import NewScreenDialog from "@/components/NewScreenDialog";
import ArrowLine from "@/components/ArrowLine";
import CreateFromTouchableButton from "@/components/CreateFromTouchableButton";
import Viewport, { type ViewportHandle } from "@/components/Viewport";
import { useWorkspace } from "@/hooks/useWorkspace";
import { useScreens } from "@/hooks/useScreens";
import { useScreenDragging } from "@/hooks/useScreenDragging";
import { useArrowDrawing } from "@/hooks/useArrowDrawing";
import { useScreenCreation } from "@/hooks/useScreenCreation";
import { useViewportHelpers } from "@/hooks/useViewportHelpers";
import { useWorkspaceDownload } from "@/hooks/useWorkspaceDownload";

export default function WorkspacePage() {
  const params = useParams();
  const workspaceId = params.id as string;
  useSession(); // Keep for auth initialization

  const viewportHandleRef = useRef<ViewportHandle>(null);

  // Workspace management
  const { workspaceName, isLoadingWorkspace, handleWorkspaceNameUpdate } = useWorkspace(workspaceId);

  // Screen management
  const {
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
  } = useScreens(workspaceId);

  // Screen creation
  const {
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
  } = useScreenCreation({
    workspaceId,
    setScreens,
    viewportHandleRef,
  });

  // Create shared mouse state ref (needed by both dragging and arrow drawing)
  const isMouseDownRef = useRef(false);
  const [isMouseDown, setIsMouseDown] = useState(false);

  // Screen dragging (needs to be initialized first to provide mouse state to arrow drawing)
  const {
    draggedScreenId,
    isDraggingScreen,
    handleMouseDown: handleDragMouseDown,
    handleMouseMove: handleDragMouseMove,
    handleMouseUp: handleDragMouseUp,
    justFinishedDraggingRef,
  } = useScreenDragging({
    screens,
    selectedScreenId,
    setSelectedScreenId,
    handleScreenUpdate,
    handleScreenClick: (screenId, onClearPendingArrow, onCloseDialogs) =>
      handleScreenClick(screenId, onClearPendingArrow, onCloseDialogs, justFinishedDraggingRef),
    viewportHandleRef,
    onCloseDialogs: () => {
      setIsNewScreenMode(false);
        setIsCreateScreenPopupMode(false);
    },
    newScreenFormRef,
    createScreenPopupRef,
    isMouseDownRef,
    setIsMouseDown,
  });

  // Arrow drawing (uses mouse state from main component)
  const {
          arrowLine,
    setArrowLine,
    isCloningScreen,
    hoveredScreenIdRef,
    handleMouseMove: handleArrowMouseMove,
    handleMouseUp: handleArrowMouseUp,
    handleOverlayClick,
    handleCreateScreenFromPendingArrow,
  } = useArrowDrawing({
    screens,
    selectedScreenId,
    handleScreenUpdate,
    setScreens,
    viewportHandleRef,
    isMouseDownRef,
    setIsMouseDown,
    newScreenFormRef,
  });

  // Viewport helpers
  const { centerAndZoomScreen } = useViewportHelpers({ screens, viewportHandleRef });

  // Workspace download
  const { handleDownload } = useWorkspaceDownload({ screens, workspaceName });

  // Combined mouse handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    // Handle screen creation dialogs dismissal
        if (isCreateScreenPopupMode) {
          setIsCreateScreenPopupMode(false);
    }
    if (isNewScreenMode) {
      setIsNewScreenMode(false);
    }

    // Clear pending arrow when clicking (unless clicking on button)
    if (arrowLine?.isPending) {
      const target = e.target as HTMLElement;
      const isButtonClick = target.closest("button[aria-label='Create new screen']") !== null;
      if (!isButtonClick) {
      setArrowLine(null);
    }
    }

    // Handle screen dragging (will also handle arrow start if clicking on overlay)
    handleDragMouseDown(e);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    // Handle arrow drawing first (has priority)
    if (arrowLine) {
      handleArrowMouseMove(e);
        return;
      }
    // Then handle screen dragging
    handleDragMouseMove(e);
  };

  const handleMouseUp = (e?: React.MouseEvent) => {
    // Handle arrow drawing first (has priority)
    if (arrowLine) {
      handleArrowMouseUp(e);
      return;
    }
    // Then handle screen dragging
    handleDragMouseUp(e);
  };

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
                  onScreenClick={(screenId) =>
                    handleScreenClick(screenId, () => setArrowLine(null), () => {
                      setIsNewScreenMode(false);
                      setIsCreateScreenPopupMode(false);
                    })
                  }
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
