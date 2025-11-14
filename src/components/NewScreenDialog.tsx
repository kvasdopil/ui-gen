"use client";

import { forwardRef } from "react";
import { FaMagic, FaSpinner } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

interface NewScreenDialogProps {
  position: { x: number; y: number };
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onDismiss?: () => void;
  disabled?: boolean;
}

const NewScreenDialog = forwardRef<HTMLDivElement, NewScreenDialogProps>(
  ({ position, value, onChange, onSubmit, disabled = false }, ref) => {
    const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        if (value.trim() && !disabled) {
          onSubmit();
        }
      }
    };

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
        <Card className="flex w-80 flex-col gap-3 p-4">
          <Label htmlFor="new-screen-textarea" className="text-sm">
            What you want to create
          </Label>
          <Textarea
            id="new-screen-textarea"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Describe the UI you want..."
            rows={6}
            className="text-sm"
            autoFocus
            disabled={disabled}
          />
          <Button
            onClick={onSubmit}
            disabled={disabled || !value.trim()}
            className="flex items-center justify-center gap-2 text-sm"
          >
            {disabled ? <FaSpinner className="animate-spin" /> : <FaMagic />}
            <span>Create</span>
          </Button>
        </Card>
      </div>
    );
  },
);

NewScreenDialog.displayName = "NewScreenDialog";

export default NewScreenDialog;
