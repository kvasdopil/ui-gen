import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import * as Y from "yjs";
import { getDocStateVector } from "@/lib/server-yjs-docs";
import { getHydratedProjectDoc } from "@/lib/yjs-server-loader";
import { persistYDocToDatabase } from "@/lib/yjs-persistence";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const projectId = session.user.id;

    const { update } = await request.json();

    if (!update) {
      return NextResponse.json({ error: "Missing update" }, { status: 400 });
    }

    const doc = await getHydratedProjectDoc(projectId);

    // Decode base64 update
    const updateBuffer = Uint8Array.from(atob(update), (c) => c.charCodeAt(0));

    // Apply update with "http" origin to prevent broadcasting back to sender
    Y.applyUpdate(doc, updateBuffer, "http");

    const newVector = Buffer.from(Y.encodeStateVector(doc)).toString("base64");
    const lastVector = getDocStateVector(projectId);
    if (lastVector === newVector) {
      return NextResponse.json({ success: true, skipped: true });
    }

    // Sync to database in the background
    persistYDocToDatabase(projectId, doc).catch((error) => {
      console.error(`Error syncing doc to database for project ${projectId}:`, error);
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in update route:", error);
    return NextResponse.json({ error: "Failed to process update" }, { status: 500 });
  }
}
