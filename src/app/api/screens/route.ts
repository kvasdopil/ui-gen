import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser, getOrCreateWorkspace } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createScreenSchema } from "@/lib/validations";

export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    if (!user.email) {
      return NextResponse.json({ error: "Email not found in session" }, { status: 401 });
    }
    const workspace = await getOrCreateWorkspace(user.email);

    const screens = await prisma.screen.findMany({
      where: {
        workspaceId: workspace.id,
      },
      include: {
        dialogEntries: {
          orderBy: {
            timestamp: "asc",
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    // Get all screen IDs for validation
    const screenIds = new Set(screens.map((s) => s.id));

    // Transform to match ScreenData type and filter out invalid arrows
    const screensData = screens.map((screen) => ({
      id: screen.id,
      position: {
        x: screen.positionX,
        y: screen.positionY,
      },
      selectedPromptIndex: screen.selectedPromptIndex,
      conversationPoints: screen.dialogEntries.map((entry) => {
        const arrows =
          (entry.arrows as Array<{
            touchableId: string;
            targetScreenId: string;
            startPoint?: { x: number; y: number };
          }>) || [];
        // Filter out arrows without valid targetScreenId
        const validArrows = arrows.filter(
          (arrow) => arrow.targetScreenId && screenIds.has(arrow.targetScreenId),
        );

        // If there are invalid arrows, update the database
        if (validArrows.length !== arrows.length) {
          // Update database asynchronously (don't await to avoid blocking response)
          prisma.dialogEntry
            .update({
              where: { id: entry.id },
              data: { arrows: validArrows },
            })
            .catch((error) => {
              console.error(
                `Error cleaning up invalid arrows for dialog entry ${entry.id}:`,
                error,
              );
            });
        }

        return {
          id: entry.id,
          prompt: entry.prompt,
          html: entry.html || "",
          title: entry.title,
          timestamp: Number(entry.timestamp),
          arrows: validArrows,
        };
      }),
    }));

    return NextResponse.json(screensData);
  } catch (error) {
    console.error("Error fetching screens:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to fetch screens";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user.email) {
      return NextResponse.json({ error: "Email not found in session" }, { status: 401 });
    }
    const workspace = await getOrCreateWorkspace(user.email);

    const body = await request.json();
    const validatedData = createScreenSchema.parse(body);

    // Create screen without dialog entries
    const screen = await prisma.screen.create({
      data: {
        workspaceId: workspace.id,
        positionX: validatedData.x,
        positionY: validatedData.y,
        selectedPromptIndex: validatedData.selectedPromptIndex ?? null,
      },
    });

    // Transform to match ScreenData type
    const screenData = {
      id: screen.id,
      position: {
        x: screen.positionX,
        y: screen.positionY,
      },
      selectedPromptIndex: screen.selectedPromptIndex,
      conversationPoints: [],
    };

    return NextResponse.json(screenData, { status: 201 });
  } catch (error) {
    console.error("Error creating screen:", error);
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Invalid request data", details: error }, { status: 400 });
    }
    const errorMessage = error instanceof Error ? error.message : "Failed to create screen";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
