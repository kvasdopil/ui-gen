import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import { generateUIFromHistory } from "@/lib/ui-generation";

type HistoryItem = {
  type: "user" | "assistant";
  content: string;
};

/**
 * @deprecated This endpoint is deprecated. Use POST /api/screens/:id/dialog instead.
 * This endpoint is kept for backward compatibility during migration.
 */
export async function POST(request: NextRequest) {
  try {
    // Check for authenticated session
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { history } = await request.json();

    if (!history || !Array.isArray(history) || history.length === 0) {
      return NextResponse.json(
        { error: "History is required and must be a non-empty array" },
        { status: 400 },
      );
    }

    const generationResult = await generateUIFromHistory(history as HistoryItem[]);
    const html = generationResult.html;

    return NextResponse.json({
      html,
      deprecation: "This endpoint is deprecated. Use POST /api/screens/:id/dialog instead.",
    });
  } catch (error) {
    console.error("Error generating UI:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to generate UI";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
