"use client";

import { useRouter } from "next/navigation";
import { FaArrowLeft } from "react-icons/fa";
import EditableTitle from "@/components/EditableTitle";

interface WorkspaceHeaderProps {
  workspaceName: string;
  onNameUpdate: (name: string) => Promise<void>;
}

export default function WorkspaceHeader({
  workspaceName,
  onNameUpdate,
}: WorkspaceHeaderProps) {
  const router = useRouter();

  return (
    <div
      className="fixed top-4 left-4 z-[9999] flex items-center gap-3 p-1 bg-white dark:bg-slate-900 rounded-md"
      onMouseDown={(e) => e.stopPropagation()}
      onMouseMove={(e) => e.stopPropagation()}
      onMouseUp={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Files icon */}
      <button
        onClick={() => router.push("/files")}
        className="flex items-center justify-center w-10 h-10 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
        aria-label="Back to files"
        onMouseDown={(e) => e.stopPropagation()}
        onMouseMove={(e) => e.stopPropagation()}
        onMouseUp={(e) => e.stopPropagation()}
      >
        <FaArrowLeft className="text-gray-700 dark:text-gray-300 h-5 w-5" />
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

