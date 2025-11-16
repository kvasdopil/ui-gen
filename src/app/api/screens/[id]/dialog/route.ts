import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createDialogSchema } from "@/lib/validations";
import { generateUIFromHistory } from "@/lib/ui-generation";
import crypto from "crypto";

// Helper function to extract title from HTML
function extractTitle(html: string): string | null {
  const titleMatch = html.match(/<!--\s*Title:\s*(.+?)\s*-->/i);
  return titleMatch ? titleMatch[1].trim() : null;
}

// Convert dialog entries to history format for UI generation
function dialogEntriesToHistory(
  dialogEntries: Array<{ prompt: string; html: string | null }>,
): Array<{ type: "user" | "assistant"; content: string }> {
  const history: Array<{ type: "user" | "assistant"; content: string }> = [];
  for (const entry of dialogEntries) {
    history.push({ type: "user", content: entry.prompt });
    if (entry.html) {
      history.push({ type: "assistant", content: entry.html });
    }
  }
  return history;
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthenticatedUser();
    if (!user.email) {
      return NextResponse.json({ error: "Email not found in session" }, { status: 401 });
    }
    const { id } = await params;
    const userId = crypto.createHash("sha256").update(user.email.toLowerCase().trim()).digest("hex");

    // Get screen and verify it belongs to the user
    const screen = await prisma.screen.findFirst({
      where: {
        id,
        workspace: {
          userId,
        },
      },
    });

    if (!screen) {
      return NextResponse.json({ error: "Screen not found" }, { status: 404 });
    }

    const dialogEntries = await prisma.dialogEntry.findMany({
      where: {
        screenId: id,
      },
      orderBy: {
        timestamp: "asc",
      },
    });

    const entries = dialogEntries.map((entry) => ({
      id: entry.id,
      prompt: entry.prompt,
      html: entry.html || "",
      title: entry.title,
      timestamp: Number(entry.timestamp),
      arrows:
        ((entry as { arrows?: unknown }).arrows as Array<{
          touchableId: string;
          targetScreenId: string;
          startPoint?: { x: number; y: number };
        }>) || [],
    }));

    return NextResponse.json(entries);
  } catch (error) {
    console.error("Error fetching dialog entries:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to fetch dialog entries";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthenticatedUser();
    if (!user.email) {
      return NextResponse.json({ error: "Email not found in session" }, { status: 401 });
    }
    const { id } = await params;
    const userId = crypto.createHash("sha256").update(user.email.toLowerCase().trim()).digest("hex");

    // Get screen and verify it belongs to the user
    const screen = await prisma.screen.findFirst({
      where: {
        id,
        workspace: {
          userId,
        },
      },
      include: {
        dialogEntries: {
          orderBy: {
            timestamp: "asc",
          },
        },
      },
    });

    if (!screen) {
      return NextResponse.json({ error: "Screen not found" }, { status: 404 });
    }

    const body = await request.json();
    const validatedData = createDialogSchema.parse(body);

    // Build history from existing dialog entries
    const history = dialogEntriesToHistory(screen.dialogEntries);
    // Add the new prompt
    history.push({ type: "user", content: validatedData.prompt });

    // Generate HTML from the full conversation history
    const html = await generateUIFromHistory(history);
    const title = extractTitle(html);

    // Create dialog entry
    const dialogEntry = await prisma.dialogEntry.create({
      data: {
        screenId: id,
        prompt: validatedData.prompt,
        html,
        title,
        timestamp: BigInt(Date.now()),
      },
    });

    return NextResponse.json(
      {
        id: dialogEntry.id,
        prompt: dialogEntry.prompt,
        html: dialogEntry.html || "",
        title: dialogEntry.title,
        timestamp: Number(dialogEntry.timestamp),
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating dialog entry:", error);
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Invalid request data", details: error }, { status: 400 });
    }
    const errorMessage = error instanceof Error ? error.message : "Failed to create dialog entry";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
