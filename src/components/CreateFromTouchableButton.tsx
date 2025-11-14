"use client";

import { FaSpinner } from "react-icons/fa";

interface CreateFromTouchableButtonProps {
  position: { x: number; y: number }; // Content coordinates
  onClick: () => void;
  disabled?: boolean;
}

export default function CreateFromTouchableButton({
  position,
  onClick,
  disabled = false,
}: CreateFromTouchableButtonProps) {
  return (
    <button
      onMouseDown={(e) => {
        e.stopPropagation();
      }}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      disabled={disabled}
      className="absolute z-50 flex h-10 w-10 items-center justify-center rounded-full border-2 border-gray-400 bg-white shadow-md transition-all hover:border-blue-500 hover:bg-blue-50 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-gray-400 disabled:hover:bg-white"
      style={{
        left: `${position.x - 20}px`,
        top: `${position.y - 20}px`,
        transform: "translate(0, 0)",
      }}
      aria-label="Create new screen"
    >
      {disabled ? (
        <FaSpinner className="h-5 w-5 animate-spin text-gray-600" />
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 text-gray-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
      )}
    </button>
  );
}
