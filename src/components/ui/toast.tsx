"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface Toast {
  id: string;
  message: string;
}

let toastIdCounter = 0;
const toastListeners: Array<(toasts: Toast[]) => void> = [];
let toasts: Toast[] = [];

function addToast(message: string) {
  const id = `toast-${toastIdCounter++}`;
  const newToast: Toast = { id, message };
  toasts = [...toasts, newToast];
  toastListeners.forEach((listener) => listener(toasts));

  // Auto-remove after 3 seconds
  setTimeout(() => {
    toasts = toasts.filter((t) => t.id !== id);
    toastListeners.forEach((listener) => listener(toasts));
  }, 3000);
}

export function toast(message: string) {
  if (typeof window !== "undefined") {
    addToast(message);
  }
}

export function Toaster() {
  const [currentToasts, setCurrentToasts] = useState<Toast[]>(() => {
    // Initialize with current toasts if available
    return typeof window !== "undefined" ? toasts : [];
  });

  useEffect(() => {
    // Subscribe to toast updates
    toastListeners.push(setCurrentToasts);

    return () => {
      const index = toastListeners.indexOf(setCurrentToasts);
      if (index > -1) {
        toastListeners.splice(index, 1);
      }
    };
  }, []);

  // Don't render during SSR - check document directly
  if (typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div className="fixed top-4 left-1/2 z-[10000] -translate-x-1/2 space-y-2">
      {currentToasts.map((toast) => (
        <div
          key={toast.id}
          className="rounded-lg bg-gray-900 px-4 py-3 text-sm text-white shadow-lg transition-all duration-300 dark:bg-gray-800"
          style={{
            animation: "toast-slide-in 0.3s ease-out",
          }}
        >
          {toast.message}
        </div>
      ))}
    </div>,
    document.body,
  );
}

