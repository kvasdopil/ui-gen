import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser, getOrCreateWorkspace } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; dialogId: string }> },
) {
  try {
    const user = await getAuthenticatedUser();
    if (!user.email) {
      return NextResponse.json({ error: "Email not found in session" }, { status: 401 });
    }
    const workspace = await getOrCreateWorkspace(user.email);
    const { id, dialogId } = await params;

    // Verify screen belongs to user's workspace
    const screen = await prisma.screen.findFirst({
      where: {
        id,
        workspaceId: workspace.id,
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

    // Delete dialog entry
    await prisma.dialogEntry.delete({
      where: { id: dialogId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting dialog entry:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to delete dialog entry";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

