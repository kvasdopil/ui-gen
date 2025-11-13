import { google } from "@ai-sdk/google";
import { generateText, tool } from "ai";
import { z } from "zod";
import { GENERATE_UI_PROMPT } from "@/prompts/generate-ui";

type HistoryItem = {
  type: "user" | "assistant";
  content: string;
};

// Unsplash API tool function
async function findUnsplashImage(query: string): Promise<string> {
  console.log(`[Tool Call] findUnsplashImage - Input: query="${query}"`);

  try {
    const accessKey = process.env.UNSPLASH_ACCESS_KEY;
    if (!accessKey) {
      const error = "UNSPLASH_ACCESS_KEY is not configured";
      console.error(`[Tool Call] findUnsplashImage - Error: ${error}`);
      throw new Error(error);
    }

    const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=1`;
    const response = await fetch(url, {
      headers: {
        Authorization: `Client-ID ${accessKey}`,
      },
    });

    if (!response.ok) {
      const error = `Unsplash API error: ${response.status} ${response.statusText}`;
      console.error(`[Tool Call] findUnsplashImage - Error: ${error}`);
      throw new Error(error);
    }

    const data = await response.json();

    if (!data.results || data.results.length === 0) {
      const error = `No images found for query: ${query}`;
      console.log(`[Tool Call] findUnsplashImage - Result: ${error}`);
      throw new Error(error);
    }

    const imageUrl = data.results[0].urls.regular;
    console.log(`[Tool Call] findUnsplashImage - Result: Success, image URL="${imageUrl}"`);
    return imageUrl;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[Tool Call] findUnsplashImage - Error: ${errorMessage}`);
    throw error;
  }
}

export async function generateUIFromHistory(history: HistoryItem[]): Promise<string> {
  // Check if API keys are configured
  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    throw new Error("GOOGLE_GENERATIVE_AI_API_KEY is not configured");
  }

  if (!process.env.UNSPLASH_ACCESS_KEY) {
    throw new Error("UNSPLASH_ACCESS_KEY is not configured");
  }

  if (!history || !Array.isArray(history) || history.length === 0) {
    throw new Error("History is required and must be a non-empty array");
  }

  // Use GENERATE_UI_PROMPT constant as system prompt
  const systemPrompt = GENERATE_UI_PROMPT;

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

  // Define the Unsplash image search tool
  const findUnsplashImageTool = tool({
    description:
      "Search Unsplash for images matching a query string. Returns a medium-resolution image URL that can be used in HTML img tags.",
    parameters: z.object({
      query: z.string().describe("The search query to find matching images on Unsplash"),
    }),
    execute: async ({ query }) => {
      return await findUnsplashImage(query);
    },
  });

  // Generate HTML using Vercel AI SDK with conversation history and tools
  const { text } = await generateText({
    model,
    system: systemPrompt,
    prompt: finalPrompt,
    temperature: 0.5,
    tools: {
      findUnsplashImage: findUnsplashImageTool,
    },
    maxSteps: 5,
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

  return cleanedHtml;
}

