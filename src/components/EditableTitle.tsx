"use client";

import { useState, useRef, useEffect } from "react";

interface EditableTitleProps {
  value: string;
  onSave: (value: string) => Promise<void>;
  placeholder?: string;
  className?: string;
}

export default function EditableTitle({
  value,
  onSave,
  placeholder = "Untitled",
  className = "",
}: EditableTitleProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [localEditValue, setLocalEditValue] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Derive editValue: use local value when editing, otherwise use prop value
  const editValue = isEditing && localEditValue !== null ? localEditValue : value;

  // Focus input when entering edit mode
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleClick = () => {
    if (!isEditing) {
      setLocalEditValue(value);
      setIsEditing(true);
    }
  };

  const handleSave = async () => {
    setIsEditing(false);
    const trimmedValue = editValue.trim();
    if (trimmedValue !== value) {
      await onSave(trimmedValue);
    }
    setLocalEditValue(null);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setLocalEditValue(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSave();
    } else if (e.key === "Escape") {
      e.preventDefault();
      handleCancel();
    }
  };

  const handleBlur = () => {
    handleSave();
  };

  const displayValue = value || placeholder;
  const isEmpty = !value;

  return (
    <>
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={editValue}
          onChange={(e) => setLocalEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          className={`m-0 border-none bg-transparent p-0 outline-none focus:outline-none ${className}`}
          style={{ minWidth: "200px" }}
        />
      ) : (
        <button
          onClick={handleClick}
          className={`m-0 cursor-text p-0 text-left transition-opacity hover:opacity-80 ${className}`}
        >
          <span className={isEmpty ? "text-gray-400 dark:text-gray-500" : ""}>{displayValue}</span>
        </button>
      )}
    </>
  );
}
