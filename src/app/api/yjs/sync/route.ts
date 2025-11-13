import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import * as Y from "yjs";
import { setDocStateVector } from "@/lib/server-yjs-docs";
import { getHydratedProjectDoc } from "@/lib/yjs-server-loader";
import { persistScreensMap } from "@/lib/yjs-persistence";
import { getProjectIdFromEmail } from "@/lib/project-id";

// This endpoint handles Yjs document updates
// For real-time WebSocket support, a separate WebSocket server is needed
// See: https://github.com/yjs/y-websocket for WebSocket server setup

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { update } = await request.json();
    const projectId = await getProjectIdFromEmail(session.user.email);
    console.log("[API] /api/yjs/sync - Using project ID", { projectId, email: session.user.email });

    if (!update) {
      return NextResponse.json({ error: "Missing update" }, { status: 400 });
    }

    // Decode Yjs update and apply to shared doc
    const sharedDoc = await getHydratedProjectDoc(projectId);
    Y.applyUpdate(sharedDoc, Buffer.from(update, "base64"), "http");

    const screensMap = sharedDoc.getMap("screens") as Y.Map<Y.Map<unknown>>;
    await persistScreensMap(projectId, screensMap);
    const newVector = Buffer.from(Y.encodeStateVector(sharedDoc)).toString("base64");
    setDocStateVector(projectId, newVector);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error syncing Yjs update:", error);
    return NextResponse.json({ error: "Failed to sync update" }, { status: 500 });
  }
}
