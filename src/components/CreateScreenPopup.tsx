"use client";

import { forwardRef, useEffect } from "react";
import { HiOutlineDeviceMobile } from "react-icons/hi";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface CreateScreenPopupProps {
  position: { x: number; y: number };
  onSelect: () => void;
  onDismiss: () => void;
}

const CreateScreenPopup = forwardRef<HTMLDivElement, CreateScreenPopupProps>(
  ({ position, onSelect, onDismiss }, ref) => {
    // Handle click outside to dismiss
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          typeof ref !== "function" &&
          ref?.current &&
          !ref.current.contains(event.target as Node)
        ) {
          onDismiss();
        }
      };

      // Add event listener after a short delay to prevent immediate dismissal
      const timeoutId = setTimeout(() => {
        document.addEventListener("mousedown", handleClickOutside);
      }, 0);

      return () => {
        clearTimeout(timeoutId);
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [onDismiss, ref]);

    return (
      <div
        ref={ref}
        className="fixed z-50"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          transform: "translate(-50%, -50%)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <Card className="flex cursor-default flex-col items-center justify-center gap-2 p-2">
          <div className="text-center text-sm font-medium">Create screen</div>
          <Button
            onClick={onSelect}
            variant="outline"
            className="flex h-20 w-20 flex-col items-center justify-center gap-1 pt-1"
          >
            <HiOutlineDeviceMobile className="h-6 w-6" />
            <span className="text-xs">Mobile app</span>
          </Button>
        </Card>
      </div>
    );
  },
);

CreateScreenPopup.displayName = "CreateScreenPopup";

export default CreateScreenPopup;
