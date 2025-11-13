import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import * as Y from "yjs";
import { getHydratedProjectDoc } from "@/lib/yjs-server-loader";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { stateVector } = await request.json();
    const projectId = session.user.id;

    const doc = await getHydratedProjectDoc(projectId);
    const decodedVector = stateVector ? Buffer.from(stateVector, "base64") : undefined;
    const update = decodedVector
      ? Y.encodeStateAsUpdate(doc, decodedVector)
      : Y.encodeStateAsUpdate(doc);

    return NextResponse.json({
      update: Buffer.from(update).toString("base64"),
    });
  } catch (error) {
    console.error("Error fetching Yjs state vector diff:", error);
    return NextResponse.json({ error: "Failed to fetch state" }, { status: 500 });
  }
}
