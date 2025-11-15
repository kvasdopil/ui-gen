"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import moment from "moment";
import { FaPlus } from "react-icons/fa";
import { MdDeleteOutline } from "react-icons/md";
import DeleteConfirmationDialog from "@/components/DeleteConfirmationDialog";
import UserAvatar from "@/components/UserAvatar";

interface Workspace {
  id: string;
  name: string;
  createdAt: string;
  screenCount: number;
  isDefault: boolean;
}

export default function FilesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [hoveredDeleteId, setHoveredDeleteId] = useState<string | null>(null);
  const [hoveredWorkspaceId, setHoveredWorkspaceId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Set page title
  useEffect(() => {
    document.title = "Workspaces - UI Generator";
  }, []);

  const loadWorkspaces = useCallback(async () => {
    try {
      const response = await fetch("/api/workspaces");
      if (!response.ok) {
        if (response.status === 401) {
          router.push("/");
          return;
        }
        throw new Error("Failed to load workspaces");
      }
      const data = await response.json();
      setWorkspaces(data);
    } catch (error) {
      console.error("Error loading workspaces:", error);
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/");
      return;
    }
    loadWorkspaces();
  }, [session, status, router, loadWorkspaces]);

  const handleCreateWorkspace = async () => {
    if (isCreating) return;
    setIsCreating(true);
    try {
      const response = await fetch("/api/workspaces", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) {
        throw new Error("Failed to create workspace");
      }
      const newWorkspace = await response.json();
      // Navigate to the new workspace
      router.push(`/ws/${newWorkspace.id}`);
    } catch (error) {
      console.error("Error creating workspace:", error);
      setIsCreating(false);
    }
  };

  const handleDeleteClick = (workspaceId: string) => {
    setConfirmDeleteId(workspaceId);
  };

  const handleCancelDelete = () => {
    setConfirmDeleteId(null);
  };

  const handleConfirmDelete = async () => {
    if (!confirmDeleteId) return;
    const workspaceId = confirmDeleteId;
    setConfirmDeleteId(null);
    setDeletingId(workspaceId);
    try {
      const response = await fetch(`/api/workspaces/${workspaceId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete workspace");
      }
      // Reload workspaces
      await loadWorkspaces();
    } catch (error) {
      console.error("Error deleting workspace:", error);
    } finally {
      setDeletingId(null);
    }
  };

  const handleWorkspaceClick = (workspaceId: string) => {
    router.push(`/ws/${workspaceId}`);
  };

  const formatDate = (createdAt: string) => {
    const created = moment(createdAt);
    const now = moment();
    const diffMonths = now.diff(created, "months", true);
    
    if (diffMonths < 1) {
      return created.fromNow();
    }
    return created.format("MMM D, YYYY");
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-950 dark:to-neutral-900">
      <UserAvatar />
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <h1 className="text-3xl font-bold mb-8">Workspaces</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {/* Create Workspace Card */}
          <div
            className="bg-white dark:bg-slate-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-slate-600 p-4 hover:border-gray-400 dark:hover:border-slate-500 transition-colors cursor-pointer flex flex-col items-center justify-center min-h-[200px]"
            onClick={handleCreateWorkspace}
          >
            {isCreating ? (
              <div className="text-gray-500 dark:text-gray-400">Creating...</div>
            ) : (
              <div className="flex flex-col items-center justify-center">
                <FaPlus className="text-4xl text-gray-400 dark:text-gray-500 mb-2" />
                <span className="text-sm text-gray-500 dark:text-gray-400">Create Workspace</span>
              </div>
            )}
          </div>

          {/* Workspace Cards */}
          {workspaces.map((workspace) => (
            <div
              key={workspace.id}
              className={`relative rounded-lg border p-4 hover:shadow-md transition-all cursor-pointer flex flex-col ${
                hoveredDeleteId === workspace.id
                  ? "bg-red-50 dark:bg-red-950/30 border-red-300 dark:border-red-800"
                  : "bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700"
              }`}
              onClick={() => handleWorkspaceClick(workspace.id)}
              onMouseEnter={() => setHoveredWorkspaceId(workspace.id)}
              onMouseLeave={() => {
                setHoveredWorkspaceId(null);
                setHoveredDeleteId(null);
              }}
            >
              {/* Delete icon in top-right corner - only visible when workspace is hovered */}
              {hoveredWorkspaceId === workspace.id && (
                <button
                  className="absolute top-2 right-2 p-1.5 rounded-md text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-500 transition-colors z-10"
                  onMouseEnter={() => setHoveredDeleteId(workspace.id)}
                  onMouseLeave={() => setHoveredDeleteId(null)}
                  disabled={deletingId === workspace.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteClick(workspace.id);
                  }}
                  aria-label="Delete workspace"
                >
                  {deletingId === workspace.id ? (
                    <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <MdDeleteOutline className="w-4 h-4" />
                  )}
                </button>
              )}

              <div className="flex-1">
                <h2 className="text-lg font-semibold mb-2 pr-8">
                  {workspace.name || "Untitled workspace"}
                </h2>
                <div className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
                  <div>{workspace.screenCount} screen{workspace.screenCount !== 1 ? "s" : ""}</div>
                  <div>Created {formatDate(workspace.createdAt)}</div>
                  {workspace.isDefault && (
                    <span className="inline-block px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-xs">
                      Default
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Confirmation dialog */}
        <DeleteConfirmationDialog
          open={confirmDeleteId !== null}
          onOpenChange={(open) => !open && handleCancelDelete()}
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
          description="This action cannot be undone. This will permanently delete this workspace and all its screens."
        />
      </div>
    </div>
  );
}

