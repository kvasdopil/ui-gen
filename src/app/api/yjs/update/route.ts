import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import * as Y from "yjs";
import { prisma } from "@/lib/prisma";

// In-memory document storage per project (same as SSE route)
const projectDocs = new Map<string, Y.Doc>();

function getOrCreateDoc(projectId: string): Y.Doc {
  if (!projectDocs.has(projectId)) {
    const doc = new Y.Doc();
    projectDocs.set(projectId, doc);
  }
  return projectDocs.get(projectId)!;
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const projectId = searchParams.get("projectId") || "default";

    const { update } = await request.json();

    if (!update) {
      return NextResponse.json({ error: "Missing update" }, { status: 400 });
    }

    // Get or create document for this project
    const doc = getOrCreateDoc(projectId);

    // Decode base64 update
    const updateBuffer = Uint8Array.from(atob(update), (c) => c.charCodeAt(0));

    // Apply update with "http" origin to prevent broadcasting back to sender
    Y.applyUpdate(doc, updateBuffer, "http");

    // Sync to database in the background
    syncDocToDatabase(projectId, doc).catch((error) => {
      console.error(`Error syncing doc to database for project ${projectId}:`, error);
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in update route:", error);
    return NextResponse.json({ error: "Failed to process update" }, { status: 500 });
  }
}

async function syncDocToDatabase(projectId: string, doc: Y.Doc): Promise<void> {
  try {
    // Ensure project exists
    await prisma.project.upsert({
      where: { id: projectId },
      create: {
        id: projectId,
        name: projectId === "default" ? "Default Project" : `Project ${projectId}`,
      },
      update: {},
    });

    const screensMap = doc.getMap("screens") as Y.Map<Y.Map<unknown>>;

    // Get all screens from Yjs
    const yjsScreens: Array<{ id: string; data: Y.Map<unknown> }> = [];
    screensMap.forEach((yScreen, screenId) => {
      yjsScreens.push({ id: screenId, data: yScreen });
    });

    // Get existing screens from database
    const existingScreens = await prisma.screen.findMany({
      where: { projectId },
      include: { conversationPoints: true },
    });

    // Process each screen from Yjs
    for (const { id: screenId, data: yScreen } of yjsScreens) {
      const position = (yScreen.get("position") as { x: number; y: number } | null) || null;
      const height = (yScreen.get("height") as number | null) || null;
      const yConversationPoints = yScreen.get("conversationPoints") as Y.Array<Y.Map<unknown>>;

      // Upsert screen
      await prisma.screen.upsert({
        where: { id: screenId },
        create: {
          id: screenId,
          projectId,
          position: position ? JSON.parse(JSON.stringify(position)) : null,
          height,
        },
        update: {
          position: position ? JSON.parse(JSON.stringify(position)) : null,
          height,
        },
      });

      // Process conversation points
      const yPoints: Array<{ index: number; data: Y.Map<unknown> }> = [];
      yConversationPoints.forEach((yPoint, index) => {
        yPoints.push({ index, data: yPoint });
      });

      // Only sync completed conversation points (those with HTML)
      const completedPoints = yPoints.filter((p) => {
        const html = p.data.get("html") as string;
        return html && html.trim().length > 0;
      });

      // Delete conversation points that are no longer in Yjs
      const yPointTimestamps = new Set(
        completedPoints.map((p) => Number(p.data.get("timestamp") as number)),
      );
      await prisma.conversationPoint.deleteMany({
        where: {
          screenId,
          timestamp: {
            notIn: Array.from(yPointTimestamps).map((ts) => BigInt(ts)),
          },
        },
      });

      // Upsert conversation points
      for (const { index, data: yPoint } of completedPoints) {
        const prompt = yPoint.get("prompt") as string;
        const html = yPoint.get("html") as string;
        const title = (yPoint.get("title") as string | null) || null;
        const timestamp = BigInt(yPoint.get("timestamp") as number);
        const arrows = (yPoint.get("arrows") as Array<{ overlayIndex: number; targetScreenId: string; startPoint?: { x: number; y: number } }> | null) || null;

        // Find existing point by screenId and timestamp
        const existingPoint = await prisma.conversationPoint.findFirst({
          where: {
            screenId,
            timestamp,
          },
        });

        if (existingPoint) {
          // Update existing point
          await prisma.conversationPoint.update({
            where: { id: existingPoint.id },
            data: {
              prompt,
              html,
              title,
              arrows: arrows ? JSON.parse(JSON.stringify(arrows)) : null,
              index,
            },
          });
        } else {
          // Create new point
          await prisma.conversationPoint.create({
            data: {
              id: `${screenId}-${timestamp}`,
              screenId,
              prompt,
              html,
              title,
              timestamp,
              arrows: arrows ? JSON.parse(JSON.stringify(arrows)) : null,
              index,
            },
          });
        }
      }
    }

    // Delete screens that are no longer in Yjs
    const yjsScreenIds = new Set(yjsScreens.map((s) => s.id));
    const screensToDelete = existingScreens.filter((s) => !yjsScreenIds.has(s.id));
    if (screensToDelete.length > 0) {
      await prisma.screen.deleteMany({
        where: {
          id: {
            in: screensToDelete.map((s) => s.id),
          },
        },
      });
    }
  } catch (error) {
    console.error("Error syncing doc to database:", error);
    throw error;
  }
}

