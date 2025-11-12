import * as Y from "yjs";
import { IndexeddbPersistence } from "y-indexeddb";

export type YjsConnectionState = "connecting" | "connected" | "disconnected";

export interface YjsProviderConfig {
  projectId: string;
  userId?: string;
  sseUrl?: string;
}

class YjsProvider {
  private doc: Y.Doc;
  private indexeddbProvider: IndexeddbPersistence | null = null;
  private sseEventSource: EventSource | null = null;
  private projectId: string;
  private userId?: string;
  private sseUrl?: string;
  private connectionState: YjsConnectionState = "disconnected";
  private connectionStateListeners: Set<(state: YjsConnectionState) => void> = new Set();
  private updateQueue: Uint8Array[] = [];
  private isConnected = false;

  constructor(config: YjsProviderConfig) {
    this.projectId = config.projectId;
    this.userId = config.userId;
    this.sseUrl = config.sseUrl;
    this.doc = new Y.Doc();

    // Setup IndexedDB provider for offline persistence
    this.indexeddbProvider = new IndexeddbPersistence(
      `yjs-project-${config.projectId}`,
      this.doc,
    );

    // Setup SSE for receiving updates (one-way from server)
    if (config.sseUrl && typeof window !== "undefined") {
      this.connect();
    }

    // Handle online/offline events
    if (typeof window !== "undefined") {
      window.addEventListener("online", () => {
        if (!this.isConnected && this.sseUrl) {
          this.connect();
        }
      });

      window.addEventListener("offline", () => {
        this.disconnect();
      });
    }

    // Listen to document updates and send them to server via HTTP POST
    // Only send updates that originate from user actions, not from:
    // - SSE (server updates)
    // - IndexedDB (local persistence)
    // - Initial state loading
    this.doc.on("update", (update: Uint8Array, origin: unknown) => {
      // Don't send updates that came from:
      // - "sse" - server updates via SSE
      // - "indexeddb" - IndexedDB persistence
      // - undefined/null - initial state loading
      if (origin && origin !== "sse" && origin !== "indexeddb") {
        this.sendUpdateToServer(update);
      }
    });
  }

  private connect(): void {
    if (!this.sseUrl || this.isConnected) return;

    this.connectionState = "connecting";
    this.notifyConnectionStateListeners();

    // Handle both absolute and relative URLs
    const baseUrl = this.sseUrl.startsWith("http") ? this.sseUrl : `${window.location.origin}${this.sseUrl}`;
    const url = new URL(baseUrl);
    url.searchParams.set("projectId", this.projectId);
    if (this.userId) {
      url.searchParams.set("userId", this.userId);
    }

    try {
      const eventSource = new EventSource(url.toString());
      this.sseEventSource = eventSource;

      eventSource.onopen = () => {
        this.isConnected = true;
        this.connectionState = "connected";
        this.notifyConnectionStateListeners();

        // Send any queued updates
        if (this.updateQueue.length > 0) {
          this.updateQueue.forEach((update) => this.sendUpdateToServer(update));
          this.updateQueue = [];
        }
      };

      eventSource.onerror = () => {
        this.isConnected = false;
        this.connectionState = "disconnected";
        this.notifyConnectionStateListeners();
      };

      eventSource.addEventListener("yjs-update", (event: MessageEvent) => {
        try {
          // Decode base64 update
          const update = Uint8Array.from(atob(event.data), (c) => c.charCodeAt(0));
          // Apply update with "sse" origin to prevent sending it back
          Y.applyUpdate(this.doc, update, "sse");
        } catch (error) {
          console.error("Error applying Yjs update from SSE:", error);
        }
      });

      // Note: yjs-state event sends a state vector, not an update
      // We ignore it since we already receive the full state as an update via yjs-update
      // State vectors are used for diff-based syncing, but we use full state updates instead
    } catch (error) {
      console.error("Error connecting to SSE:", error);
      this.connectionState = "disconnected";
      this.notifyConnectionStateListeners();
    }
  }

  private async sendUpdateToServer(update: Uint8Array): Promise<void> {
    if (!this.sseUrl) return;

    // If not connected, queue the update
    if (!this.isConnected) {
      this.updateQueue.push(update);
      return;
    }

    try {
      // Convert SSE URL to update URL
      const baseUrl = this.sseUrl?.startsWith("http") ? this.sseUrl : `${window.location.origin}${this.sseUrl}`;
      const url = new URL(baseUrl.replace("/sse", "/update"));
      url.searchParams.set("projectId", this.projectId);

      // Encode update as base64
      // Convert Uint8Array to binary string in chunks to avoid stack overflow
      let binaryString = "";
      const chunkSize = 8192; // Process in chunks to avoid call stack overflow
      for (let i = 0; i < update.length; i += chunkSize) {
        const chunk = update.subarray(i, Math.min(i + chunkSize, update.length));
        binaryString += String.fromCharCode.apply(null, Array.from(chunk));
      }
      const base64Update = btoa(binaryString);

      await fetch(url.toString(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ update: base64Update }),
      });
    } catch (error) {
      console.error("Error sending Yjs update to server:", error);
      // Queue for retry
      this.updateQueue.push(update);
    }
  }

  getDoc(): Y.Doc {
    return this.doc;
  }

  getScreensMap(): Y.Map<Y.Map<unknown>> {
    return this.doc.getMap("screens");
  }

  getConnectionState(): YjsConnectionState {
    return this.connectionState;
  }

  onConnectionStateChange(listener: (state: YjsConnectionState) => void): () => void {
    this.connectionStateListeners.add(listener);
    return () => {
      this.connectionStateListeners.delete(listener);
    };
  }

  private notifyConnectionStateListeners(): void {
    this.connectionStateListeners.forEach((listener) => listener(this.connectionState));
  }

  disconnect(): void {
    if (this.sseEventSource) {
      this.sseEventSource.close();
      this.sseEventSource = null;
    }
    this.isConnected = false;
    this.connectionState = "disconnected";
    this.notifyConnectionStateListeners();
  }

  destroy(): void {
    this.disconnect();
    this.indexeddbProvider?.destroy();
    this.doc.destroy();
    this.connectionStateListeners.clear();
    this.updateQueue = [];
  }
}

// Singleton instance per project
const providers = new Map<string, YjsProvider>();

export function getYjsProvider(config: YjsProviderConfig): YjsProvider {
  const key = config.projectId;
  if (!providers.has(key)) {
    providers.set(key, new YjsProvider(config));
  }
  return providers.get(key)!;
}

export function destroyYjsProvider(projectId: string): void {
  const provider = providers.get(projectId);
  if (provider) {
    provider.destroy();
    providers.delete(projectId);
  }
}

// Helper functions to convert between Yjs types and our types
export function screenDataToYjs(screenData: {
  id: string;
  conversationPoints: Array<{
    prompt: string;
    html: string;
    title: string | null;
    timestamp: number;
    arrows?: Array<{ overlayIndex: number; targetScreenId: string; startPoint?: { x: number; y: number } }>;
  }>;
  position?: { x: number; y: number };
  height?: number;
}): Y.Map<unknown> {
  const yScreen = new Y.Map();
  yScreen.set("id", screenData.id);
  yScreen.set("position", screenData.position || null);
  yScreen.set("height", screenData.height || null);

  const yConversationPoints = new Y.Array();
  screenData.conversationPoints.forEach((point) => {
    const yPoint = new Y.Map();
    yPoint.set("prompt", point.prompt);
    yPoint.set("html", point.html);
    yPoint.set("title", point.title || null);
    yPoint.set("timestamp", point.timestamp);
    yPoint.set("arrows", point.arrows || []);
    yConversationPoints.push([yPoint]);
  });
  yScreen.set("conversationPoints", yConversationPoints);

  return yScreen;
}

export function yjsToScreenData(yScreen: Y.Map<unknown>): {
  id: string;
  conversationPoints: Array<{
    prompt: string;
    html: string;
    title: string | null;
    timestamp: number;
    arrows?: Array<{ overlayIndex: number; targetScreenId: string; startPoint?: { x: number; y: number } }>;
  }>;
  position?: { x: number; y: number };
  height?: number;
  selectedPromptIndex?: number | null;
} {
  const id = yScreen.get("id") as string;
  const position = (yScreen.get("position") as { x: number; y: number } | null) || undefined;
  const height = (yScreen.get("height") as number | null) || undefined;
  const selectedPromptIndex = (yScreen.get("selectedPromptIndex") as number | null | undefined) ?? null;
  const yConversationPoints = yScreen.get("conversationPoints") as Y.Array<Y.Map<unknown>>;

  const conversationPoints = yConversationPoints.map((yPoint) => {
    return {
      prompt: yPoint.get("prompt") as string,
      html: yPoint.get("html") as string,
      title: (yPoint.get("title") as string | null) || null,
      timestamp: yPoint.get("timestamp") as number,
      arrows: (yPoint.get("arrows") as Array<{ overlayIndex: number; targetScreenId: string; startPoint?: { x: number; y: number } }> | null) || undefined,
    };
  });

  return {
    id,
    conversationPoints,
    position,
    height,
    selectedPromptIndex,
  };
}
