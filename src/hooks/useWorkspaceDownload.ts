import { useCallback } from "react";
import JSZip from "jszip";
import type { ScreenData } from "@/lib/types";
import { toKebabCase, wrapHtmlWithTailwindAndRemoveLinks } from "@/lib/workspace-utils";

interface UseWorkspaceDownloadProps {
  screens: ScreenData[];
  workspaceName: string;
}

export function useWorkspaceDownload({ screens, workspaceName }: UseWorkspaceDownloadProps) {
  // Handle workspace download
  const handleDownload = useCallback(async () => {
    if (screens.length === 0) {
      console.warn("No screens to download");
      return;
    }

    try {
      const zip = new JSZip();
      const usedFileNames = new Set<string>();

      // Process each screen
      for (const screen of screens) {
        // Get the selected conversation point or the last one
        const conversationPointIndex =
          screen.selectedPromptIndex !== null
            ? screen.selectedPromptIndex
            : screen.conversationPoints.length > 0
              ? screen.conversationPoints.length - 1
              : null;

        if (conversationPointIndex === null || conversationPointIndex >= screen.conversationPoints.length) {
          continue; // Skip screens without conversation points
        }

        const conversationPoint = screen.conversationPoints[conversationPointIndex];
        if (!conversationPoint.html) {
          continue; // Skip screens without HTML content
        }

        // Get screen name from title or use a default
        const screenName = conversationPoint.title || "untitled-screen";
        const baseFileName = toKebabCase(screenName);
        let fileName = `${baseFileName}.html`;
        let counter = 1;

        // Ensure unique filename
        while (usedFileNames.has(fileName)) {
          fileName = `${baseFileName}-${counter}.html`;
          counter++;
        }
        usedFileNames.add(fileName);

        // Wrap HTML with Tailwind and remove links
        const wrappedHtml = wrapHtmlWithTailwindAndRemoveLinks(conversationPoint.html);

        // Add to zip
        zip.file(fileName, wrappedHtml);
      }

      // Generate zip file
      const zipBlob = await zip.generateAsync({ type: "blob" });

      // Create download link
      const url = URL.createObjectURL(zipBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${toKebabCase(workspaceName || "workspace")}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading workspace:", error);
    }
  }, [screens, workspaceName]);

  return {
    handleDownload,
  };
}

