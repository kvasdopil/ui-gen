import { NextRequest } from "next/server";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import * as Y from "yjs";
import { prisma } from "@/lib/prisma";

// In-memory document storage per project
// In production, you might want to use Redis or a database
const projectDocs = new Map<string, Y.Doc>();
const projectClients = new Map<string, Set<ReadableStreamDefaultController>>();

function getOrCreateDoc(projectId: string): Y.Doc {
  if (!projectDocs.has(projectId)) {
    const doc = new Y.Doc();
    projectDocs.set(projectId, doc);

    // Load initial state from database
    loadDocFromDatabase(projectId, doc).catch((error) => {
      console.error(`Error loading doc from database for project ${projectId}:`, error);
    });
  }
  return projectDocs.get(projectId)!;
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

    if (project) {
      const screensMap = doc.getMap("screens");
      doc.transact(() => {
        project.screens.forEach((screen) => {
          const yScreen = new Y.Map();
          yScreen.set("id", screen.id);
          yScreen.set("position", screen.position ? JSON.parse(JSON.stringify(screen.position)) : null);
          yScreen.set("height", screen.height || null);

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
    }
  } catch (error) {
    console.error("Error loading project from database:", error);
  }
}

function broadcastUpdate(projectId: string, update: Uint8Array): void {
  const clients = projectClients.get(projectId);
  if (clients) {
    const base64Update = Buffer.from(update).toString("base64");
    clients.forEach((controller) => {
      try {
        controller.enqueue(`event: yjs-update\ndata: ${base64Update}\n\n`);
      } catch {
        // Client disconnected, remove from set
        clients.delete(controller);
      }
    });
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new Response("Unauthorized", { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const projectId = searchParams.get("projectId") || "default";

    // Get or create document for this project
    const doc = getOrCreateDoc(projectId);

    // Create SSE stream
    const stream = new ReadableStream({
      start(controller) {
        // Add client to project clients
        if (!projectClients.has(projectId)) {
          projectClients.set(projectId, new Set());
        }
        projectClients.get(projectId)!.add(controller);

        // Send full document state as update
        const state = Y.encodeStateAsUpdate(doc);
        const base64Update = Buffer.from(state).toString("base64");
        controller.enqueue(`event: yjs-update\ndata: ${base64Update}\n\n`);

        // Listen for document updates and broadcast to all clients
        const updateHandler = (update: Uint8Array, origin: unknown) => {
          // Don't broadcast updates that came from this client (via HTTP POST)
          if (origin !== "http") {
            broadcastUpdate(projectId, update);
          }
        };

        doc.on("update", updateHandler);

        // Handle client disconnect
        request.signal.addEventListener("abort", () => {
          doc.off("update", updateHandler);
          const clients = projectClients.get(projectId);
          if (clients) {
            clients.delete(controller);
            if (clients.size === 0) {
              projectClients.delete(projectId);
            }
          }
          controller.close();
        });
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Error in SSE route:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}

