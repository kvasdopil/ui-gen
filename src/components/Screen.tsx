"use client";

import { useState, useEffect } from "react";
import { FaSpinner, FaMagic } from "react-icons/fa";
import PromptPanel from "./PromptPanel";

type HistoryItem = {
  type: "user" | "assistant";
  content: string;
};

type ScreenData = {
  id: string;
  htmlContent: string;
  history: HistoryItem[];
  selectedPromptIndex: number | null;
};

interface ScreenProps {
  id: string;
  isSelected: boolean;
  onScreenClick: (screenId: string) => void;
  onCreate: (screenData: Omit<ScreenData, "id">) => void;
  onUpdate: (screenId: string, updates: Partial<ScreenData>) => void;
  screenData: ScreenData | null;
}

export default function Screen({
  id,
  isSelected,
  onScreenClick,
  onCreate,
  onUpdate,
  screenData,
}: ScreenProps) {
  const [input, setInput] = useState("");
  const [htmlContent, setHtmlContent] = useState(screenData?.htmlContent || "");
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>(screenData?.history || []);
  const [selectedPromptIndex, setSelectedPromptIndex] = useState<number | null>(
    screenData?.selectedPromptIndex ?? null,
  );

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

  const screenTitle = extractTitle(htmlContent);

  // Sync with external screenData when it changes
  useEffect(() => {
    if (screenData) {
      setHtmlContent(screenData.htmlContent);
      setHistory(screenData.history);
      setSelectedPromptIndex(screenData.selectedPromptIndex);
    }
  }, [screenData]);

  // Auto-start generation if screenData has history but no htmlContent
  useEffect(() => {
    if (screenData && screenData.history.length > 0 && !screenData.htmlContent && !isLoading) {
      // Find the first user prompt that doesn't have a corresponding assistant response
      const lastItem = screenData.history[screenData.history.length - 1];
      if (lastItem.type === "user") {
        // Start generation with this prompt
        handleSend(lastItem.content);
      }
    }
  }, [screenData, isLoading]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSend = async (modificationPrompt?: string) => {
    const promptToSend = modificationPrompt || input;
    if (!promptToSend.trim()) return;

    // Check if this prompt is already the last item in history
    const lastHistoryItem = history[history.length - 1];
    const isAlreadyInHistory =
      lastHistoryItem?.type === "user" && lastHistoryItem.content === promptToSend;

    // Add user prompt to history immediately (only if not already there)
    const newHistory = isAlreadyInHistory
      ? history
      : [...history, { type: "user" as const, content: promptToSend }];
    setHistory(newHistory);

    setIsLoading(true);
    try {
      const response = await fetch("/api/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ history: newHistory }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate UI");
      }

      const data = await response.json();

      // Add assistant response to history
      const updatedHistory = [...newHistory, { type: "assistant" as const, content: data.html }];
      setHistory(updatedHistory);

      // Wrap the generated HTML with Tailwind CDN and Font Awesome
      // Load Tailwind script and Font Awesome CSS and ensure they process the content
      const fullHtml = wrapHtmlWithTailwind(data.html);
      setHtmlContent(fullHtml);

      // Select the newly created prompt
      const newSelectedPromptIndex = newHistory.length - 1;
      setSelectedPromptIndex(newSelectedPromptIndex);

      // Update or create screen data
      if (screenData) {
        // Update existing screen
        onUpdate(id, {
          htmlContent: fullHtml,
          history: updatedHistory,
          selectedPromptIndex: newSelectedPromptIndex,
        });
      } else {
        // Create new screen
        onCreate({
          htmlContent: fullHtml,
          history: updatedHistory,
          selectedPromptIndex: newSelectedPromptIndex,
        });
      }

      // Clear input if it was the initial prompt
      if (!modificationPrompt) {
        setInput("");
      }
    } catch (error) {
      console.error("Error generating UI:", error);
    } finally {
      setIsLoading(false);
    }
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

  // Handle prompt selection - find and display the corresponding assistant response
  const handlePromptSelect = (historyIndex: number) => {
    setSelectedPromptIndex(historyIndex);

    // Find the assistant response that comes after this user prompt
    // The assistant response should be at historyIndex + 1
    const assistantIndex = historyIndex + 1;
    if (assistantIndex < history.length && history[assistantIndex].type === "assistant") {
      const assistantContent = history[assistantIndex].content;
      const fullHtml = wrapHtmlWithTailwind(assistantContent);
      setHtmlContent(fullHtml);

      // Update screen data
      if (screenData) {
        onUpdate(id, {
          htmlContent: fullHtml,
          selectedPromptIndex: historyIndex,
        });
      }
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
        {isSelected && history.length > 0 && (
          <PromptPanel
            history={history}
            onSend={handleSend}
            isLoading={isLoading}
            selectedPromptIndex={selectedPromptIndex}
            onPromptSelect={handlePromptSelect}
          />
        )}

        {/* Screen Container with Iframe */}
        <div
          className="border-border relative flex shadow-lg transition-all"
          style={{
            width: "390px",
            height: "844px",
            border: isSelected ? "2px solid #3b82f6" : "1px solid hsl(var(--border))",
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
            <div
              className="flex h-full w-full flex-col items-center justify-center gap-4 bg-white p-6"
              style={{ pointerEvents: "auto" }}
            >
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Describe the UI you want..."
                rows={6}
                className="w-full resize-none rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                disabled={isLoading}
              />
              <button
                onClick={() => handleSend()}
                disabled={isLoading || !input.trim()}
                className="flex items-center gap-2 rounded-lg bg-blue-500 px-4 py-2 text-white shadow-lg transition-colors hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <FaMagic />
                <span>Create</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
