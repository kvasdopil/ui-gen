import { useCallback } from "react";
import type { ViewportHandle } from "@/components/Viewport";
import type { ScreenData } from "@/lib/types";

interface UseViewportHelpersProps {
  screens: ScreenData[];
  viewportHandleRef: React.RefObject<ViewportHandle | null>;
}

export function useViewportHelpers({ screens, viewportHandleRef }: UseViewportHelpersProps) {
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
    [screens, viewportHandleRef],
  );

  return {
    centerAndZoomScreen,
  };
}

