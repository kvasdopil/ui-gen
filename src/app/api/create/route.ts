import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import { readFileSync } from "fs";
import { join } from "path";
import { NextRequest, NextResponse } from "next/server";

type HistoryItem = {
  type: "user" | "assistant";
  content: string;
};

export async function POST(request: NextRequest) {
  try {
    const { history } = await request.json();

    if (!history || !Array.isArray(history) || history.length === 0) {
      return NextResponse.json(
        { error: "History is required and must be a non-empty array" },
        { status: 400 },
      );
    }

    // Check if API key is configured
    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      return NextResponse.json(
        { error: "GOOGLE_GENERATIVE_AI_API_KEY is not configured" },
        { status: 500 },
      );
    }

    // Read GENERATE_UI.md as system prompt
    const generateUIPath = join(process.cwd(), "docs", "GENERATE_UI.md");
    const systemPrompt = readFileSync(generateUIPath, "utf-8");

    // Format conversation history for the LLM
    // Build a comprehensive prompt that includes all conversation history
    let conversationPrompt = "";

    for (let i = 0; i < history.length; i++) {
      const item = history[i] as HistoryItem;
      if (item.type === "user") {
        if (i === 0) {
          // First user prompt
          conversationPrompt += `User request: ${item.content}\n\n`;
        } else {
          // Subsequent user prompts (modifications)
          conversationPrompt += `\n---\n\nUser modification request: ${item.content}\n\n`;
        }
      } else if (item.type === "assistant") {
        // Previous generated HTML
        conversationPrompt += `Previously generated UI HTML:\n${item.content}\n\n`;
      }
    }

    // Get the last user message as the main prompt
    const lastUserMessage = history
      .slice()
      .reverse()
      .find((item) => (item as HistoryItem).type === "user");

    const finalPrompt = lastUserMessage
      ? conversationPrompt +
      `Based on the above conversation history, please generate a new UI that addresses the user's latest request: "${lastUserMessage.content}"`
      : conversationPrompt;

    // Initialize Gemini model using Vercel AI SDK
    // The API key is automatically read from GOOGLE_GENERATIVE_AI_API_KEY environment variable
    const model = google("gemini-2.5-flash");

    // Generate HTML using Vercel AI SDK with conversation history
    const { text } = await generateText({
      model,
      system: systemPrompt,
      prompt: finalPrompt,
      temperature: 0.5,
    });

    // Clean up the generated HTML - remove markdown code block markers
    let cleanedHtml = text.trim();

    // Remove leading backticks and optional "html" text
    cleanedHtml = cleanedHtml.replace(/^```html\s*/i, "");
    cleanedHtml = cleanedHtml.replace(/^```\s*/, "");
    cleanedHtml = cleanedHtml.replace(/^`\s*/, "");

    // Remove trailing backticks
    cleanedHtml = cleanedHtml.replace(/\s*```$/, "");
    cleanedHtml = cleanedHtml.replace(/\s*`$/, "");

    // Trim again after cleanup
    cleanedHtml = cleanedHtml.trim();

    return NextResponse.json({ html: cleanedHtml });
  } catch (error) {
    console.error("Error generating UI:", error);
    return NextResponse.json({ error: "Failed to generate UI" }, { status: 500 });
  }
}
