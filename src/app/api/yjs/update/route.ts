import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import * as Y from "yjs";
import { getDocStateVector } from "@/lib/server-yjs-docs";
import { getHydratedProjectDoc } from "@/lib/yjs-server-loader";
import { persistYDocToDatabase } from "@/lib/yjs-persistence";
import { getProjectIdFromEmail } from "@/lib/project-id";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const projectId = await getProjectIdFromEmail(session.user.email);
    console.log("[API] /api/yjs/update - Using project ID", { projectId, email: session.user.email });

    const { update } = await request.json();

    if (!update) {
      return NextResponse.json({ error: "Missing update" }, { status: 400 });
    }

    const doc = await getHydratedProjectDoc(projectId);

    // Get state vector BEFORE applying update
    const vectorBefore = Buffer.from(Y.encodeStateVector(doc)).toString("base64");
    const lastVector = getDocStateVector(projectId);
    
    // Get document state before update
    const screensMapBefore = doc.getMap("screens") as Y.Map<Y.Map<unknown>>;
    const screenCountBefore = screensMapBefore.size;
    const screenIdsBefore = Array.from(screensMapBefore.keys());
    
    // Get detailed screen data before update for the screen being updated
    const screenDataBefore: Record<string, unknown> = {};
    screenIdsBefore.forEach((screenId) => {
      const yScreen = screensMapBefore.get(screenId) as Y.Map<unknown> | undefined;
      if (yScreen) {
        screenDataBefore[screenId] = {
          position: yScreen.get("position"),
          height: yScreen.get("height"),
          selectedPromptIndex: yScreen.get("selectedPromptIndex"),
          conversationPointsCount: (yScreen.get("conversationPoints") as Y.Array<unknown> | undefined)?.length || 0,
        };
      }
    });
    
    // Decode and inspect the update before applying
    const updateBuffer = Uint8Array.from(atob(update), (c) => c.charCodeAt(0));
    
    // Try to decode what's in the update (this is a bit tricky with Yjs binary format)
    // We'll create a temporary doc to see what changes the update would make
    const tempDoc = new Y.Doc();
    const tempScreensMap = tempDoc.getMap("screens");
    screensMapBefore.forEach((yScreen, screenId) => {
      const tempScreen = new Y.Map();
      yScreen.forEach((value, key) => {
        if (value instanceof Y.Array) {
          const tempArray = new Y.Array();
          value.forEach((item) => {
            if (item instanceof Y.Map) {
              const tempItem = new Y.Map();
              item.forEach((v, k) => tempItem.set(k, v));
              tempArray.push([tempItem]);
            } else {
              tempArray.push([item]);
            }
          });
          tempScreen.set(key, tempArray);
        } else if (value instanceof Y.Map) {
          const tempMap = new Y.Map();
          value.forEach((v, k) => tempMap.set(k, v));
          tempScreen.set(key, tempMap);
        } else {
          tempScreen.set(key, value);
        }
      });
      tempScreensMap.set(screenId, tempScreen);
    });
    
    // Apply update to temp doc to see what changes
    Y.applyUpdate(tempDoc, updateBuffer, "temp");
    const tempVectorAfter = Buffer.from(Y.encodeStateVector(tempDoc)).toString("base64");
    
    // Get temp doc state after update
    const tempScreenDataAfter: Record<string, unknown> = {};
    tempScreensMap.forEach((yScreen, screenId) => {
      tempScreenDataAfter[screenId] = {
        position: yScreen.get("position"),
        height: yScreen.get("height"),
        selectedPromptIndex: yScreen.get("selectedPromptIndex"),
        conversationPointsCount: (yScreen.get("conversationPoints") as Y.Array<unknown> | undefined)?.length || 0,
      };
    });

    console.log("[API] /api/yjs/update - Received update", {
      projectId,
      updateSize: updateBuffer.length,
      vectorBefore: vectorBefore,
      vectorBeforeLength: vectorBefore.length,
      lastVector: lastVector,
      lastVectorLength: lastVector?.length || 0,
      vectorsMatch: vectorBefore === lastVector,
      screenCountBefore,
      screenIdsBefore,
      screenDataBefore,
      tempVectorAfter: tempVectorAfter,
      tempScreenDataAfter,
      tempVectorChanged: vectorBefore !== tempVectorAfter,
    });

    // Apply update with "http" origin to prevent broadcasting back to sender
    Y.applyUpdate(doc, updateBuffer, "http");

    // Get state vector AFTER applying update
    const vectorAfter = Buffer.from(Y.encodeStateVector(doc)).toString("base64");
    
    // Get document state after update
    const screensMapAfter = doc.getMap("screens") as Y.Map<Y.Map<unknown>>;
    const screenCountAfter = screensMapAfter.size;
    const screenIdsAfter = Array.from(screensMapAfter.keys());
    
    // Get detailed screen data after update
    const screenDataAfter: Record<string, unknown> = {};
    screenIdsAfter.forEach((screenId) => {
      const yScreen = screensMapAfter.get(screenId) as Y.Map<unknown> | undefined;
      if (yScreen) {
        screenDataAfter[screenId] = {
          position: yScreen.get("position"),
          height: yScreen.get("height"),
          selectedPromptIndex: yScreen.get("selectedPromptIndex"),
          conversationPointsCount: (yScreen.get("conversationPoints") as Y.Array<unknown> | undefined)?.length || 0,
        };
      }
    });
    
    // Check if screens changed
    const screensChanged = 
      screenCountBefore !== screenCountAfter ||
      screenIdsBefore.some(id => !screenIdsAfter.includes(id)) ||
      screenIdsAfter.some(id => !screenIdsBefore.includes(id));
    
    // Check if screen data changed (deep comparison)
    const screenDataChanged = screenIdsBefore.some((screenId) => {
      const before = screenDataBefore[screenId];
      const after = screenDataAfter[screenId];
      return JSON.stringify(before) !== JSON.stringify(after);
    }) || screenIdsAfter.some((screenId) => {
      return !screenIdsBefore.includes(screenId);
    });
    
    console.log("[API] /api/yjs/update - After applying update", {
      projectId,
      vectorBefore: vectorBefore,
      vectorAfter: vectorAfter,
      vectorChanged: vectorBefore !== vectorAfter,
      matchesLastVector: vectorAfter === lastVector,
      lastVector: lastVector,
      screenCountBefore,
      screenCountAfter,
      screenIdsBefore,
      screenIdsAfter,
      screensChanged,
      screenDataChanged,
      screenDataBefore,
      screenDataAfter,
    });

    if (vectorAfter === lastVector) {
      console.log("[API] /api/yjs/update - State vector unchanged (update was no-op or already applied), skipping persistence", {
        projectId,
        updateSize: updateBuffer.length,
      });
      return NextResponse.json({ success: true, skipped: true });
    }

    console.log("[API] /api/yjs/update - State vector changed, persisting to database", {
      projectId,
      lastVectorLength: lastVector?.length || 0,
      newVectorLength: vectorAfter.length,
    });

    // Sync to database in the background
    persistYDocToDatabase(projectId, doc)
      .then(() => {
        console.log("[API] /api/yjs/update - Successfully persisted to database", { projectId });
      })
      .catch((error) => {
        console.error(`Error syncing doc to database for project ${projectId}:`, error);
      });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in update route:", error);
    return NextResponse.json({ error: "Failed to process update" }, { status: 500 });
  }
}
