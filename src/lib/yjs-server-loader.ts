import * as Y from "yjs";
import { prisma } from "@/lib/prisma";
import {
  getOrCreateProjectDoc,
  getDocHydratedAt,
  getDocHydrationPromise,
  markDocHydrated,
  setDocHydrationPromise,
  setDocStateVector,
} from "@/lib/server-yjs-docs";

export async function getHydratedProjectDoc(projectId: string): Promise<Y.Doc> {
  const doc = getOrCreateProjectDoc(projectId);
  if (getDocHydratedAt(projectId) === 0) {
    const existingPromise = getDocHydrationPromise(projectId);
    if (existingPromise) {
      await existingPromise;
    } else {
      const hydrationPromise = loadDocFromDatabase(projectId, doc).finally(() => {
        markDocHydrated(projectId);
      });
      setDocHydrationPromise(projectId, hydrationPromise);
      await hydrationPromise;
    }
    const vector = Buffer.from(Y.encodeStateVector(doc)).toString("base64");
    setDocStateVector(projectId, vector);
  }
  return doc;
}

async function loadDocFromDatabase(projectId: string, doc: Y.Doc): Promise<void> {
  try {
    const project = await prisma.project.findUnique({
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
      return;
    }

    const screensMap = doc.getMap("screens");
    doc.transact(() => {
      screensMap.clear();
      project.screens.forEach((screen) => {
        const yScreen = new Y.Map();
        yScreen.set("id", screen.id);
        yScreen.set(
          "position",
          screen.position ? JSON.parse(JSON.stringify(screen.position)) : null,
        );
        yScreen.set("height", screen.height || null);
        yScreen.set("selectedPromptIndex", screen.selectedPromptIndex ?? null);

        const yConversationPoints = new Y.Array();
        screen.conversationPoints.forEach((point) => {
          const yPoint = new Y.Map();
          yPoint.set("prompt", point.prompt);
          yPoint.set("html", point.html);
          yPoint.set("title", point.title || null);
          yPoint.set("timestamp", Number(point.timestamp));
          yPoint.set("arrows", point.arrows ? JSON.parse(JSON.stringify(point.arrows)) : []);
          yConversationPoints.push([yPoint]);
        });
        yScreen.set("conversationPoints", yConversationPoints);
        screensMap.set(screen.id, yScreen);
      });
    });
  } catch (error) {
    console.error("Error loading project from database:", error);
  }
}
