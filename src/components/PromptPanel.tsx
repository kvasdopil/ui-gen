"use client";

import { useState } from "react";
import { FaEdit, FaMagic } from "react-icons/fa";
import type { ConversationPoint } from "@/lib/types";

interface PromptPanelProps {
  conversationPoints: ConversationPoint[];
  onSend: (modificationPrompt: string) => void;
  isLoading: boolean;
  selectedPromptIndex: number | null;
  onPromptSelect: (pointIndex: number) => void;
}

export default function PromptPanel({
  conversationPoints,
  onSend,
  isLoading,
  selectedPromptIndex,
  onPromptSelect,
}: PromptPanelProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState("");

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

  return (
    <div className="absolute left-full z-10 ml-2 max-h-[844px] w-64 overflow-y-auto">
      <div className="flex flex-col gap-2">
        {/* Display all conversation points (prompts) */}
        {conversationPoints.map((point, index) => (
          <div
            key={index}
            onClick={() => onPromptSelect(index)}
            className={`cursor-pointer rounded-lg border px-3 py-2 text-xs shadow-sm transition-colors ${
              selectedPromptIndex === index
                ? "border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-900/20"
                : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-gray-600 dark:hover:bg-gray-700"
            } dark:text-gray-200`}
          >
            {point.prompt}
          </div>
        ))}

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
