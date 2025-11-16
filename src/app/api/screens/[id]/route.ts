import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser, touchWorkspace } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateScreenSchema } from "@/lib/validations";
import crypto from "crypto";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthenticatedUser();
    if (!user.email) {
      return NextResponse.json({ error: "Email not found in session" }, { status: 401 });
    }
    const { id } = await params;
    const userId = crypto
      .createHash("sha256")
      .update(user.email.toLowerCase().trim())
      .digest("hex");

    // Verify screen belongs to the user
    const existingScreen = await prisma.screen.findFirst({
      where: {
        id,
        workspace: {
          userId,
        },
      },
    });

    if (!existingScreen) {
      return NextResponse.json({ error: "Screen not found" }, { status: 404 });
    }

    const body = await request.json();
    const validatedData = updateScreenSchema.parse(body);

    // Update screen with partial data
    const screen = await prisma.screen.update({
      where: { id },
      data: {
        ...(validatedData.x !== undefined && { positionX: validatedData.x }),
        ...(validatedData.y !== undefined && { positionY: validatedData.y }),
        ...(validatedData.selectedPromptIndex !== undefined && {
          selectedPromptIndex: validatedData.selectedPromptIndex,
        }),
      },
      include: {
        dialogEntries: {
          orderBy: {
            timestamp: "asc",
          },
        },
      },
    });

    // Update workspace's updatedAt timestamp
    await touchWorkspace(existingScreen.workspaceId);

    // Transform to match ScreenData type
    const screenData = {
      id: screen.id,
      position: {
        x: screen.positionX,
        y: screen.positionY,
      },
      selectedPromptIndex: screen.selectedPromptIndex,
      conversationPoints: screen.dialogEntries.map((entry) => ({
        id: entry.id,
        prompt: entry.prompt,
        html: entry.html || "",
        title: entry.title,
        timestamp: Number(entry.timestamp),
        arrows:
          (entry.arrows as Array<{
            touchableId: string;
            targetScreenId: string;
            startPoint?: { x: number; y: number };
          }>) || [],
      })),
    };

    return NextResponse.json(screenData);
  } catch (error) {
    console.error("Error updating screen:", error);
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Invalid request data", details: error }, { status: 400 });
    }
    const errorMessage = error instanceof Error ? error.message : "Failed to update screen";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getAuthenticatedUser();
    if (!user.email) {
      return NextResponse.json({ error: "Email not found in session" }, { status: 401 });
    }
    const { id } = await params;
    const userId = crypto
      .createHash("sha256")
      .update(user.email.toLowerCase().trim())
      .digest("hex");

    // Verify screen belongs to the user
    const existingScreen = await prisma.screen.findFirst({
      where: {
        id,
        workspace: {
          userId,
        },
      },
    });

    if (!existingScreen) {
      return NextResponse.json({ error: "Screen not found" }, { status: 404 });
    }

    const workspaceId = existingScreen.workspaceId;

    // Delete screen (cascade will delete dialog entries)
    await prisma.screen.delete({
      where: { id },
    });

    // Update workspace's updatedAt timestamp
    await touchWorkspace(workspaceId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting screen:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to delete screen";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
