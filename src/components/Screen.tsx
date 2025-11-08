"use client";

import { useState } from "react";
import { FaSpinner, FaMagic } from "react-icons/fa";
import PromptPanel from "./PromptPanel";

type HistoryItem = {
  type: "user" | "assistant";
  content: string;
};

export default function Screen() {
  const [input, setInput] = useState("");
  const [htmlContent, setHtmlContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  const handleSend = async (modificationPrompt?: string) => {
    const promptToSend = modificationPrompt || input;
    if (!promptToSend.trim()) return;

    // Add user prompt to history immediately
    const newHistory = [...history, { type: "user" as const, content: promptToSend }];
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
      const fullHtml = `<!DOCTYPE html>
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
  ${data.html}
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

      setHtmlContent(fullHtml);

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

  return (
    <div className="relative flex min-h-screen flex-1 items-center justify-center bg-gradient-to-br from-sky-50 via-white to-slate-100 px-6 text-slate-900 dark:from-slate-900 dark:via-slate-950 dark:to-neutral-900 dark:text-slate-100">
      {/* Wrapper for Screen and Input - positioned relative to each other */}
      <div className="relative" style={{ width: "390px", height: "844px" }}>
        {/* Prompt Panel - positioned at top-right, outside Screen container */}
        {history.length > 0 && (
          <PromptPanel history={history} onSend={handleSend} isLoading={isLoading} />
        )}

        {/* Screen Container with Iframe */}
        <div
          className="border-border relative flex border shadow-lg"
          style={{
            width: "390px",
            height: "844px",
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
            <iframe
              title="Generated UI"
              srcDoc={htmlContent}
              className="h-full w-full border-0"
              sandbox="allow-same-origin allow-scripts"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-4 bg-white p-6">
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
