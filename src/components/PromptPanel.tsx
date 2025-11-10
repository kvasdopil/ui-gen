"use client";

import { useState } from "react";
import { FaEdit, FaMagic } from "react-icons/fa";
import { MdDeleteOutline } from "react-icons/md";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
              <Card
                onClick={() => onPromptSelect(index)}
                className={`flex-1 cursor-pointer px-3 py-2 text-xs transition-colors ${
                  selectedPromptIndex === index
                    ? "border-primary bg-primary/10 peer-hover:border-destructive peer-hover:bg-destructive/10"
                    : "hover:border-primary/50 hover:bg-accent/50 peer-hover:border-destructive peer-hover:bg-destructive/10"
                }`}
              >
                {point.prompt}
              </Card>
              {/* Delete icon area - always reserve space for consistent width */}
              <div className="flex w-5 flex-shrink-0 items-center justify-center">
                {isLastEntry && (
                  <Button
                    onClick={(e) => handleDeleteClick(e, index)}
                    variant="ghost"
                    size="icon-sm"
                    className="peer relative opacity-0 transition-opacity group-hover:opacity-100 hover:text-destructive"
                  >
                    <MdDeleteOutline className="text-base" />
                  </Button>
                )}
              </div>
            </div>
          );
        })}

        {/* Confirmation popup */}
        <Dialog open={confirmDeleteIndex !== null} onOpenChange={(open) => !open && handleCancelDelete()}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Are you sure?</DialogTitle>
              <DialogDescription>
                This action cannot be undone. This will permanently delete this conversation point.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={handleCancelDelete}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleConfirmDelete}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modify button or edit form */}
        {isEditing ? (
          <div className="flex flex-col gap-2">
            <Label htmlFor="modify-textarea" className="text-xs">
              What you would like to change
            </Label>
            <Textarea
              id="modify-textarea"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={handleKeyPress}
              onBlur={handleBlur}
              placeholder="Describe the modification..."
              rows={4}
              className="text-xs"
              disabled={isLoading}
            />
            <Button
              onClick={handleCreate}
              disabled={isLoading || !editValue.trim()}
              className="flex items-center justify-center gap-2 text-xs"
            >
              <FaMagic />
              <span>Create</span>
            </Button>
          </div>
        ) : (
          <Button
            onClick={handleModify}
            disabled={isLoading}
            variant="ghost"
            size="sm"
            className="self-start text-xs"
          >
            <FaEdit className="text-xs" />
            <span>Modify</span>
          </Button>
        )}
      </div>
    </div>
  );
}
