import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser, getOrCreateWorkspace } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/client";
import { z } from "zod";

const cloneScreenSchema = z.object({
  convPointId: z.string().min(1, "Conversation point ID is required"),
  x: z.number(),
  y: z.number(),
});

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthenticatedUser();
    if (!user.email) {
      return NextResponse.json({ error: "Email not found in session" }, { status: 401 });
    }
    const workspace = await getOrCreateWorkspace(user.email);
    const { id } = await params;

    // Verify source screen belongs to user's workspace
    const sourceScreen = await prisma.screen.findFirst({
      where: {
        id,
        workspaceId: workspace.id,
      },
      include: {
        dialogEntries: {
          orderBy: {
            timestamp: "asc",
          },
        },
      },
    });

    if (!sourceScreen) {
      return NextResponse.json({ error: "Screen not found" }, { status: 404 });
    }

    const body = await request.json();
    const validatedData = cloneScreenSchema.parse(body);

    // Find the conversation point in the source screen
    const targetConvPoint = sourceScreen.dialogEntries.find(
      (entry) => entry.id === validatedData.convPointId,
    );

    if (!targetConvPoint) {
      return NextResponse.json(
        { error: "Conversation point not found in the specified screen" },
        { status: 404 },
      );
    }

    // Get all dialog entries up to and including the target conversation point
    const entriesToClone = sourceScreen.dialogEntries.filter(
      (entry) => entry.timestamp <= targetConvPoint.timestamp,
    );

    // Find the index of the target conversation point
    const selectedPromptIndex = entriesToClone.findIndex(
      (entry) => entry.id === validatedData.convPointId,
    );

    if (selectedPromptIndex === -1) {
      return NextResponse.json(
        { error: "Could not determine conversation point index" },
        { status: 500 },
      );
    }

    // Create new screen with the specified position
    const newScreen = await prisma.screen.create({
      data: {
        workspaceId: workspace.id,
        positionX: validatedData.x,
        positionY: validatedData.y,
        selectedPromptIndex,
        dialogEntries: {
          create: entriesToClone.map((entry) => ({
            prompt: entry.prompt,
            html: entry.html,
            title: entry.title,
            timestamp: entry.timestamp,
            arrows: (entry.arrows as Prisma.InputJsonValue) ?? undefined,
          })),
        },
      },
      include: {
        dialogEntries: {
          orderBy: {
            timestamp: "asc",
          },
        },
      },
    });

    // Transform to match ScreenData type
    const screenData = {
      id: newScreen.id,
      position: {
        x: newScreen.positionX,
        y: newScreen.positionY,
      },
      selectedPromptIndex: newScreen.selectedPromptIndex,
      conversationPoints: newScreen.dialogEntries.map((entry) => ({
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

    return NextResponse.json(screenData, { status: 201 });
  } catch (error) {
    console.error("Error cloning screen:", error);
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Invalid request data", details: error }, { status: 400 });
    }
    const errorMessage = error instanceof Error ? error.message : "Failed to clone screen";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
