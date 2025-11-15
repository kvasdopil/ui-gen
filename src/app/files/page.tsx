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
      <div className="flex min-h-screen items-center justify-center">
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
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <h1 className="mb-8 text-3xl font-bold">Workspaces</h1>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {/* Create Workspace Card */}
          <div
            className="flex min-h-[200px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-white p-4 transition-colors hover:border-gray-400 dark:border-slate-600 dark:bg-slate-800 dark:hover:border-slate-500"
            onClick={handleCreateWorkspace}
          >
            {isCreating ? (
              <div className="text-gray-500 dark:text-gray-400">Creating...</div>
            ) : (
              <div className="flex flex-col items-center justify-center">
                <FaPlus className="mb-2 text-4xl text-gray-400 dark:text-gray-500" />
                <span className="text-sm text-gray-500 dark:text-gray-400">Create Workspace</span>
              </div>
            )}
          </div>

          {/* Workspace Cards */}
          {workspaces.map((workspace) => (
            <div
              key={workspace.id}
              className={`relative flex cursor-pointer flex-col rounded-lg border p-4 transition-all hover:shadow-md ${
                hoveredDeleteId === workspace.id
                  ? "border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-950/30"
                  : "border-gray-200 bg-white dark:border-slate-700 dark:bg-slate-800"
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
                  className="absolute top-2 right-2 z-10 rounded-md p-1.5 text-gray-400 transition-colors hover:text-red-500 dark:text-gray-500 dark:hover:text-red-500"
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
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-400 border-t-transparent" />
                  ) : (
                    <MdDeleteOutline className="h-4 w-4" />
                  )}
                </button>
              )}

              <div className="flex-1">
                <h2 className="mb-2 pr-8 text-lg font-semibold">
                  {workspace.name || "Untitled workspace"}
                </h2>
                <div className="space-y-1 text-sm text-gray-500 dark:text-gray-400">
                  <div>
                    {workspace.screenCount} screen{workspace.screenCount !== 1 ? "s" : ""}
                  </div>
                  <div>Created {formatDate(workspace.createdAt)}</div>
                  {workspace.isDefault && (
                    <span className="inline-block rounded bg-blue-100 px-2 py-0.5 text-xs text-blue-800 dark:bg-blue-900 dark:text-blue-200">
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
