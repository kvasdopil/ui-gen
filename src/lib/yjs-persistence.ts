import * as Y from "yjs";
import type { ConversationPoint, Screen } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { setDocStateVector } from "@/lib/server-yjs-docs";

type ConversationPointArrow = {
  overlayIndex: number;
  targetScreenId: string;
  startPoint?: { x: number; y: number };
};

export async function persistYDocToDatabase(projectId: string, doc: Y.Doc): Promise<void> {
  const screensMap = doc.getMap("screens") as Y.Map<Y.Map<unknown>>;
  await persistScreensMap(projectId, screensMap);
  const vector = Buffer.from(Y.encodeStateVector(doc)).toString("base64");
  setDocStateVector(projectId, vector);
}

export async function persistScreensMap(
  projectId: string,
  screensMap: Y.Map<Y.Map<unknown>>,
): Promise<void> {
  if (!prisma || !("project" in prisma)) {
    console.error(
      "Prisma client is not properly initialized. Make sure DATABASE_URL is set and prisma generate has been run.",
    );
    return;
  }

  await prisma.$transaction(async (tx) => {
    await tx.project.upsert({
      where: { id: projectId },
      create: {
        id: projectId,
        name: projectId === "default" ? "Default Project" : `Project ${projectId}`,
      },
      update: {},
    });

    const existingScreens = await tx.screen.findMany({
      where: { projectId },
      include: { conversationPoints: true },
    });

    const existingScreensMap = new Map<
      string,
      Screen & { conversationPoints: ConversationPoint[] }
    >(existingScreens.map((screen) => [screen.id, screen]));

    const yjsScreens: Array<{ id: string; data: Y.Map<unknown> }> = [];
    screensMap.forEach((yScreen, screenId) => {
      yjsScreens.push({ id: screenId, data: yScreen });
    });

    for (const { id: screenId, data: yScreen } of yjsScreens) {
      const position = (yScreen.get("position") as { x: number; y: number } | null) || null;
      const height = (yScreen.get("height") as number | null) || null;
      const selectedPromptIndex = (yScreen.get("selectedPromptIndex") as number | null) ?? null;
      const yConversationPoints = yScreen.get("conversationPoints") as Y.Array<Y.Map<unknown>>;

      await tx.screen.upsert({
        where: { id: screenId },
        create: {
          id: screenId,
          projectId,
          position: position ? JSON.parse(JSON.stringify(position)) : null,
          height,
          selectedPromptIndex,
        },
        update: {
          position: position ? JSON.parse(JSON.stringify(position)) : null,
          height,
          selectedPromptIndex,
        },
      });

      const completedPoints: Array<{ index: number; data: Y.Map<unknown> }> = [];
      yConversationPoints.forEach((yPoint, index) => {
        const html = (yPoint.get("html") as string | null) || "";
        if (html.trim().length > 0) {
          completedPoints.push({ index, data: yPoint });
        }
      });

      const timestampsToKeep = new Set<number>();
      completedPoints.forEach((point) => {
        const timestamp = point.data.get("timestamp") as number;
        timestampsToKeep.add(Number(timestamp));
      });

      await tx.conversationPoint.deleteMany({
        where: {
          screenId,
          timestamp: {
            notIn: Array.from(timestampsToKeep).map((ts) => BigInt(ts)),
          },
        },
      });

      const existingScreen = existingScreensMap.get(screenId);
      const existingPointsMap =
        existingScreen?.conversationPoints.reduce<Map<number, ConversationPoint>>((acc, point) => {
          acc.set(Number(point.timestamp), point);
          return acc;
        }, new Map()) ?? new Map();

      for (const { index, data: yPoint } of completedPoints) {
        const prompt = yPoint.get("prompt") as string;
        const html = yPoint.get("html") as string;
        const title = (yPoint.get("title") as string | null) || null;
        const timestampNumber = Number(yPoint.get("timestamp") as number);
        const arrows = (yPoint.get("arrows") as ConversationPointArrow[] | null) || null;
        const arrowPayload = arrows ? JSON.parse(JSON.stringify(arrows)) : null;
        const pointId = `${screenId}-${timestampNumber}`;

        await tx.conversationPoint.upsert({
          where: { id: pointId },
          create: {
            id: pointId,
            screenId,
            prompt,
            html,
            title,
            timestamp: BigInt(timestampNumber),
            arrows: arrowPayload,
            index,
          },
          update: {
            prompt,
            html,
            title,
            arrows: arrowPayload,
            index,
          },
        });

        existingPointsMap.set(timestampNumber, {
          id: pointId,
          screenId,
          prompt,
          html,
          title,
          timestamp: BigInt(timestampNumber),
          arrows: arrowPayload,
          index,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
    }

    const yjsScreenIds = new Set(yjsScreens.map((s) => s.id));
    const screensToDelete = existingScreens.filter((screen) => !yjsScreenIds.has(screen.id));
    if (screensToDelete.length > 0) {
      await tx.screen.deleteMany({
        where: {
          id: {
            in: screensToDelete.map((screen) => screen.id),
          },
        },
      });
    }
  });
}
