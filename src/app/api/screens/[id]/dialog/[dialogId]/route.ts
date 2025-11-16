import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser, touchWorkspace } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import crypto from "crypto";

const updateDialogEntrySchema = z.object({
  arrows: z
    .array(
      z.object({
        touchableId: z.string(),
        targetScreenId: z.string(),
        startPoint: z
          .object({
            x: z.number(),
            y: z.number(),
          })
          .optional(),
      }),
    )
    .optional(),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; dialogId: string }> },
) {
  try {
    const user = await getAuthenticatedUser();
    if (!user.email) {
      return NextResponse.json({ error: "Email not found in session" }, { status: 401 });
    }
    const { id, dialogId } = await params;
    const userId = crypto
      .createHash("sha256")
      .update(user.email.toLowerCase().trim())
      .digest("hex");

    // Verify screen belongs to the user
    const screen = await prisma.screen.findFirst({
      where: {
        id,
        workspace: {
          userId,
        },
      },
    });

    if (!screen) {
      return NextResponse.json({ error: "Screen not found" }, { status: 404 });
    }

    // Verify dialog entry belongs to this screen
    const dialogEntry = await prisma.dialogEntry.findFirst({
      where: {
        id: dialogId,
        screenId: id,
      },
    });

    if (!dialogEntry) {
      return NextResponse.json({ error: "Dialog entry not found" }, { status: 404 });
    }

    const body = await request.json();
    const validatedData = updateDialogEntrySchema.parse(body);

    // Update dialog entry with arrows
    const updatedEntry = await prisma.dialogEntry.update({
      where: { id: dialogId },
      data: {
        ...(validatedData.arrows !== undefined && { arrows: validatedData.arrows }),
      },
    });

    // Update workspace's updatedAt timestamp
    await touchWorkspace(screen.workspaceId);

    return NextResponse.json({
      id: updatedEntry.id,
      prompt: updatedEntry.prompt,
      html: updatedEntry.html || "",
      title: updatedEntry.title,
      timestamp: Number(updatedEntry.timestamp),
      arrows:
        (updatedEntry.arrows as Array<{
          touchableId: string;
          targetScreenId: string;
          startPoint?: { x: number; y: number };
        }>) || [],
    });
  } catch (error) {
    console.error("Error updating dialog entry:", error);
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Invalid request data", details: error }, { status: 400 });
    }
    const errorMessage = error instanceof Error ? error.message : "Failed to update dialog entry";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; dialogId: string }> },
) {
  try {
    const user = await getAuthenticatedUser();
    if (!user.email) {
      return NextResponse.json({ error: "Email not found in session" }, { status: 401 });
    }
    const { id, dialogId } = await params;
    const userId = crypto
      .createHash("sha256")
      .update(user.email.toLowerCase().trim())
      .digest("hex");

    // Verify screen belongs to the user
    const screen = await prisma.screen.findFirst({
      where: {
        id,
        workspace: {
          userId,
        },
      },
    });

    if (!screen) {
      return NextResponse.json({ error: "Screen not found" }, { status: 404 });
    }

    // Verify dialog entry belongs to this screen
    const dialogEntry = await prisma.dialogEntry.findFirst({
      where: {
        id: dialogId,
        screenId: id,
      },
    });

    if (!dialogEntry) {
      return NextResponse.json({ error: "Dialog entry not found" }, { status: 404 });
    }

    const workspaceId = screen.workspaceId;

    // Delete dialog entry
    await prisma.dialogEntry.delete({
      where: { id: dialogId },
    });

    // Update workspace's updatedAt timestamp
    await touchWorkspace(workspaceId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting dialog entry:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to delete dialog entry";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
