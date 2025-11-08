"use client";

import { useState } from "react";
import { FaSpinner } from "react-icons/fa";
import PromptPanel from "./PromptPanel";

export default function Screen() {
  const [input, setInput] = useState("");
  const [htmlContent, setHtmlContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: input }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate UI");
      }

      const data = await response.json();

      // Wrap the generated HTML with Tailwind CDN
      // Load Tailwind script and ensure it processes the content
      const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Generated UI</title>
  <script src="https://cdn.tailwindcss.com"></script>
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
        <PromptPanel
          value={input}
          onChange={setInput}
          onSend={handleSend}
          isLoading={isLoading}
        />

        {/* Screen Container with Iframe */}
        <div
          className="flex border border-border shadow-lg relative"
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
            <div className="flex h-full w-full items-center justify-center bg-white text-gray-400">
              <p className="text-center">Enter a prompt above to generate a UI</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

