"use client";

import { useRouter } from "next/navigation";
import { FaArrowLeft } from "react-icons/fa";
import EditableTitle from "@/components/EditableTitle";

interface WorkspaceHeaderProps {
  workspaceName: string;
  onNameUpdate: (name: string) => Promise<void>;
}

export default function WorkspaceHeader({ workspaceName, onNameUpdate }: WorkspaceHeaderProps) {
  const router = useRouter();

  return (
    <div
      className="fixed top-4 left-4 z-[9999] flex items-center gap-3 rounded-md bg-white p-1 dark:bg-slate-900"
      onMouseDown={(e) => e.stopPropagation()}
      onMouseMove={(e) => e.stopPropagation()}
      onMouseUp={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Files icon */}
      <button
        onClick={() => router.push("/files")}
        className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-md transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
        aria-label="Back to files"
        onMouseDown={(e) => e.stopPropagation()}
        onMouseMove={(e) => e.stopPropagation()}
        onMouseUp={(e) => e.stopPropagation()}
      >
        <FaArrowLeft className="h-5 w-5 text-gray-700 dark:text-gray-300" />
      </button>

      {/* Workspace name */}
      <div
        onMouseDown={(e) => e.stopPropagation()}
        onMouseMove={(e) => e.stopPropagation()}
        onMouseUp={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        <EditableTitle
          value={workspaceName}
          onSave={onNameUpdate}
          placeholder="Untitled workspace"
          className="text-2xl font-bold"
        />
      </div>
    </div>
  );
}
