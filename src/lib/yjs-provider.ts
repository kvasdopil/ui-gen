import * as Y from "yjs";
import { IndexeddbPersistence } from "y-indexeddb";

export type YjsConnectionState = "connecting" | "connected" | "disconnected";
export type YjsSyncState = "synced" | "syncing" | "offline" | "error";

export type YjsStatusSnapshot = {
  syncState: YjsSyncState;
  connectionState: YjsConnectionState;
  hasPendingUpdates: boolean;
  pendingUpdateCount: number;
  offlineUpdateCount: number;
  lastError: string | null;
  hasReceivedInitialState: boolean;
  isBrowserOnline: boolean;
};

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
  private statusListeners: Set<(snapshot: YjsStatusSnapshot) => void> = new Set();
  private offlineUpdateQueue: Uint8Array[] = [];
  private pendingUpdateQueue: Uint8Array[] = [];
  private pendingFlushTimeout: number | null = null;
  private isConnected = false;
  private hasReceivedInitialState = false;
  private stateSyncPromise: Promise<void> | null = null;
  private lastError: string | null = null;
  public isProcessingServerUpdate = false; // Exposed to allow clients to check if server update is in progress
  private statusSnapshot: YjsStatusSnapshot = {
    syncState: "offline",
    connectionState: "disconnected",
    hasPendingUpdates: false,
    pendingUpdateCount: 0,
    offlineUpdateCount: 0,
    lastError: null,
    hasReceivedInitialState: false,
    isBrowserOnline: true,
  };

  constructor(config: YjsProviderConfig) {
    this.projectId = config.projectId;
    this.userId = config.userId;
    this.sseUrl = config.sseUrl;
    this.doc = new Y.Doc();

    console.log("[Yjs] Creating YjsProvider", {
      projectId: this.projectId,
      userId: this.userId,
      sseUrl: this.sseUrl,
    });

    this.indexeddbProvider = new IndexeddbPersistence(`yjs-project-${config.projectId}`, this.doc);
    
    // Track IndexedDB persistence events
    this.indexeddbProvider.on("synced", () => {
      console.log("[Yjs] IndexedDB persistence synced");
    });
    
    // Note: IndexeddbPersistence doesn't expose update events directly,
    // but it will trigger doc.on("update") with origin from the persistence layer

    if (config.sseUrl && typeof window !== "undefined") {
      this.connect();
    }

    if (typeof window !== "undefined") {
      window.addEventListener("online", () => {
        if (!this.isConnected && this.sseUrl) {
          this.connect();
        }
        this.updateStatus();
      });

      window.addEventListener("offline", () => {
        this.disconnect();
        this.updateStatus();
      });
    }

    this.doc.on("update", (update: Uint8Array, origin: unknown) => {
      const originStr = String(origin);
      const originType = typeof origin;
      const updateSize = update.length;
      
      // Check if origin is the IndexeddbPersistence instance
      const isIndexeddbPersistence = origin === this.indexeddbProvider;
      
      // Log all update events with detailed information
      console.log("[Yjs] Update event triggered", {
        origin: originStr,
        originType,
        originValue: origin,
        isIndexeddbPersistence,
        updateSize,
        isConnected: this.isConnected,
        hasReceivedInitialState: this.hasReceivedInitialState,
        stackTrace: new Error().stack?.split("\n").slice(1, 6).join("\n"), // First 5 stack frames
      });

      // Filter out updates from:
      // - SSE updates ("sse")
      // - Server sync ("server-sync")
      // - IndexedDB persistence string origin ("indexeddb")
      // - IndexeddbPersistence instance (when it loads from IndexedDB)
      const shouldFilter =
        origin === "sse" ||
        origin === "indexeddb" ||
        origin === "server-sync" ||
        isIndexeddbPersistence;

      if (origin && !shouldFilter) {
        console.log("[Yjs] Enqueueing outgoing update", {
          origin: originStr,
          originType,
          isIndexeddbPersistence,
          updateSize,
          pendingQueueLength: this.pendingUpdateQueue.length,
          offlineQueueLength: this.offlineUpdateQueue.length,
        });
        this.enqueueOutgoingUpdate(update);
      } else {
        console.log("[Yjs] Skipping outgoing update (filtered origin)", {
          origin: originStr,
          originType,
          isIndexeddbPersistence,
          filterReason: shouldFilter
            ? isIndexeddbPersistence
              ? "IndexeddbPersistence instance"
              : origin === "sse"
                ? "SSE"
                : origin === "indexeddb"
                  ? "indexeddb string"
                  : origin === "server-sync"
                    ? "server-sync"
                    : "unknown filter"
            : "no origin",
        });
      }
    });

    this.updateStatus();
  }

  private connect(): void {
    if (!this.sseUrl || this.isConnected || typeof window === "undefined") return;

    this.connectionState = "connecting";
    this.notifyConnectionStateListeners();
    this.updateStatus();

    const baseUrl = this.sseUrl.startsWith("http")
      ? this.sseUrl
      : `${window.location.origin}${this.sseUrl}`;
    const url = new URL(baseUrl);

    try {
      const eventSource = new EventSource(url.toString());
      this.sseEventSource = eventSource;

      eventSource.onopen = () => {
        this.isConnected = true;
        this.connectionState = "connected";
        this.hasReceivedInitialState = false;
        this.lastError = null;
        this.notifyConnectionStateListeners();
        this.updateStatus();
      };

      eventSource.onerror = () => {
        this.isConnected = false;
        this.hasReceivedInitialState = false;
        this.connectionState = "disconnected";
        this.lastError = "Lost connection to sync server";
        this.notifyConnectionStateListeners();
        this.updateStatus();
      };

      eventSource.addEventListener("yjs-update", (event: MessageEvent) => {
        try {
          const update = this.decodeBase64(event.data);
          console.log("[Yjs] Received update from SSE", {
            updateSize: update.length,
            hasReceivedInitialState: this.hasReceivedInitialState,
          });
          // Set flag to indicate we're processing a server update
          // This will be checked by clients to prevent feedback loops
          this.isProcessingServerUpdate = true;
          Y.applyUpdate(this.doc, update, "sse");
          if (!this.hasReceivedInitialState) {
            this.hasReceivedInitialState = true;
            console.log("[Yjs] Received initial state, flushing offline queue");
            void this.flushOfflineQueue();
          }
          // Reset flag after a short delay to allow React to finish processing
          setTimeout(() => {
            this.isProcessingServerUpdate = false;
          }, 100);
          this.updateStatus();
        } catch (error) {
          console.error("Error applying Yjs update from SSE:", error);
          this.lastError = "Failed to apply update from server";
          this.isProcessingServerUpdate = false;
          this.updateStatus();
        }
      });
    } catch (error) {
      console.error("Error connecting to SSE:", error);
      this.connectionState = "disconnected";
      this.lastError = "Unable to connect to sync server";
      this.notifyConnectionStateListeners();
      this.updateStatus();
    }
  }

  private enqueueOutgoingUpdate(update: Uint8Array): void {
    console.log("[Yjs] enqueueOutgoingUpdate called", {
      isConnected: this.isConnected,
      hasReceivedInitialState: this.hasReceivedInitialState,
      updateSize: update.length,
      stackTrace: new Error().stack?.split("\n").slice(1, 6).join("\n"),
    });

    if (!this.isConnected || !this.hasReceivedInitialState) {
      console.log("[Yjs] Adding to offline queue", {
        offlineQueueLength: this.offlineUpdateQueue.length,
      });
      this.offlineUpdateQueue.push(update);
      this.updateStatus();
      return;
    }
    console.log("[Yjs] Adding to pending queue", {
      pendingQueueLength: this.pendingUpdateQueue.length,
    });
    this.pendingUpdateQueue.push(update);
    this.schedulePendingFlush();
    this.updateStatus();
  }

  private schedulePendingFlush(): void {
    if (this.pendingFlushTimeout !== null || typeof window === "undefined") {
      return;
    }
    this.pendingFlushTimeout = window.setTimeout(() => {
      this.pendingFlushTimeout = null;
      void this.flushPendingUpdates();
    }, 150);
  }

  private async flushOfflineQueue(): Promise<void> {
    if (!this.isConnected || !this.hasReceivedInitialState) {
      this.updateStatus();
      return;
    }
    await this.syncWithServerState();
    if (this.offlineUpdateQueue.length > 0) {
      this.pendingUpdateQueue.push(...this.offlineUpdateQueue);
      this.offlineUpdateQueue = [];
      this.schedulePendingFlush();
      this.updateStatus();
    }
  }

  private async flushPendingUpdates(): Promise<void> {
    if (!this.isConnected || this.pendingUpdateQueue.length === 0) {
      this.updateStatus();
      return;
    }

    const updates = this.pendingUpdateQueue.splice(0, this.pendingUpdateQueue.length);
    const mergedUpdate = Y.mergeUpdates(updates);
    await this.sendUpdateToServer(mergedUpdate);
    this.updateStatus();
  }

  private async syncWithServerState(): Promise<void> {
    if (!this.sseUrl || typeof window === "undefined") return;
    if (this.stateSyncPromise) {
      return this.stateSyncPromise;
    }

    const url = this.buildActionUrl("state");
    if (!url) return;

    const vector = this.encodeBase64(Y.encodeStateVector(this.doc));

    this.stateSyncPromise = fetch(url.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        projectId: this.projectId,
        stateVector: vector,
      }),
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`State sync failed with status ${response.status}`);
        }
        const payload: { update?: string } = await response.json();
        if (payload.update) {
          const update = this.decodeBase64(payload.update);
          if (update.length > 0) {
            console.log("[Yjs] Applying update from server-sync", {
              updateSize: update.length,
            });
            // Set flag to indicate we're processing a server update
            this.isProcessingServerUpdate = true;
            Y.applyUpdate(this.doc, update, "server-sync");
            // Reset flag after a short delay to allow React to finish processing
            setTimeout(() => {
              this.isProcessingServerUpdate = false;
            }, 100);
          } else {
            console.log("[Yjs] Server-sync returned empty update");
          }
        } else {
          console.log("[Yjs] Server-sync returned no update");
        }
      })
      .catch((error) => {
        console.error("[Yjs] Failed to sync state vector:", error);
        this.lastError = "State vector sync failed";
        this.updateStatus();
      })
      .finally(() => {
        this.stateSyncPromise = null;
      });

    return this.stateSyncPromise;
  }

  private async sendUpdateToServer(update: Uint8Array): Promise<void> {
    console.log("[Yjs] sendUpdateToServer called", {
      updateSize: update.length,
      base64Size: this.encodeBase64(update).length,
      url: this.buildActionUrl("update")?.toString(),
      stackTrace: new Error().stack?.split("\n").slice(1, 6).join("\n"),
    });

    if (!this.sseUrl || typeof window === "undefined") {
      console.warn("[Yjs] Cannot send update - no SSE URL configured");
      return;
    }
    const url = this.buildActionUrl("update");
    if (!url) return;

    const base64Update = this.encodeBase64(update);

    try {
      console.log("[Yjs] Sending update to server", {
        url: url.toString(),
        updateSize: update.length,
        base64Size: base64Update.length,
      });
      const response = await fetch(url.toString(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ update: base64Update }),
      });

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }
      console.log("[Yjs] Update sent successfully");
      this.lastError = null;
    } catch (error) {
      console.error("[Yjs] Error sending update to server:", error);
      this.offlineUpdateQueue.push(update);
      this.lastError = "Failed to send update";
    } finally {
      this.updateStatus();
    }
  }

  private buildActionUrl(action: "update" | "state"): URL | null {
    if (!this.sseUrl || typeof window === "undefined") return null;
    const baseUrl = this.sseUrl.startsWith("http")
      ? this.sseUrl
      : `${window.location.origin}${this.sseUrl}`;
    const url = new URL(baseUrl);
    if (url.pathname.endsWith("/sse")) {
      url.pathname = url.pathname.replace(/\/sse$/, `/${action}`);
    } else {
      url.pathname = `${url.pathname.replace(/\/$/, "")}/${action}`;
    }
    return url;
  }

  private encodeBase64(data: Uint8Array): string {
    let binaryString = "";
    const chunkSize = 8192;
    for (let i = 0; i < data.length; i += chunkSize) {
      const chunk = data.subarray(i, Math.min(i + chunkSize, data.length));
      binaryString += String.fromCharCode.apply(null, Array.from(chunk));
    }
    return btoa(binaryString);
  }

  private decodeBase64(data: string): Uint8Array {
    const binaryString = atob(data);
    const length = binaryString.length;
    const bytes = new Uint8Array(length);
    for (let i = 0; i < length; i += 1) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
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

  getStatusSnapshot(): YjsStatusSnapshot {
    return this.statusSnapshot;
  }

  onConnectionStateChange(listener: (state: YjsConnectionState) => void): () => void {
    this.connectionStateListeners.add(listener);
    return () => {
      this.connectionStateListeners.delete(listener);
    };
  }

  onStatusChange(listener: (snapshot: YjsStatusSnapshot) => void): () => void {
    this.statusListeners.add(listener);
    // Immediately emit latest snapshot to new listener
    listener(this.statusSnapshot);
    return () => {
      this.statusListeners.delete(listener);
    };
  }

  private notifyConnectionStateListeners(): void {
    this.connectionStateListeners.forEach((listener) => listener(this.connectionState));
  }

  private notifyStatusListeners(): void {
    this.statusListeners.forEach((listener) => listener(this.statusSnapshot));
  }

  private updateStatus(): void {
    const isBrowserOnline = typeof navigator === "undefined" ? true : navigator.onLine;
    const hasPendingUpdates = this.pendingUpdateQueue.length > 0;
    const hasOfflineUpdates = this.offlineUpdateQueue.length > 0;

    let syncState: YjsSyncState = "synced";
    if (!isBrowserOnline) {
      syncState = "offline";
    } else if (this.lastError) {
      syncState = "error";
    } else if (
      this.connectionState === "connecting" ||
      !this.isConnected ||
      !this.hasReceivedInitialState ||
      hasPendingUpdates ||
      hasOfflineUpdates
    ) {
      syncState = "syncing";
    }

    this.statusSnapshot = {
      syncState,
      connectionState: this.connectionState,
      hasPendingUpdates,
      pendingUpdateCount: this.pendingUpdateQueue.length,
      offlineUpdateCount: this.offlineUpdateQueue.length,
      lastError: this.lastError,
      hasReceivedInitialState: this.hasReceivedInitialState,
      isBrowserOnline,
    };

    this.notifyStatusListeners();
  }

  disconnect(): void {
    if (this.sseEventSource) {
      this.sseEventSource.close();
      this.sseEventSource = null;
    }
    if (this.pendingFlushTimeout !== null && typeof window !== "undefined") {
      window.clearTimeout(this.pendingFlushTimeout);
    }
    this.pendingFlushTimeout = null;
    this.isConnected = false;
    this.hasReceivedInitialState = false;
    this.connectionState = "disconnected";
    // Do not reset lastError here; preserve context until next successful sync
    this.notifyConnectionStateListeners();
    this.updateStatus();
  }

  async retrySync(): Promise<void> {
    this.lastError = null;
    this.updateStatus();
    if (!this.isConnected && this.sseUrl) {
      this.connect();
    }
    await this.flushOfflineQueue();
    await this.flushPendingUpdates();
  }

  destroy(): void {
    this.disconnect();
    this.indexeddbProvider?.destroy();
    this.doc.destroy();
    this.connectionStateListeners.clear();
    this.statusListeners.clear();
    this.offlineUpdateQueue = [];
    this.pendingUpdateQueue = [];
    this.updateStatus();
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

export type YjsProviderInstance = ReturnType<typeof getYjsProvider>;

// Helper functions to convert between Yjs types and our types
export function screenDataToYjs(screenData: {
  id: string;
  conversationPoints: Array<{
    prompt: string;
    html: string;
    title: string | null;
    timestamp: number;
    arrows?: Array<{
      overlayIndex: number;
      targetScreenId: string;
      startPoint?: { x: number; y: number };
    }>;
  }>;
  position?: { x: number; y: number };
  height?: number;
  selectedPromptIndex?: number | null;
}): Y.Map<unknown> {
  const yScreen = new Y.Map();
  yScreen.set("id", screenData.id);
  yScreen.set("position", screenData.position || null);
  yScreen.set("height", screenData.height || null);
  yScreen.set("selectedPromptIndex", screenData.selectedPromptIndex ?? null);

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
    arrows?: Array<{
      overlayIndex: number;
      targetScreenId: string;
      startPoint?: { x: number; y: number };
    }>;
  }>;
  position?: { x: number; y: number };
  height?: number;
  selectedPromptIndex?: number | null;
} {
  const id = yScreen.get("id") as string;
  const position = (yScreen.get("position") as { x: number; y: number } | null) || undefined;
  const height = (yScreen.get("height") as number | null) || undefined;
  const selectedPromptIndex =
    (yScreen.get("selectedPromptIndex") as number | null | undefined) ?? null;
  const yConversationPoints = yScreen.get("conversationPoints") as Y.Array<Y.Map<unknown>>;

  const conversationPoints = yConversationPoints.map((yPoint) => {
    return {
      prompt: yPoint.get("prompt") as string,
      html: yPoint.get("html") as string,
      title: (yPoint.get("title") as string | null) || null,
      timestamp: yPoint.get("timestamp") as number,
      arrows:
        (yPoint.get("arrows") as Array<{
          overlayIndex: number;
          targetScreenId: string;
          startPoint?: { x: number; y: number };
        }> | null) || undefined,
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
