// import { openai } from "@ai-sdk/openai";
// import { google } from "@ai-sdk/google";
import { createGatewayProvider } from "@ai-sdk/gateway";
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
  // Check if OIDC token is configured (Vercel AI Gateway uses OIDC authentication)
  // In production/preview: Vercel automatically provides the token via headers (handled by gateway provider)
  // In local development: Token must be in VERCEL_OIDC_TOKEN environment variable
  const isVercelProduction = process.env.VERCEL === "1";
  const oidcToken = process.env.VERCEL_OIDC_TOKEN;

  // Only check for token in local development (not in Vercel production/preview)
  if (!isVercelProduction && !oidcToken) {
    throw new Error(
      `VERCEL_OIDC_TOKEN is not configured. Vercel AI Gateway requires OIDC authentication.\n` +
        `To fix this:\n` +
        `1. If using 'vercel dev': The token is automatically obtained and refreshed\n` +
        `2. If using your own dev server: Run 'vercel env pull' to fetch the token\n` +
        `3. The token expires every 12 hours, so you may need to run 'vercel env pull' again\n` +
        `4. Make sure OIDC is enabled in your Vercel project settings (enabled by default for new projects)`,
    );
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

  // Initialize model using Vercel AI Gateway with Google Gemini model
  // Vercel AI Gateway uses OIDC token authentication (VERCEL_OIDC_TOKEN)
  // The token is automatically used if available in environment variables
  const gatewayProvider = createGatewayProvider({
    // OIDC token is automatically read from VERCEL_OIDC_TOKEN env var
    // No need to explicitly pass it - the gateway provider will use it automatically
  });
  const model = gatewayProvider("google/gemini-2.5-flash");

  // Define the Unsplash image search tool
  const findUnsplashImageTool = tool({
    description:
      "Search Unsplash for images matching a query string. Returns a medium-resolution image URL that can be used in HTML img tags. Always provide a descriptive query string.",
    // OpenAI/AI SDK v5 uses inputSchema
    inputSchema: z.object({
      query: z
        .string()
        .min(1)
        .describe(
          "The search query to find matching images on Unsplash (required, must be a non-empty string)",
        ),
    }),
    // Google/AI SDK v4 used parameters (commented out for reference)
    // parameters: z.object({
    //   query: z
    //     .string()
    //     .min(1)
    //     .describe(
    //       "The search query to find matching images on Unsplash (required, must be a non-empty string)",
    //     ),
    // }),
    execute: async (args: { query: string }) => {
      // Validate query parameter
      if (!args.query || typeof args.query !== "string" || args.query.trim().length === 0) {
        const error = "Query parameter is required and must be a non-empty string";
        console.error(`[Tool Call] findUnsplashImage - Error: ${error}`);
        throw new Error(error);
      }
      return await findUnsplashImage(args.query);
    },
  });

  // Generate HTML using Vercel AI SDK with conversation history and tools
  let text: string;
  const requestStartTime = Date.now();
  
  try {
    const generateStartTime = Date.now();
    const result = await generateText({
      model,
      system: systemPrompt,
      prompt: finalPrompt,
      temperature: 0.5,
      tools: {
        findUnsplashImage: findUnsplashImageTool,
      },
    });
    const generateEndTime = Date.now();
    const totalTime = generateEndTime - generateStartTime;
    
    text = result.text;
    
    // Extract timing information
    const thinkingTime = (result as any).thinkingTime || (result as any).reasoningTime || null;
    const usage = (result as any).usage || {};
    
    // Log timing metrics
    console.log("[UI Generation] Timing Metrics:", {
      totalTimeMs: totalTime,
      totalTimeSec: (totalTime / 1000).toFixed(2),
      thinkingTimeMs: thinkingTime,
      thinkingTimeSec: thinkingTime ? (thinkingTime / 1000).toFixed(2) : null,
      promptTokens: usage.promptTokens || "N/A",
      completionTokens: usage.completionTokens || "N/A",
      totalTokens: usage.totalTokens || "N/A",
    });
  } catch (error) {
    // If tool call fails, retry without tools to allow generation to continue
    console.error("Error during generation with tools, retrying without tools:", error);
    const generateStartTime = Date.now();
    const result = await generateText({
      model,
      system: systemPrompt,
      prompt: finalPrompt,
      temperature: 0.5,
      // Retry without tools to allow generation to complete
    });
    const generateEndTime = Date.now();
    const totalTime = generateEndTime - generateStartTime;
    
    text = result.text;
    
    // Extract timing information
    const thinkingTime = (result as any).thinkingTime || (result as any).reasoningTime || null;
    const usage = (result as any).usage || {};
    
    // Log timing metrics
    console.log("[UI Generation] Timing Metrics (retry without tools):", {
      totalTimeMs: totalTime,
      totalTimeSec: (totalTime / 1000).toFixed(2),
      thinkingTimeMs: thinkingTime,
      thinkingTimeSec: thinkingTime ? (thinkingTime / 1000).toFixed(2) : null,
      promptTokens: usage.promptTokens || "N/A",
      completionTokens: usage.completionTokens || "N/A",
      totalTokens: usage.totalTokens || "N/A",
    });
  }
  
  const requestEndTime = Date.now();
  const totalRequestTime = requestEndTime - requestStartTime;
  console.log("[UI Generation] Total Request Time:", {
    totalRequestTimeMs: totalRequestTime,
    totalRequestTimeSec: (totalRequestTime / 1000).toFixed(2),
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
