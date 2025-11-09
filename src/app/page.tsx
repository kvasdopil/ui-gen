"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Screen from "@/components/Screen";

type ScreenData = {
  id: string;
  htmlContent: string;
  history: Array<{ type: "user" | "assistant"; content: string }>;
  selectedPromptIndex: number | null;
};

export default function Home() {
  const [screens, setScreens] = useState<ScreenData[]>([]);
  const [selectedScreenId, setSelectedScreenId] = useState<string | null>(null);
  const [viewportTransform, setViewportTransform] = useState({ x: 0, y: 0, scale: 1 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const viewportRef = useRef<HTMLDivElement>(null);

  // Handle panning - only when clicking on empty space
  const handleMouseDown = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    // Only start dragging if clicking directly on viewport or viewport-content, not on screens
    if (target === viewportRef.current || (target.classList.contains('viewport-content') && !target.closest('[data-screen-container]'))) {
      // Unselect screen when clicking on empty space
      setSelectedScreenId(null);
      setIsDragging(true);
      setDragStart({ 
        x: e.clientX - viewportTransform.x, 
        y: e.clientY - viewportTransform.y 
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setViewportTransform({
        ...viewportTransform,
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
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
        const contentElement = screenElement.closest('.viewport-content') as HTMLElement;
        
        if (!contentElement) return;
        
        // Get the screen's bounding rect in viewport coordinates (after all transforms)
        const screenRect = screenElement.getBoundingClientRect();
        
        // Calculate screen center in viewport coordinates
        const screenCenterXViewport = screenRect.left + screenRect.width / 2 - viewportRect.left;
        const screenCenterYViewport = screenRect.top + screenRect.height / 2 - viewportRect.top;
        
        // Calculate viewport center
        const viewportCenterX = viewportRect.width / 2;
        const viewportCenterY = viewportRect.height / 2;
        
        // Calculate the offset needed to center the screen
        const offsetX = viewportCenterX - screenCenterXViewport;
        const offsetY = viewportCenterY - screenCenterYViewport;
        
        // Apply the offset to the current transform and reset scale to 1
        setViewportTransform((prevTransform) => ({
          x: prevTransform.x + offsetX / prevTransform.scale,
          y: prevTransform.y + offsetY / prevTransform.scale,
          scale: 1,
        }));
      }
    });
  }, []);

  // Handle screen creation
  const handleScreenCreate = useCallback((screenData: Omit<ScreenData, "id">) => {
    // Generate ID when function is called, not during render
    const timestamp = Date.now();
    const newScreen: ScreenData = {
      ...screenData,
      id: `screen-${timestamp}`,
    };
    setScreens((prevScreens) => [...prevScreens, newScreen]);
    setSelectedScreenId(newScreen.id);
    
    // Center and zoom to 100% for the new screen
    centerAndZoomScreen(newScreen.id);
  }, [centerAndZoomScreen]);

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
          screens.map((screen, index) => (
            <div
              key={screen.id}
              id={screen.id}
              data-screen-container
              style={{
                position: 'absolute',
                left: `${index * 50}px`,
                top: `${index * 50}px`,
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
    </div>
  );
}
