import { NextRequest } from "next/server";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import * as Y from "yjs";
import { getHydratedProjectDoc } from "@/lib/yjs-server-loader";
import { getProjectIdFromEmail } from "@/lib/project-id";

const projectClients = new Map<string, Set<ReadableStreamDefaultController>>();

function broadcastUpdate(projectId: string, update: Uint8Array): void {
  const clients = projectClients.get(projectId);
  if (!clients) return;

  const base64Update = Buffer.from(update).toString("base64");
  clients.forEach((controller) => {
    try {
      controller.enqueue(`event: yjs-update\ndata: ${base64Update}\n\n`);
    } catch {
      clients.delete(controller);
    }
  });
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return new Response("Unauthorized", { status: 401 });
    }

    const projectId = await getProjectIdFromEmail(session.user.email);
    console.log("[API] /api/yjs/sse - Using project ID", { projectId, email: session.user.email });
    const doc = await getHydratedProjectDoc(projectId);

    const stream = new ReadableStream({
      start(controller) {
        if (!projectClients.has(projectId)) {
          projectClients.set(projectId, new Set());
        }
        projectClients.get(projectId)!.add(controller);

        const state = Y.encodeStateAsUpdate(doc);
        controller.enqueue(`event: yjs-update\ndata: ${Buffer.from(state).toString("base64")}\n\n`);

        const updateHandler = (update: Uint8Array) => {
          broadcastUpdate(projectId, update);
        };
        doc.on("update", updateHandler);

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
