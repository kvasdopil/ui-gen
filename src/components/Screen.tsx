"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { FaSpinner, FaMagic } from "react-icons/fa";
import { TbHandClick } from "react-icons/tb";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import PromptPanel, { type PromptPanelHandle } from "./PromptPanel";
import type { ScreenData, ConversationPoint, ConversationPointArrow } from "@/lib/types";
import { storage } from "@/lib/storage";

interface ScreenProps {
  id: string;
  isSelected: boolean;
  onScreenClick: (screenId: string) => void;
  onCreate: (screenData: Omit<ScreenData, "id">) => void;
  onUpdate: (screenId: string, updates: Partial<ScreenData>) => void;
  onDelete: (screenId: string) => void;
  onClone: (screenId: string, pointIndex: number) => void;
  onOverlayClick?: (
    center: { x: number; y: number },
    screenId: string,
    touchableId: string,
    text: string,
  ) => void;
  screenData: ScreenData | null;
  onCenterAndZoom: (screenId: string) => void;
}

export default function Screen({
  id,
  isSelected,
  onScreenClick,
  onCreate, // eslint-disable-line @typescript-eslint/no-unused-vars
  onUpdate,
  onDelete,
  onClone,
  onOverlayClick,
  screenData,
  onCenterAndZoom,
}: ScreenProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errorTimestamp, setErrorTimestamp] = useState<number | null>(null);
  const [conversationPoints, setConversationPoints] = useState<ConversationPoint[]>(
    screenData?.conversationPoints || [],
  );
  const [selectedPromptIndex, setSelectedPromptIndex] = useState<number | null>(
    screenData?.selectedPromptIndex ?? null,
  );
  const generationInProgressRef = useRef<string | null>(null);
  const [iframeHeight, setIframeHeight] = useState<number>(
    screenData?.height || 844, // Use stored height or default
  );
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const iframeWindowRef = useRef<Window | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [highlights, setHighlights] = useState<
    Array<{
      type: "a" | "button";
      x: number;
      y: number;
      width: number;
      height: number;
      text: string;
      touchableId: string; // aria-roledescription value from the element
    }>
  >([]);
  const [showClickables, setShowClickables] = useState(false);
  const promptPanelRef = useRef<PromptPanelHandle>(null);

  // Extract title from HTML content
  const extractTitle = (html: string): string | null => {
    if (!html) return null;
    // Look for <!-- Title: ... --> comment in the HTML
    const titleMatch = html.match(/<!--\s*Title:\s*([^>]+)-->/);
    if (titleMatch && titleMatch[1]) {
      return titleMatch[1].trim();
    }
    return null;
  };

  // Helper function to wrap HTML with Tailwind and Font Awesome
  const wrapHtmlWithTailwind = (html: string) => {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Generated UI</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" integrity="sha512-DTOQO9RWCH3ppGqcWaEA1BIZOC6xxalwEsw9c2QQeAIftl+Vegovlnee1c9QX4TctnWMn13TZye+giMm8e2LwA==" crossorigin="anonymous" referrerpolicy="no-referrer" />
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { width: 100%; min-height: 844px; }
    body > * { min-height: 844px; }
    a, button { cursor: pointer; }
  </style>
</head>
<body>
  ${html}
  <script>
    (function() {
      function sendHeight() {
        const height = Math.max(844, document.documentElement.scrollHeight);
        window.parent.postMessage({ type: 'iframe-height', height: height }, '*');
      }
      
      function preventNavigation() {
        // Prevent all link clicks from navigating (including hash links)
        document.addEventListener('click', function(e) {
          const target = e.target.closest('a[href]');
          if (target) {
            e.preventDefault();
            e.stopPropagation();
            return false;
          }
        }, true); // Use capture phase to catch early
        
        // Prevent form submissions that would navigate
        document.addEventListener('submit', function(e) {
          e.preventDefault();
          e.stopPropagation();
          return false;
        }, true);
        
        // Prevent hashchange events
        window.addEventListener('hashchange', function(e) {
          e.preventDefault();
          e.stopImmediatePropagation();
          // Reset hash to empty
          try {
            history.replaceState(null, '', window.location.pathname + window.location.search);
          } catch (err) {
            // Ignore errors
          }
        }, true);
        
        // Prevent window.open
        window.open = function() {
          console.warn('Navigation prevented: window.open()');
          return null;
        };
        
        // Prevent programmatic navigation via location methods
        try {
          const originalReplace = window.location.replace;
          const originalAssign = window.location.assign;
          
          window.location.replace = function() {
            console.warn('Navigation prevented: location.replace()');
          };
          
          window.location.assign = function() {
            console.warn('Navigation prevented: location.assign()');
          };
          
          // Prevent direct location.href assignment
          let locationHref = window.location.href.split('#')[0]; // Remove hash from initial href
          Object.defineProperty(window.location, 'href', {
            get: function() {
              return locationHref;
            },
            set: function(value) {
              // Remove hash from the value
              const urlWithoutHash = value.split('#')[0];
              if (urlWithoutHash !== locationHref) {
                console.warn('Navigation prevented: location.href =', value);
              }
            }
          });
          
          // Prevent location.hash changes
          let locationHash = '';
          Object.defineProperty(window.location, 'hash', {
            get: function() {
              return locationHash;
            },
            set: function(value) {
              console.warn('Navigation prevented: location.hash =', value);
            }
          });
          
          // Prevent history.pushState/replaceState with hash
          const originalPushState = history.pushState;
          const originalReplaceState = history.replaceState;
          
          history.pushState = function() {
            const url = arguments[2];
            if (url && typeof url === 'string' && url.includes('#')) {
              console.warn('Navigation prevented: history.pushState() with hash');
              return;
            }
            return originalPushState.apply(history, arguments);
          };
          
          history.replaceState = function() {
            const url = arguments[2];
            if (url && typeof url === 'string' && url.includes('#')) {
              console.warn('Navigation prevented: history.replaceState() with hash');
              return;
            }
            return originalReplaceState.apply(history, arguments);
          };
        } catch (e) {
          // Some browsers may restrict location property modification
          console.debug('Could not override location methods:', e);
        }
      }
      
      function init() {
        sendHeight();
        preventNavigation();
        if (window.ResizeObserver) {
          new ResizeObserver(() => requestAnimationFrame(sendHeight)).observe(document.body);
        }
      }
      
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
      } else {
        init();
      }
      window.addEventListener('load', sendHeight);
    })();
  </script>
</body>
</html>`;
  };

  // Get current HTML content from selected conversation point
  const getCurrentHtmlContent = (): string => {
    if (selectedPromptIndex !== null && conversationPoints[selectedPromptIndex]) {
      return wrapHtmlWithTailwind(conversationPoints[selectedPromptIndex].html);
    }
    // If no selection, use the last conversation point
    if (conversationPoints.length > 0) {
      return wrapHtmlWithTailwind(conversationPoints[conversationPoints.length - 1].html);
    }
    return "";
  };

  const htmlContent = getCurrentHtmlContent();
  const screenTitle =
    selectedPromptIndex !== null && conversationPoints[selectedPromptIndex]
      ? conversationPoints[selectedPromptIndex].title
      : conversationPoints.length > 0
        ? conversationPoints[conversationPoints.length - 1].title
        : null;

  // Get the current prompt being generated (for placeholder display)
  const getCurrentPrompt = (): string | null => {
    // Get the prompt from the incomplete conversation point
    if (selectedPromptIndex !== null && conversationPoints[selectedPromptIndex]) {
      const point = conversationPoints[selectedPromptIndex];
      if (!point.html && point.prompt) {
        return point.prompt;
      }
    }
    // Check last point if no selection or selected point has HTML
    if (conversationPoints.length > 0) {
      const lastPoint = conversationPoints[conversationPoints.length - 1];
      if (!lastPoint.html && lastPoint.prompt) {
        return lastPoint.prompt;
      }
    }
    return null;
  };

  const currentPrompt = getCurrentPrompt();
  // Show placeholder when:
  // 1. The currently selected conversation point is incomplete (has prompt but no HTML)
  // 2. There's no selected point and the last point is incomplete
  // 3. Screen exists but has no content yet (newly created screen waiting for first dialog entry)
  // Note: We check the selected point specifically, not the global isLoading state,
  // so that switching to previous points with HTML doesn't show placeholder when a new point is loading
  const isSelectedPointIncomplete =
    selectedPromptIndex !== null &&
    conversationPoints[selectedPromptIndex] &&
    conversationPoints[selectedPromptIndex].prompt &&
    !conversationPoints[selectedPromptIndex].html;
  const isLastPointIncomplete =
    conversationPoints.length > 0 &&
    conversationPoints[conversationPoints.length - 1].prompt &&
    !conversationPoints[conversationPoints.length - 1].html;
  const shouldShowPlaceholder =
    isSelectedPointIncomplete ||
    (selectedPromptIndex === null && isLastPointIncomplete) ||
    (htmlContent === "" && conversationPoints.length === 0 && screenData !== null);

  // Check if we should show error for the current incomplete point
  const getCurrentError = (): string | null => {
    if (!errorMessage || !errorTimestamp) return null;
    // Check if error is for the selected point
    if (selectedPromptIndex !== null && conversationPoints[selectedPromptIndex]) {
      const point = conversationPoints[selectedPromptIndex];
      if (!point.html && point.timestamp === errorTimestamp) {
        return errorMessage;
      }
    }
    // Check if error is for the last point (when no selection)
    if (selectedPromptIndex === null && conversationPoints.length > 0) {
      const lastPoint = conversationPoints[conversationPoints.length - 1];
      if (!lastPoint.html && lastPoint.timestamp === errorTimestamp) {
        return errorMessage;
      }
    }
    return null;
  };

  const currentError = getCurrentError();
  const showError = currentError !== null && !isLoading;

  // Find the point index for the error to enable retry
  const getErrorPointIndex = (): number | null => {
    if (!errorTimestamp) return null;
    const index = conversationPoints.findIndex(
      (point) => point.timestamp === errorTimestamp && !point.html,
    );
    return index >= 0 ? index : null;
  };

  const errorPointIndex = getErrorPointIndex();

  // Handle retry from error screen
  const handleRetryFromError = () => {
    if (errorPointIndex !== null) {
      const point = conversationPoints[errorPointIndex];
      if (point && point.prompt) {
        handleSend(point.prompt, point.timestamp);
      }
    }
  };

  // Listen for height messages from iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Verify message is from our iframe
      if (
        event.data &&
        event.data.type === "iframe-height" &&
        typeof event.data.height === "number" &&
        (iframeRef.current?.contentWindow === event.source ||
          iframeWindowRef.current === event.source)
      ) {
        const newHeight = Math.max(844, event.data.height); // Ensure minimum height
        setIframeHeight(newHeight);
        // Update screenData with new height
        if (screenData) {
          onUpdate(id, { height: newHeight });
        }
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [screenData, id, onUpdate]);

  // Reset height when content changes
  useEffect(() => {
    setIframeHeight(844); // Reset to default when content changes
  }, [htmlContent]);

  // Handle Delete key to trigger delete for latest conversation point
  useEffect(() => {
    if (!isSelected) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle Delete key
      if (e.key !== "Delete") return;

      // Don't trigger if user is typing in an input/textarea
      const activeElement = document.activeElement;
      if (
        activeElement &&
        (activeElement.tagName === "INPUT" ||
          activeElement.tagName === "TEXTAREA" ||
          (activeElement as HTMLElement).isContentEditable)
      ) {
        return;
      }

      // Check if latest conversation point is selected
      const lastIndex = conversationPoints.length - 1;
      if (lastIndex < 0) return; // No conversation points

      // Only trigger if the latest point is explicitly selected
      if (selectedPromptIndex === lastIndex && promptPanelRef.current) {
        e.preventDefault();
        promptPanelRef.current.triggerDelete(lastIndex);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSelected, conversationPoints.length, selectedPromptIndex]);

  // Function to update highlights from iframe content
  const updateHighlights = useCallback(() => {
    if (!iframeRef.current || !containerRef.current || !htmlContent) {
      setHighlights([]);
      return;
    }

    try {
      const iframeDoc = iframeRef.current.contentDocument;
      const iframeWindow = iframeRef.current.contentWindow;
      if (!iframeDoc || !iframeDoc.documentElement || !iframeWindow) {
        setHighlights([]);
        return;
      }

      const newHighlights: Array<{
        type: "a" | "button";
        x: number;
        y: number;
        width: number;
        height: number;
        text: string;
        touchableId: string;
      }> = [];

      // Get iframe's position within container (accounts for border)
      const containerRect = containerRef.current.getBoundingClientRect();
      const iframeRect = iframeRef.current.getBoundingClientRect();
      const iframeOffsetX = iframeRect.left - containerRect.left;
      const iframeOffsetY = iframeRect.top - containerRect.top;

      // Helper to get element position relative to iframe document (not affected by parent transforms)
      const getElementPositionInIframe = (element: Element) => {
        let x = 0;
        let y = 0;
        let current: Element | null = element;

        // Walk up the DOM tree accumulating offsets
        while (current && current !== iframeDoc.documentElement) {
          const htmlElement = current as HTMLElement;
          x += htmlElement.offsetLeft || 0;
          y += htmlElement.offsetTop || 0;
          current = htmlElement.offsetParent as Element | null;
        }

        return { x, y };
      };

      // Find all <a> elements with href attribute
      const links = iframeDoc.querySelectorAll("a[href]");
      links.forEach((link) => {
        const pos = getElementPositionInIframe(link);
        const rect = link.getBoundingClientRect();
        // Extract text content from link
        const text = link.textContent?.trim() || link.getAttribute("aria-label") || "";
        // Extract aria-roledescription as touchableId (required attribute)
        const touchableId = link.getAttribute("aria-roledescription");
        if (!touchableId) {
          console.warn("[Screen] Link element missing aria-roledescription:", link);
          return; // Skip elements without aria-roledescription
        }
        // Position relative to container = position in iframe + iframe offset in container
        newHighlights.push({
          type: "a",
          x: pos.x + iframeOffsetX,
          y: pos.y + iframeOffsetY,
          width: rect.width,
          height: rect.height,
          text,
          touchableId,
        });
      });

      // Find all <button> elements
      const buttons = iframeDoc.querySelectorAll("button");
      buttons.forEach((button) => {
        const pos = getElementPositionInIframe(button);
        const rect = button.getBoundingClientRect();
        // Extract text content from button
        const text = button.textContent?.trim() || button.getAttribute("aria-label") || "";
        // Extract aria-roledescription as touchableId (required attribute)
        const touchableId = button.getAttribute("aria-roledescription");
        if (!touchableId) {
          console.warn("[Screen] Button element missing aria-roledescription:", button);
          return; // Skip elements without aria-roledescription
        }
        // Position relative to container = position in iframe + iframe offset in container
        newHighlights.push({
          type: "button",
          x: pos.x + iframeOffsetX,
          y: pos.y + iframeOffsetY,
          width: rect.width,
          height: rect.height,
          text,
          touchableId,
        });
      });

      setHighlights(newHighlights);
    } catch (error) {
      // Cross-origin or other error - silently fail
      console.debug("Could not access iframe content for highlights:", error);
      setHighlights([]);
    }
  }, [htmlContent]);

  // Update highlights when iframe content loads or changes
  useEffect(() => {
    if (!htmlContent) {
      setHighlights([]);
      return;
    }

    // Wait for iframe to load
    if (iframeRef.current) {
      const iframe = iframeRef.current;

      // Try immediately if already loaded
      if (iframe.contentDocument?.readyState === "complete") {
        // Small delay to ensure rendering is complete
        setTimeout(updateHighlights, 100);
      } else {
        // Wait for load event
        iframe.addEventListener(
          "load",
          () => {
            setTimeout(updateHighlights, 100);
          },
          { once: true },
        );
      }
    }

    // Also update on window resize or scroll
    const handleUpdate = () => {
      if (iframeRef.current && htmlContent) {
        updateHighlights();
      }
    };

    window.addEventListener("resize", handleUpdate);
    window.addEventListener("scroll", handleUpdate, true);

    return () => {
      window.removeEventListener("resize", handleUpdate);
      window.removeEventListener("scroll", handleUpdate, true);
    };
  }, [htmlContent, iframeHeight, updateHighlights]);

  // Sync with external screenData when it changes
  useEffect(() => {
    if (screenData) {
      setConversationPoints(screenData.conversationPoints);
      setSelectedPromptIndex(screenData.selectedPromptIndex);
      // Update iframeHeight if screenData has a different height
      if (screenData.height !== undefined && screenData.height !== iframeHeight) {
        setIframeHeight(screenData.height);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screenData]);

  // Auto-start generation if screenData has conversation points but last one doesn't have HTML
  useEffect(() => {
    if (screenData && screenData.conversationPoints.length > 0 && !isLoading) {
      const lastPoint = screenData.conversationPoints[screenData.conversationPoints.length - 1];
      // If last point has a prompt but no HTML, it means generation needs to start
      if (lastPoint.prompt && !lastPoint.html) {
        // Don't auto-retry if there's an error for this point (user should retry manually)
        if (errorTimestamp && lastPoint.timestamp === errorTimestamp) {
          return;
        }

        // Create a unique key for this generation attempt using the existing point's timestamp
        const generationKey = `${screenData.id}-${lastPoint.timestamp}`;

        // Only trigger if we haven't already started generation for this point
        if (generationInProgressRef.current !== generationKey) {
          generationInProgressRef.current = generationKey;
          // Use the existing incomplete point instead of creating a new one
          handleSend(lastPoint.prompt, lastPoint.timestamp);
        }
      } else {
        // Reset ref if the point has HTML (generation completed)
        generationInProgressRef.current = null;
      }
    }
  }, [screenData, isLoading, errorTimestamp]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSend = async (modificationPrompt: string, existingTimestamp?: number) => {
    if (!modificationPrompt.trim()) return;
    const promptToSend = modificationPrompt;

    // Clear any previous error when starting a new generation
    setErrorMessage(null);
    setErrorTimestamp(null);

    let pointsWithIncomplete: ConversationPoint[];
    let incompleteIndex: number;
    const timestampToUse = existingTimestamp || Date.now();

    // If we have an existing timestamp, it means we're being called from auto-generation
    // and should reuse the existing incomplete point from screenData
    if (existingTimestamp && screenData) {
      // Use the existing incomplete point from screenData
      pointsWithIncomplete = screenData.conversationPoints;
      incompleteIndex = pointsWithIncomplete.length - 1;
      // Sync local state with screenData
      setConversationPoints(pointsWithIncomplete);
      setSelectedPromptIndex(incompleteIndex);
    } else {
      // Check if there's already an incomplete point for this prompt (user-initiated modification)
      const existingIncompleteIndex = conversationPoints.findIndex(
        (p) => p.prompt === promptToSend && !p.html,
      );

      if (existingIncompleteIndex >= 0) {
        // Reuse existing incomplete point - don't create a duplicate
        pointsWithIncomplete = conversationPoints;
        incompleteIndex = existingIncompleteIndex;
      } else {
        // Add the prompt immediately as an incomplete conversation point (for modifications)
        // This makes it appear in history right away while generation is in progress
        const incompletePoint: ConversationPoint = {
          prompt: promptToSend,
          html: "",
          title: null,
          timestamp: timestampToUse,
        };
        pointsWithIncomplete = [...conversationPoints, incompletePoint];
        incompleteIndex = pointsWithIncomplete.length - 1;
        setConversationPoints(pointsWithIncomplete);

        // Select the newly added prompt immediately
        setSelectedPromptIndex(incompleteIndex);

        // Update screen data immediately to show the prompt in history
        if (screenData) {
          onUpdate(id, {
            conversationPoints: pointsWithIncomplete,
            selectedPromptIndex: incompleteIndex,
          });
        }
      }
    }

    setIsLoading(true);
    try {
      let response: Response;
      let data: {
        html: string;
        id?: string;
        prompt?: string;
        title?: string | null;
        timestamp?: number;
      };

      if (screenData) {
        // Update existing screen - add dialog entry
        response = await fetch(`/api/screens/${id}/dialog`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: promptToSend }),
        });

        if (!response.ok) {
          // Handle unauthorized error - save prompt and trigger auth
          if (response.status === 401) {
            // Save the prompt and screenId for restoration after auth
            // The screen already exists with the incomplete conversation point
            await storage.savePendingPrompt(promptToSend, id, null);
            // Trigger sign in - will redirect back after auth
            signIn("google", { callbackUrl: window.location.href });
            return; // Exit early - will retry after auth
          }
          // Try to extract error message from response
          let errorMsg = "Failed to generate UI";
          try {
            const errorData = await response.json();
            if (errorData.error) {
              errorMsg = errorData.error;
            }
          } catch {
            // If response is not JSON, use status text or default message
            errorMsg = response.statusText || `Failed to generate UI (${response.status})`;
          }
          throw new Error(errorMsg);
        }

        data = await response.json();
      } else {
        // This shouldn't happen for modifications, but handle it just in case
        throw new Error("Screen data not found");
      }

      // Extract title from HTML
      const title = data.title || extractTitle(data.html);

      // Helper function to extract touchable IDs from HTML
      const extractTouchableIds = (html: string): Set<string> => {
        const touchableIds = new Set<string>();
        // Create a temporary DOM element to parse HTML
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");
        // Find all <a> and <button> elements with aria-roledescription
        const links = doc.querySelectorAll("a[aria-roledescription]");
        const buttons = doc.querySelectorAll("button[aria-roledescription]");
        links.forEach((link) => {
          const touchableId = link.getAttribute("aria-roledescription");
          if (touchableId) {
            touchableIds.add(touchableId);
          }
        });
        buttons.forEach((button) => {
          const touchableId = button.getAttribute("aria-roledescription");
          if (touchableId) {
            touchableIds.add(touchableId);
          }
        });
        return touchableIds;
      };

      // Copy arrows from previous conversation point if they exist
      let copiedArrows: ConversationPointArrow[] = [];
      if (pointsWithIncomplete.length > 0 && incompleteIndex > 0) {
        // Get the previous conversation point (the one before the incomplete one we just added)
        const previousPointIndex = incompleteIndex - 1;
        const previousPoint = pointsWithIncomplete[previousPointIndex];
        if (previousPoint?.arrows && previousPoint.arrows.length > 0) {
          // Extract touchable IDs from the new HTML
          const newTouchableIds = extractTouchableIds(data.html);
          // Filter arrows to only include those whose touchableId exists in the new HTML
          copiedArrows = previousPoint.arrows.filter((arrow) =>
            newTouchableIds.has(arrow.touchableId),
          );
        }
      }

      // Create the completed conversation point with HTML and title
      // Preserve the original timestamp from the incomplete point and the ID from the API
      const completedPoint: ConversationPoint = {
        id: data.id,
        prompt: data.prompt || promptToSend,
        html: data.html,
        title,
        timestamp: data.timestamp || timestampToUse,
        arrows: copiedArrows.length > 0 ? copiedArrows : undefined,
      };

      // Replace the incomplete point with the completed one
      // Find the incomplete point index - it should be at incompleteIndex
      const finalPoints = [
        ...pointsWithIncomplete.slice(0, incompleteIndex),
        completedPoint,
        ...pointsWithIncomplete.slice(incompleteIndex + 1),
      ];

      setConversationPoints(finalPoints);

      // Clear any error state since generation succeeded
      setErrorMessage(null);
      setErrorTimestamp(null);

      // Reset generation tracking since we've completed
      generationInProgressRef.current = null;

      // Select the newly created prompt
      const newSelectedPromptIndex = finalPoints.length - 1;
      setSelectedPromptIndex(newSelectedPromptIndex);

      // Update screen data
      if (screenData) {
        // Update existing screen
        onUpdate(id, {
          conversationPoints: finalPoints,
          selectedPromptIndex: newSelectedPromptIndex,
        });
      }

      // Save copied arrows to database if they exist
      if (copiedArrows.length > 0 && completedPoint.id) {
        storage
          .updateDialogEntryArrows(id, completedPoint.id, copiedArrows)
          .catch((error) => {
            console.error("Error saving copied arrows to database:", error);
          });
      }
    } catch (error) {
      console.error("Error generating UI:", error);
      // Set error message instead of removing the incomplete point
      // This allows the user to see what went wrong and retry if needed
      const errorMsg =
        error instanceof Error ? error.message : "Failed to generate UI. Please try again.";
      setErrorMessage(errorMsg);
      setErrorTimestamp(timestampToUse);

      // Keep the incomplete point so the error message can be displayed
      // But update screenData to prevent auto-generation from retrying
      // We'll mark it by keeping the incomplete point but preventing auto-retry
      if (screenData) {
        // Update screenData to reflect current state (incomplete point with error)
        onUpdate(id, {
          conversationPoints: pointsWithIncomplete,
          selectedPromptIndex: incompleteIndex,
        });
      }

      // Reset generation tracking on error so it can be retried manually
      generationInProgressRef.current = null;
    } finally {
      setIsLoading(false);
    }
  };

  // Handle prompt selection - display the corresponding conversation point
  const handlePromptSelect = (pointIndex: number) => {
    if (pointIndex >= 0 && pointIndex < conversationPoints.length) {
      setSelectedPromptIndex(pointIndex);

      // Update screen data
      if (screenData) {
        onUpdate(id, {
          selectedPromptIndex: pointIndex,
        });
      }
    }
  };

  // Handle conversation point deletion
  const handleDeletePoint = async (pointIndex: number) => {
    if (pointIndex < 0 || pointIndex >= conversationPoints.length) return;

    const pointToDelete = conversationPoints[pointIndex];

    // If it's the last remaining point, delete the entire screen
    if (conversationPoints.length === 1) {
      onDelete(id);
      return;
    }

    // Delete from backend if the point has an ID
    if (pointToDelete.id) {
      try {
        await storage.deleteDialogEntry(id, pointToDelete.id);
      } catch (error) {
        console.error("Error deleting dialog entry:", error);
        // Continue with local state update even if API call fails
      }
    }

    // Remove the point at the specified index
    const newPoints = [
      ...conversationPoints.slice(0, pointIndex),
      ...conversationPoints.slice(pointIndex + 1),
    ];

    // Adjust selectedPromptIndex if needed
    let newSelectedIndex: number | null = selectedPromptIndex;
    if (selectedPromptIndex === pointIndex) {
      // If deleting the selected entry, select the previous one
      newSelectedIndex = pointIndex > 0 ? pointIndex - 1 : null;
    } else if (selectedPromptIndex !== null && selectedPromptIndex > pointIndex) {
      // If deleting an entry before the selected one, adjust the index
      newSelectedIndex = selectedPromptIndex - 1;
    }

    setConversationPoints(newPoints);
    setSelectedPromptIndex(newSelectedIndex);

    // Update screen data immediately
    if (screenData) {
      onUpdate(id, {
        conversationPoints: newPoints,
        selectedPromptIndex: newSelectedIndex,
      });
    }
  };

  // Handle screen container click
  const handleContainerClick = (e: React.MouseEvent) => {
    // Only handle clicks if not selected, and stop propagation to prevent panning
    if (!isSelected) {
      e.stopPropagation();
      onScreenClick(id);
    }
  };

  // Handle double-click to activate, center, and zoom
  const handleContainerDoubleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Select the screen first if not already selected
    if (!isSelected) {
      onScreenClick(id);
    }
    // Center and zoom to 100%
    onCenterAndZoom(id);
  };

  return (
    <div className="relative flex flex-col items-stretch justify-center px-6 text-slate-900 dark:text-slate-100">
      {/* Title - displayed above screen for both active and inactive */}
      {screenTitle && (
        <div className="mb-2 flex items-center justify-center gap-2">
          <span className="font-bold text-black dark:text-black">{screenTitle}</span>
          <Button
            onClick={(e) => {
              e.stopPropagation();
              setShowClickables(!showClickables);
            }}
            variant="ghost"
            size="icon-sm"
            title={showClickables ? "Hide clickables" : "Show clickables"}
          >
            <TbHandClick
              className={`h-5 w-5 ${showClickables ? "text-blue-500" : "text-gray-400"}`}
            />
          </Button>
        </div>
      )}

      {/* Wrapper for Screen and Input - positioned relative to each other */}
      <div className="relative">
        {/* Prompt Panel - positioned at top-right, outside Screen container - only show when selected */}
        {isSelected && screenData && (
          <PromptPanel
            ref={promptPanelRef}
            conversationPoints={conversationPoints}
            onSend={handleSend}
            isLoading={isLoading}
            selectedPromptIndex={selectedPromptIndex}
            onPromptSelect={handlePromptSelect}
            onDeletePoint={handleDeletePoint}
            onClone={(pointIndex) => onClone(id, pointIndex)}
            screenName={screenTitle}
            screenId={id}
            getHtmlForPoint={(pointIndex) => {
              if (pointIndex >= 0 && pointIndex < conversationPoints.length) {
                return conversationPoints[pointIndex].html || "";
              }
              return "";
            }}
          />
        )}

        {/* Screen Container with Iframe */}
        <div
          ref={containerRef}
          className={`relative inline-block shadow-lg transition-all select-none ${
            isSelected
              ? "border-2 border-blue-500"
              : "border-2 border-transparent hover:border-blue-500"
          }`}
          style={{
            pointerEvents: isSelected ? "auto" : "auto", // Always allow clicks for selection
            cursor: isSelected ? "default" : "pointer",
            userSelect: "none",
            WebkitUserSelect: "none",
            MozUserSelect: "none",
            msUserSelect: "none",
          }}
          onClick={handleContainerClick}
          onDoubleClick={handleContainerDoubleClick}
          onMouseDown={(e) => {
            // Prevent text selection on double-click
            if (e.detail > 1) {
              e.preventDefault();
            }
          }}
        >
          {shouldShowPlaceholder ? (
            <div
              className="flex h-full w-full flex-col items-center justify-center bg-white dark:bg-gray-900"
              style={{
                width: "390px",
                minHeight: "844px",
                height: `${iframeHeight}px`,
              }}
            >
              {showError ? (
                <div className="flex flex-col items-center gap-4 px-4">
                  <div className="flex flex-col items-center gap-2">
                    <p className="text-base font-medium text-red-600 dark:text-red-400">
                      Generation Failed
                    </p>
                    <p className="max-w-[320px] text-center text-sm text-red-500 dark:text-red-300">
                      {currentError}
                    </p>
                  </div>
                  {currentPrompt && (
                    <p className="text-muted-foreground max-w-[320px] text-center text-xs">
                      Prompt: {currentPrompt}
                    </p>
                  )}
                  {errorPointIndex !== null && (
                    <Button
                      onClick={handleRetryFromError}
                      variant="outline"
                      className="mt-2"
                      disabled={isLoading}
                    >
                      <FaMagic className="mr-2 h-4 w-4" />
                      Retry
                    </Button>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4">
                  <FaSpinner className="text-primary h-8 w-8 animate-spin" />
                  <p className="text-primary text-base font-medium">Creating UI</p>
                  {currentPrompt && (
                    <p className="text-muted-foreground max-w-[320px] text-center text-xs">
                      {currentPrompt}
                    </p>
                  )}
                </div>
              )}
            </div>
          ) : htmlContent ? (
            <>
              <iframe
                ref={(el) => {
                  iframeRef.current = el;
                  iframeWindowRef.current = el?.contentWindow || null;
                }}
                title="Generated UI"
                srcDoc={htmlContent}
                className="border-0"
                sandbox="allow-same-origin allow-scripts"
                style={{
                  width: "390px",
                  height: `${iframeHeight}px`,
                  pointerEvents: "none",
                }}
                onLoad={() => {
                  // Update ref when iframe loads
                  if (iframeRef.current) {
                    iframeWindowRef.current = iframeRef.current.contentWindow;
                    // Trigger highlight update after iframe loads
                    setTimeout(updateHighlights, 100);
                  }
                }}
              />
              {/* Highlight Overlay */}
              {showClickables && (
                <div
                  className="pointer-events-none absolute inset-0 z-10"
                  style={{
                    width: "390px",
                    height: `${iframeHeight}px`,
                  }}
                >
                  {highlights.map((highlight) => {
                    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
                      console.log("[Screen] Overlay mousedown", {
                        screenId: id,
                        touchableId: highlight.touchableId,
                        highlightType: highlight.type,
                      });
                      e.stopPropagation();
                      if (onOverlayClick) {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const centerX = rect.left + rect.width / 2;
                        const centerY = rect.top + rect.height / 2;
                        console.log("[Screen] Calling onOverlayClick", {
                          centerX,
                          centerY,
                          screenId: id,
                          touchableId: highlight.touchableId,
                          text: highlight.text,
                        });
                        onOverlayClick(
                          { x: centerX, y: centerY },
                          id,
                          highlight.touchableId,
                          highlight.text,
                        );
                      } else {
                        console.warn("[Screen] onOverlayClick is not defined!");
                      }
                    };

                    return (
                      <div
                        key={highlight.touchableId}
                        className="absolute cursor-crosshair border-2"
                        data-overlay-highlight
                        title={highlight.touchableId}
                        style={{
                          left: `${highlight.x}px`,
                          top: `${highlight.y}px`,
                          width: `${highlight.width}px`,
                          height: `${highlight.height}px`,
                          borderColor: highlight.type === "a" ? "#ff00ff" : "#00ffff", // magenta for links, cyan for buttons
                          backgroundColor:
                            highlight.type === "a"
                              ? "rgba(255, 0, 255, 0.1)"
                              : "rgba(0, 255, 255, 0.1)", // semi-transparent fill
                          boxSizing: "border-box",
                          pointerEvents: "auto",
                        }}
                        onMouseDown={handleMouseDown}
                      />
                    );
                  })}
                </div>
              )}
            </>
          ) : (
            <div
              className="flex h-full w-full items-center justify-center bg-white"
              style={{ minHeight: "844px" }}
            >
              <div className="text-sm text-gray-400">No content</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
