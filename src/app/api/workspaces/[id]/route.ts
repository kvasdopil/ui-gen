import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import crypto from "crypto";

const updateWorkspaceSchema = z.object({
  name: z.string().min(1, "Name is required"),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getAuthenticatedUser();
    if (!user.email) {
      return NextResponse.json({ error: "Email not found in session" }, { status: 401 });
    }

    const { id } = await params;
    const userId = crypto.createHash("sha256").update(user.email.toLowerCase().trim()).digest("hex");

    // Get workspace
    const workspace = await prisma.workspace.findFirst({
      where: {
        id,
        userId,
      },
      include: {
        _count: {
          select: {
            screens: true,
          },
        },
      },
    });

    if (!workspace) {
      return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: workspace.id,
      name: workspace.name,
      createdAt: workspace.createdAt,
      screenCount: workspace._count.screens,
      isDefault: workspace.name === "default",
    });
  } catch (error) {
    console.error("Error fetching workspace:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to fetch workspace";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getAuthenticatedUser();
    if (!user.email) {
      return NextResponse.json({ error: "Email not found in session" }, { status: 401 });
    }

    const { id } = await params;
    const userId = crypto.createHash("sha256").update(user.email.toLowerCase().trim()).digest("hex");

    // Verify workspace belongs to user
    const workspace = await prisma.workspace.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!workspace) {
      return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
    }

    const body = await request.json();
    const validatedData = updateWorkspaceSchema.parse(body);

    // Update workspace name
    const updatedWorkspace = await prisma.workspace.update({
      where: { id },
      data: { name: validatedData.name },
    });

    return NextResponse.json({
      id: updatedWorkspace.id,
      name: updatedWorkspace.name,
      createdAt: updatedWorkspace.createdAt,
      isDefault: updatedWorkspace.name === "default",
    });
  } catch (error) {
    console.error("Error updating workspace:", error);
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Invalid request data", details: error }, { status: 400 });
    }
    const errorMessage = error instanceof Error ? error.message : "Failed to update workspace";
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
    const userId = crypto.createHash("sha256").update(user.email.toLowerCase().trim()).digest("hex");

    // Verify workspace belongs to user
    const workspace = await prisma.workspace.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!workspace) {
      return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
    }

    // Delete workspace (cascade will delete screens and dialog entries)
    await prisma.workspace.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting workspace:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to delete workspace";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

