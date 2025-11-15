import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import crypto from "crypto";

const createWorkspaceSchema = z.object({
  name: z.string().optional(),
});

export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    if (!user.email) {
      return NextResponse.json({ error: "Email not found in session" }, { status: 401 });
    }

    // Get user ID
    const userId = crypto.createHash("sha256").update(user.email.toLowerCase().trim()).digest("hex");

    // Get all workspaces for this user
    const workspaces = await prisma.workspace.findMany({
      where: {
        userId,
      },
      include: {
        _count: {
          select: {
            screens: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    // Transform to include screen count
    const workspacesData = workspaces.map((workspace) => ({
      id: workspace.id,
      name: workspace.name,
      createdAt: workspace.createdAt,
      screenCount: workspace._count.screens,
      isDefault: workspace.name === "default",
    }));

    return NextResponse.json(workspacesData);
  } catch (error) {
    console.error("Error fetching workspaces:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to fetch workspaces";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user.email) {
      return NextResponse.json({ error: "Email not found in session" }, { status: 401 });
    }

    // Get user ID
    const userId = crypto.createHash("sha256").update(user.email.toLowerCase().trim()).digest("hex");

    const body = await request.json().catch(() => ({}));
    const validatedData = createWorkspaceSchema.parse(body);

    // If name is provided, use it; otherwise generate a name
    let workspaceName = validatedData.name;
    if (!workspaceName) {
      // Get all existing workspace names for this user to generate next number
      const existingWorkspaces = await prisma.workspace.findMany({
        where: { userId },
        select: { name: true },
      });

      // Extract numbers from workspace names like "Workspace 1", "Workspace 2", etc.
      const workspaceNumbers = existingWorkspaces
        .map((w) => {
          const match = w.name.match(/^Workspace (\d+)$/);
          return match ? parseInt(match[1], 10) : 0;
        })
        .filter((n) => n > 0);

      // Find the next available number
      const nextNumber = workspaceNumbers.length > 0 ? Math.max(...workspaceNumbers) + 1 : 1;
      workspaceName = `Workspace ${nextNumber}`;
    }

    // Create workspace
    const workspace = await prisma.workspace.create({
      data: {
        userId,
        name: workspaceName,
      },
    });

    return NextResponse.json(
      {
        id: workspace.id,
        name: workspace.name,
        createdAt: workspace.createdAt,
        screenCount: 0,
        isDefault: workspace.name === "default",
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating workspace:", error);
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Invalid request data", details: error }, { status: 400 });
    }
    const errorMessage = error instanceof Error ? error.message : "Failed to create workspace";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

