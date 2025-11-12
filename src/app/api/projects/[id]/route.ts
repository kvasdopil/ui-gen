import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import type { ScreenData } from "@/lib/types";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const projectId = id || "default";

    // Get or create project
    let project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        screens: {
          include: {
            conversationPoints: {
              orderBy: { index: "asc" },
            },
          },
        },
      },
    });

    if (!project) {
      // Create default project if it doesn't exist
      project = await prisma.project.create({
        data: {
          id: projectId,
          name: projectId === "default" ? "Default Project" : `Project ${projectId}`,
        },
        include: {
          screens: {
            include: {
              conversationPoints: {
                orderBy: { index: "asc" },
              },
            },
          },
        },
      });
    }

    // Convert to ScreenData format
    const screens: ScreenData[] = project.screens.map((screen) => ({
      id: screen.id,
      conversationPoints: screen.conversationPoints.map((point) => ({
        prompt: point.prompt,
        html: point.html,
        title: point.title || null,
        timestamp: Number(point.timestamp),
        arrows: (point.arrows as Array<{ overlayIndex: number; targetScreenId: string; startPoint?: { x: number; y: number } }> | null) || undefined,
      })),
      selectedPromptIndex: null, // This is client-side state
      position: (screen.position as { x: number; y: number } | null) || undefined,
      height: screen.height || undefined,
    }));

    return NextResponse.json({ project: { id: project.id, name: project.name }, screens });
  } catch (error) {
    console.error("Error fetching project:", error);
    return NextResponse.json({ error: "Failed to fetch project" }, { status: 500 });
  }
}

