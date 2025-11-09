"use client";

import { useState, useEffect, useRef } from "react";
import { FaSpinner } from "react-icons/fa";
import PromptPanel from "./PromptPanel";
import type { ScreenData, ConversationPoint } from "@/lib/types";

interface ScreenProps {
  id: string;
  isSelected: boolean;
  onScreenClick: (screenId: string) => void;
  onCreate: (screenData: Omit<ScreenData, "id">) => void;
  onUpdate: (screenId: string, updates: Partial<ScreenData>) => void;
  onDelete: (screenId: string) => void;
  screenData: ScreenData | null;
}

export default function Screen({
  id,
  isSelected,
  onScreenClick,
  onCreate,
  onUpdate,
  onDelete,
  screenData,
}: ScreenProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [conversationPoints, setConversationPoints] = useState<ConversationPoint[]>(
    screenData?.conversationPoints || [],
  );
  const [selectedPromptIndex, setSelectedPromptIndex] = useState<number | null>(
    screenData?.selectedPromptIndex ?? null,
  );
  const generationInProgressRef = useRef<string | null>(null);

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
    html, body { width: 100%; height: 100%; overflow: hidden; }
  </style>
</head>
<body>
  ${html}
  <script>
    // Ensure Tailwind processes the content
    (function() {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
          // Tailwind should auto-process, but trigger a reflow to ensure styles apply
          document.body.offsetHeight;
        });
      } else {
        document.body.offsetHeight;
      }
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

  // Sync with external screenData when it changes
  useEffect(() => {
    if (screenData) {
      setConversationPoints(screenData.conversationPoints);
      setSelectedPromptIndex(screenData.selectedPromptIndex);
    }
  }, [screenData]);

  // Auto-start generation if screenData has conversation points but last one doesn't have HTML
  useEffect(() => {
    if (
      screenData &&
      screenData.conversationPoints.length > 0 &&
      !isLoading
    ) {
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
        (p) => p.prompt === promptToSend && !p.html
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
          (p) => p.prompt === promptToSend && !p.html
        );
        if (incompletePointIndex >= 0) {
          const pointsWithoutIncomplete = [
            ...pointsWithIncomplete.slice(0, incompletePointIndex),
            ...pointsWithIncomplete.slice(incompletePointIndex + 1),
          ];
          setConversationPoints(pointsWithoutIncomplete);
          setSelectedPromptIndex(pointsWithoutIncomplete.length > 0 ? pointsWithoutIncomplete.length - 1 : null);

          // Update screen data to remove the incomplete point
          if (screenData) {
            onUpdate(id, {
              conversationPoints: pointsWithoutIncomplete,
              selectedPromptIndex: pointsWithoutIncomplete.length > 0 ? pointsWithoutIncomplete.length - 1 : null,
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

  return (
    <div className="relative flex flex-col items-center justify-center px-6 text-slate-900 dark:text-slate-100">
      {/* Title - displayed above screen for both active and inactive */}
      {screenTitle && (
        <div className="mb-2 text-center">
          <span className="font-bold text-black dark:text-black">{screenTitle}</span>
        </div>
      )}

      {/* Wrapper for Screen and Input - positioned relative to each other */}
      <div className="relative" style={{ width: "390px", height: "844px" }}>
        {/* Prompt Panel - positioned at top-right, outside Screen container - only show when selected */}
        {isSelected && conversationPoints.length > 0 && (
          <PromptPanel
            conversationPoints={conversationPoints}
            onSend={handleSend}
            isLoading={isLoading}
            selectedPromptIndex={selectedPromptIndex}
            onPromptSelect={handlePromptSelect}
            onDeletePoint={handleDeletePoint}
          />
        )}

        {/* Screen Container with Iframe */}
        <div
          className={`relative flex shadow-lg transition-all ${isSelected
            ? "border-2 border-blue-500"
            : "border-2 border-transparent hover:border-blue-500"
            }`}
          style={{
            width: "390px",
            height: "844px",
            pointerEvents: isSelected ? "auto" : "auto", // Always allow clicks for selection
            cursor: isSelected ? "default" : "pointer",
          }}
          onClick={handleContainerClick}
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
            <iframe
              title="Generated UI"
              srcDoc={htmlContent}
              className="h-full w-full border-0"
              sandbox="allow-same-origin allow-scripts"
              style={{ pointerEvents: isSelected ? "auto" : "none" }}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-white">
              <div className="text-sm text-gray-400">No content</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
