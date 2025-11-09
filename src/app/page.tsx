"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { FaMagic } from "react-icons/fa";
import Screen from "@/components/Screen";

type ScreenData = {
  id: string;
  htmlContent: string;
  history: Array<{ type: "user" | "assistant"; content: string }>;
  selectedPromptIndex: number | null;
  position?: { x: number; y: number };
};

export default function Home() {
  const [screens, setScreens] = useState<ScreenData[]>([]);
  const [selectedScreenId, setSelectedScreenId] = useState<string | null>(null);
  const [viewportTransform, setViewportTransform] = useState({ x: 0, y: 0, scale: 1 });
  const [isDragging, setIsDragging] = useState(false);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [clickPosition, setClickPosition] = useState<{ x: number; y: number } | null>(null);
  const [wasEmptySpaceClick, setWasEmptySpaceClick] = useState(false);
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
    
    // Check if clicking on a screen container (screens stop propagation, so this should only be true for empty space)
    const screenContainer = target.closest('[data-screen-container]');
    
    // Check if clicking within viewport but not on a screen
    const isWithinViewport = viewportRef.current?.contains(target);
    const isEmptySpace = isWithinViewport && !screenContainer;
    
    if (isEmptySpace) {
      // Unselect screen when clicking on empty space
      setSelectedScreenId(null);
      
      // Store click position and that it was empty space for handling on mouse up
      const rect = viewportRef.current?.getBoundingClientRect();
      if (rect) {
        setClickPosition({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        });
        setWasEmptySpaceClick(true);
      }
      
      // Set drag start position for potential dragging
      setDragStart({ 
        x: e.clientX - viewportTransform.x, 
        y: e.clientY - viewportTransform.y 
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
        return;
      }
    }
    
    // If user didn't drag and clicked on empty space, initiate new screen flow
    if (!isDragging && wasEmptySpaceClick && clickPosition) {
      // If not already in new screen mode, initiate it
      if (!isNewScreenMode) {
        setNewScreenPosition(clickPosition);
        setIsNewScreenMode(true);
      } else {
        // If already in new screen mode and clicking outside, cancel it (input is preserved)
        setIsNewScreenMode(false);
      }
    }
    
    // Reset drag and click tracking
    setIsDragging(false);
    setIsMouseDown(false);
    setClickPosition(null);
    setWasEmptySpaceClick(false);
  };


  // Handle zooming with scroll (10% to 100%)
  const handleWheel = (e: React.WheelEvent) => {
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
  };

  // Center and zoom to 100% when a screen is selected
  const centerAndZoomScreen = useCallback((screenId: string) => {
    // Use requestAnimationFrame to ensure DOM is updated
    requestAnimationFrame(() => {
      const screenElement = document.getElementById(screenId);
      if (screenElement && viewportRef.current) {
        const viewportRect = viewportRef.current.getBoundingClientRect();
        
        // Find the screen data to get its position in content coordinates
        const screen = screens.find(s => s.id === screenId);
        
        let screenCenterXContent: number;
        let screenCenterYContent: number;
        
        if (screen?.position) {
          // Use stored position
          screenCenterXContent = screen.position.x;
          screenCenterYContent = screen.position.y;
        } else {
          // Fallback: get position from DOM (for initial screen or screens without position)
          const screenRect = screenElement.getBoundingClientRect();
          
          // Get current transform from state
          setViewportTransform((currentTransform) => {
            // Convert from viewport coordinates to content coordinates
            // screenRect is in document coordinates, so subtract viewportRect to get viewport-relative
            const screenCenterXViewport = screenRect.left + screenRect.width / 2 - viewportRect.left;
            const screenCenterYViewport = screenRect.top + screenRect.height / 2 - viewportRect.top;
            
            // Convert to content coordinates
            screenCenterXContent = (screenCenterXViewport - currentTransform.x) / currentTransform.scale;
            screenCenterYContent = (screenCenterYViewport - currentTransform.y) / currentTransform.scale;
            
            // Viewport center in viewport coordinates
            const viewportCenterX = viewportRect.width / 2;
            const viewportCenterY = viewportRect.height / 2;
            
            // Calculate new transform to center the screen at scale 1
            const newX = viewportCenterX - screenCenterXContent;
            const newY = viewportCenterY - screenCenterYContent;
            
            return {
              x: newX,
              y: newY,
              scale: 1,
            };
          });
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
        setViewportTransform({
          x: newX,
          y: newY,
          scale: 1,
        });
      }
    });
  }, [screens]);

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
    setSelectedScreenId(newScreen.id);
    
    // Center and zoom to 100% for the new screen
    centerAndZoomScreen(newScreen.id);
  }, [centerAndZoomScreen]);

  // Handle creating a new screen from the form
  const handleCreateNewScreen = useCallback(() => {
    if (!newScreenInput.trim()) return;

    // Convert form position (viewport coordinates) to viewport-content coordinates
    // Account for the transform: translate(x, y) scale(scale)
    const contentX = (newScreenPosition.x - viewportTransform.x) / viewportTransform.scale;
    const contentY = (newScreenPosition.y - viewportTransform.y) / viewportTransform.scale;

    // Create initial history with the user prompt
    const initialHistory = [{ type: "user" as const, content: newScreenInput.trim() }];

    // Create the screen with initial history (will trigger generation)
    const timestamp = Date.now();
    const newScreen: ScreenData = {
      id: `screen-${timestamp}`,
      htmlContent: "",
      history: initialHistory,
      selectedPromptIndex: 0,
      position: { x: contentX, y: contentY },
    };

    setScreens((prevScreens) => [...prevScreens, newScreen]);
    setSelectedScreenId(newScreen.id);
    
    // Close the form and clear input
    setIsNewScreenMode(false);
    setNewScreenInput("");
    
    // Center and zoom to 100% for the new screen
    centerAndZoomScreen(newScreen.id);
  }, [newScreenInput, newScreenPosition, viewportTransform, centerAndZoomScreen]);

  // Handle screen update
  const handleScreenUpdate = (screenId: string, updates: Partial<ScreenData>) => {
    setScreens(screens.map(screen => 
      screen.id === screenId ? { ...screen, ...updates } : screen
    ));
  };

  // Handle screen click
  const handleScreenClick = (screenId: string) => {
    setSelectedScreenId(screenId);
    centerAndZoomScreen(screenId);
  };

  // Effect to center screen after selection
  useEffect(() => {
    if (selectedScreenId) {
      centerAndZoomScreen(selectedScreenId);
    }
  }, [selectedScreenId, centerAndZoomScreen]);

  return (
    <div
      ref={viewportRef}
      className="relative h-screen w-screen overflow-hidden bg-gradient-to-br from-sky-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-950 dark:to-neutral-900"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
      style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
    >
      <div
        className="viewport-content relative"
        style={{
          transform: `translate(${viewportTransform.x}px, ${viewportTransform.y}px) scale(${viewportTransform.scale})`,
          transformOrigin: '0 0',
        }}
      >
        {screens.length === 0 ? (
          <div
            id="initial-screen"
            data-screen-container
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
            }}
          >
            <Screen
              id="initial-screen"
              isSelected={false}
              onScreenClick={() => {}}
              onCreate={handleScreenCreate}
              onUpdate={handleScreenUpdate}
              screenData={null}
            />
          </div>
        ) : (
          screens.map((screen) => (
            <div
              key={screen.id}
              id={screen.id}
              data-screen-container
              style={{
                position: 'absolute',
                left: screen.position ? `${screen.position.x}px` : '0px',
                top: screen.position ? `${screen.position.y}px` : '0px',
                transform: 'translate(-50%, -50%)',
              }}
            >
              <Screen
                id={screen.id}
                isSelected={selectedScreenId === screen.id}
                onScreenClick={handleScreenClick}
                onCreate={handleScreenCreate}
                onUpdate={handleScreenUpdate}
                screenData={screen}
              />
            </div>
          ))
        )}
      </div>

      {/* New Screen Form - positioned absolutely in viewport coordinates */}
      {isNewScreenMode && (
        <div
          ref={newScreenFormRef}
          className="fixed z-50"
          style={{
            left: `${newScreenPosition.x}px`,
            top: `${newScreenPosition.y}px`,
            transform: 'translate(-50%, -50%)',
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
