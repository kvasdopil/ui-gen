"use client";

import { useState } from "react";
import { FaEdit, FaMagic } from "react-icons/fa";
import { MdDeleteOutline } from "react-icons/md";
import type { ConversationPoint } from "@/lib/types";

interface PromptPanelProps {
  conversationPoints: ConversationPoint[];
  onSend: (modificationPrompt: string) => void;
  isLoading: boolean;
  selectedPromptIndex: number | null;
  onPromptSelect: (pointIndex: number) => void;
  onDeletePoint: (pointIndex: number) => void;
}

export default function PromptPanel({
  conversationPoints,
  onSend,
  isLoading,
  selectedPromptIndex,
  onPromptSelect,
  onDeletePoint,
}: PromptPanelProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState("");
  const [confirmDeleteIndex, setConfirmDeleteIndex] = useState<number | null>(null);

  const handleModify = () => {
    setIsEditing(true);
    setEditValue("");
  };

  const handleCreate = () => {
    if (!editValue.trim()) return;
    onSend(editValue);
    setIsEditing(false);
    setEditValue("");
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleCreate();
    }
  };

  const handleBlur = () => {
    // If the field is empty (after trimming), cancel the modify flow
    if (!editValue.trim()) {
      setIsEditing(false);
      setEditValue("");
    }
  };

  const handleDeleteClick = (e: React.MouseEvent, index: number) => {
    e.stopPropagation(); // Prevent triggering the entry click
    setConfirmDeleteIndex(index);
  };

  const handleConfirmDelete = () => {
    if (confirmDeleteIndex !== null) {
      onDeletePoint(confirmDeleteIndex);
      setConfirmDeleteIndex(null);
    }
  };

  const handleCancelDelete = () => {
    setConfirmDeleteIndex(null);
  };

  return (
    <div className="absolute left-full z-10 ml-2 max-h-[844px] w-64 overflow-x-visible overflow-y-auto">
      <div className="flex flex-col gap-2">
        {/* Display all conversation points (prompts) */}
        {conversationPoints.map((point, index) => {
          const isLastEntry = index === conversationPoints.length - 1;
          return (
            <div key={index} className="group flex items-center gap-2">
              <div
                onClick={() => onPromptSelect(index)}
                className={`flex-1 cursor-pointer rounded-lg border px-3 py-2 text-xs shadow-sm transition-colors ${
                  selectedPromptIndex === index
                    ? "border-blue-500 bg-blue-50 peer-hover:border-red-300 peer-hover:bg-red-50 dark:border-blue-400 dark:bg-blue-900/20 dark:peer-hover:border-red-400 dark:peer-hover:bg-red-900/20"
                    : "border-gray-200 bg-white peer-hover:border-red-300 peer-hover:bg-red-50 hover:border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:peer-hover:border-red-400 dark:peer-hover:bg-red-900/20 dark:hover:border-gray-600 dark:hover:bg-gray-700"
                } dark:text-gray-200`}
              >
                {point.prompt}
              </div>
              {/* Delete icon area - always reserve space for consistent width */}
              <div className="flex w-5 flex-shrink-0 items-center justify-center">
                {isLastEntry && (
                  <button
                    onClick={(e) => handleDeleteClick(e, index)}
                    className="peer relative flex items-center justify-center text-gray-600 opacity-0 transition-colors transition-opacity group-hover:opacity-100 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-500"
                  >
                    <MdDeleteOutline className="text-base" />
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {/* Confirmation popup */}
        {confirmDeleteIndex !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20">
            <div className="rounded-lg border border-gray-300 bg-white p-4 shadow-xl dark:border-gray-600 dark:bg-gray-800">
              <p className="mb-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                Are you sure?
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleConfirmDelete}
                  className="flex-1 rounded-lg bg-red-500 px-3 py-2 text-xs text-white transition-colors hover:bg-red-600"
                >
                  Delete
                </button>
                <button
                  onClick={handleCancelDelete}
                  className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modify button or edit form */}
        {isEditing ? (
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
              What you would like to change
            </label>
            <textarea
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={handleKeyPress}
              onBlur={handleBlur}
              placeholder="Describe the modification..."
              rows={4}
              className="w-full resize-none rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs shadow-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              disabled={isLoading}
            />
            <button
              onClick={handleCreate}
              disabled={isLoading || !editValue.trim()}
              className="flex items-center justify-center gap-2 rounded-lg bg-blue-500 px-3 py-2 text-xs text-white shadow-lg transition-colors hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <FaMagic />
              <span>Create</span>
            </button>
          </div>
        ) : (
          <button
            onClick={handleModify}
            disabled={isLoading}
            className="flex items-center gap-2 self-start rounded-lg px-2 py-1 text-xs text-gray-600 transition-colors hover:text-blue-500 disabled:cursor-not-allowed disabled:opacity-50 dark:text-gray-400 dark:hover:text-blue-400"
          >
            <FaEdit className="text-xs" />
            <span>Modify</span>
          </button>
        )}
      </div>
    </div>
  );
}
