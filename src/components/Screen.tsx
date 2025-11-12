"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { FaSpinner } from "react-icons/fa";
import { TbHandClick } from "react-icons/tb";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import PromptPanel from "./PromptPanel";
import type { ScreenData, ConversationPoint } from "@/lib/types";
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
    overlayIndex: number,
  ) => void;
  screenData: ScreenData | null;
  onCenterAndZoom: (screenId: string) => void;
}

export default function Screen({
  id,
  isSelected,
  onScreenClick,
  onCreate,
  onUpdate,
  onDelete,
  onClone,
  onOverlayClick,
  screenData,
  onCenterAndZoom,
}: ScreenProps) {
  const [isLoading, setIsLoading] = useState(false);
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
    Array<{ type: "a" | "button"; x: number; y: number; width: number; height: number }>
  >([]);
  const [showClickables, setShowClickables] = useState(false);

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
        // Position relative to container = position in iframe + iframe offset in container
        newHighlights.push({
          type: "a",
          x: pos.x + iframeOffsetX,
          y: pos.y + iframeOffsetY,
          width: rect.width,
          height: rect.height,
        });
      });

      // Find all <button> elements
      const buttons = iframeDoc.querySelectorAll("button");
      buttons.forEach((button) => {
        const pos = getElementPositionInIframe(button);
        const rect = button.getBoundingClientRect();
        // Position relative to container = position in iframe + iframe offset in container
        newHighlights.push({
          type: "button",
          x: pos.x + iframeOffsetX,
          y: pos.y + iframeOffsetY,
          width: rect.width,
          height: rect.height,
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
  }, [screenData, isLoading]); // eslint-disable-line react-hooks/exhaustive-deps

  // Convert conversation points to history format for API
  // Only include points that have HTML (completed generations)
  const conversationPointsToHistory = (points: ConversationPoint[]) => {
    const history: Array<{ type: "user" | "assistant"; content: string }> = [];
    for (const point of points) {
      // Only include completed conversation points (those with HTML)
      if (point.html) {
        history.push({ type: "user", content: point.prompt });
        history.push({ type: "assistant", content: point.html });
      }
    }
    return history;
  };

  const handleSend = async (modificationPrompt: string, existingTimestamp?: number) => {
    if (!modificationPrompt.trim()) return;
    const promptToSend = modificationPrompt;

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
      // Convert existing conversation points to history format for API
      // Only include completed points (those with HTML) - this automatically excludes the incomplete point
      // Use pointsWithIncomplete to ensure we have the latest data
      const historyForApi = conversationPointsToHistory(pointsWithIncomplete);

      // Add the new user prompt to the history for the API
      historyForApi.push({ type: "user", content: promptToSend });

      const response = await fetch("/api/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ history: historyForApi }),
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
        throw new Error("Failed to generate UI");
      }

      const data = await response.json();

      // Extract title from HTML
      const title = extractTitle(data.html);

      // Create the completed conversation point with HTML and title
      // Preserve the original timestamp from the incomplete point
      const completedPoint: ConversationPoint = {
        prompt: promptToSend,
        html: data.html,
        title,
        timestamp: timestampToUse,
      };

      // Replace the incomplete point with the completed one
      // Find the incomplete point index - it should be at incompleteIndex
      const finalPoints = [
        ...pointsWithIncomplete.slice(0, incompleteIndex),
        completedPoint,
        ...pointsWithIncomplete.slice(incompleteIndex + 1),
      ];

      setConversationPoints(finalPoints);

      // Reset generation tracking since we've completed
      generationInProgressRef.current = null;

      // Select the newly created prompt
      const newSelectedPromptIndex = finalPoints.length - 1;
      setSelectedPromptIndex(newSelectedPromptIndex);

      // Update or create screen data
      if (screenData) {
        // Update existing screen
        onUpdate(id, {
          conversationPoints: finalPoints,
          selectedPromptIndex: newSelectedPromptIndex,
        });
      } else {
        // Create new screen
        onCreate({
          conversationPoints: finalPoints,
          selectedPromptIndex: newSelectedPromptIndex,
        });
      }
    } catch (error) {
      console.error("Error generating UI:", error);
      // Remove the incomplete point we added earlier since generation failed
      // Only remove if we created it (not if it was already there from auto-gen)
      if (!existingTimestamp) {
        // Find the incomplete point we might have added
        const incompletePointIndex = pointsWithIncomplete.findIndex(
          (p) => p.prompt === promptToSend && !p.html,
        );
        if (incompletePointIndex >= 0) {
          const pointsWithoutIncomplete = [
            ...pointsWithIncomplete.slice(0, incompletePointIndex),
            ...pointsWithIncomplete.slice(incompletePointIndex + 1),
          ];
          setConversationPoints(pointsWithoutIncomplete);
          setSelectedPromptIndex(
            pointsWithoutIncomplete.length > 0 ? pointsWithoutIncomplete.length - 1 : null,
          );

          // Update screen data to remove the incomplete point
          if (screenData) {
            onUpdate(id, {
              conversationPoints: pointsWithoutIncomplete,
              selectedPromptIndex:
                pointsWithoutIncomplete.length > 0 ? pointsWithoutIncomplete.length - 1 : null,
            });
          }
        }
      }

      // Reset generation tracking on error so it can be retried
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
  const handleDeletePoint = (pointIndex: number) => {
    if (pointIndex < 0 || pointIndex >= conversationPoints.length) return;

    // If it's the last remaining point, delete the entire screen
    if (conversationPoints.length === 1) {
      onDelete(id);
      return;
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
        {isSelected && conversationPoints.length > 0 && (
          <PromptPanel
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
          className={`relative inline-block shadow-lg transition-all select-none ${isSelected
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
          {/* Loading Spinner Overlay - only covers Screen component */}
          {isLoading && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
              <div className="flex flex-col items-center gap-4 rounded-lg bg-white px-8 py-6 shadow-xl dark:bg-gray-800">
                <FaSpinner className="h-8 w-8 animate-spin text-blue-500" />
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Generating UI...
                </p>
              </div>
            </div>
          )}
          {htmlContent ? (
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
                  {highlights.map((highlight, index) => {
                    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
                      e.stopPropagation();
                      if (onOverlayClick) {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const centerX = rect.left + rect.width / 2;
                        const centerY = rect.top + rect.height / 2;
                        onOverlayClick({ x: centerX, y: centerY }, id, index);
                      }
                    };

                    return (
                      <div
                        key={index}
                        className="absolute cursor-crosshair border-2"
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
                          pointerEvents: "none",
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
