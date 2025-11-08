import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import { readFileSync } from "fs";
import { join } from "path";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    // Check if API key is configured
    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      return NextResponse.json(
        { error: "GOOGLE_GENERATIVE_AI_API_KEY is not configured" },
        { status: 500 }
      );
    }

    // Read GENERATE_UI.md as system prompt
    const generateUIPath = join(process.cwd(), "docs", "GENERATE_UI.md");
    const systemPrompt = readFileSync(generateUIPath, "utf-8");

    // Initialize Gemini model using Vercel AI SDK
    // The API key is automatically read from GOOGLE_GENERATIVE_AI_API_KEY environment variable
    const model = google("gemini-2.5-flash");

    // Generate HTML using Vercel AI SDK
    const { text } = await generateText({
      model,
      system: systemPrompt,
      prompt: prompt,
      temperature: 0.5,
    });

    // Clean up the generated HTML - remove markdown code block markers
    let cleanedHtml = text.trim();

    // Remove leading backticks and optional "html" text
    cleanedHtml = cleanedHtml.replace(/^```html\s*/i, '');
    cleanedHtml = cleanedHtml.replace(/^```\s*/, '');
    cleanedHtml = cleanedHtml.replace(/^`\s*/, '');

    // Remove trailing backticks
    cleanedHtml = cleanedHtml.replace(/\s*```$/, '');
    cleanedHtml = cleanedHtml.replace(/\s*`$/, '');

    // Trim again after cleanup
    cleanedHtml = cleanedHtml.trim();

    return NextResponse.json({ html: cleanedHtml });
  } catch (error) {
    console.error("Error generating UI:", error);
    return NextResponse.json(
      { error: "Failed to generate UI" },
      { status: 500 }
    );
  }
}

