import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export function useWorkspace(workspaceId: string) {
  const router = useRouter();
  const [workspaceName, setWorkspaceName] = useState<string>("");
  const [isLoadingWorkspace, setIsLoadingWorkspace] = useState(true);

  // Load workspace info
  useEffect(() => {
    const loadWorkspace = async () => {
      try {
        const response = await fetch(`/api/workspaces/${workspaceId}`);
        if (!response.ok) {
          if (response.status === 404) {
            router.push("/files");
            return;
          }
          throw new Error("Failed to load workspace");
        }
        const workspace = await response.json();
        setWorkspaceName(workspace.name || "");
      } catch (error) {
        console.error("Error loading workspace:", error);
        router.push("/files");
      } finally {
        setIsLoadingWorkspace(false);
      }
    };
    if (workspaceId) {
      loadWorkspace();
    }
  }, [workspaceId, router]);

  // Update page title when workspace name changes
  useEffect(() => {
    const displayName = workspaceName || "Untitled workspace";
    document.title = `${displayName} - UI Generator`;
  }, [workspaceName]);

  const handleWorkspaceNameUpdate = async (name: string) => {
    try {
      const response = await fetch(`/api/workspaces/${workspaceId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!response.ok) {
        throw new Error("Failed to update workspace name");
      }
      const updated = await response.json();
      setWorkspaceName(updated.name || "");
    } catch (error) {
      console.error("Error updating workspace name:", error);
    }
  };

  return {
    workspaceName,
    isLoadingWorkspace,
    handleWorkspaceNameUpdate,
  };
}

