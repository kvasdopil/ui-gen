import { z } from "zod";

export const createScreenSchema = z.object({
  x: z.number(),
  y: z.number(),
  selectedPromptIndex: z.number().int().nullable().optional(),
});

export const updateScreenSchema = z.object({
  x: z.number().optional(),
  y: z.number().optional(),
  selectedPromptIndex: z.number().int().nullable().optional(),
});

export const createDialogSchema = z.object({
  prompt: z.string().min(1, "Prompt is required"),
});

