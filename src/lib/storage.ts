import { openDB, DBSchema, IDBPDatabase } from "idb";
import type { ScreenData } from "./types";
import { getYjsProvider, screenDataToYjs, yjsToScreenData } from "./yjs-provider";
import * as Y from "yjs";

export type ViewportTransform = {
  x: number;
  y: number;
  scale: number;
};

interface UIDatabase extends DBSchema {
  screens: {
    key: string;
    value: ScreenData[];
  };
  viewportTransform: {
    key: string;
    value: ViewportTransform;
  };
  pendingPrompt: {
    key: string;
    value: {
      prompt: string;
      screenId: string | null;
      position: { x: number; y: number } | null;
    };
  };
}

export interface Storage {
  saveScreens(screens: ScreenData[]): Promise<void>;
  loadScreens(): Promise<ScreenData[]>;
  clearScreens(): Promise<void>;
  saveViewportTransform(transform: ViewportTransform): Promise<void>;
  loadViewportTransform(): Promise<ViewportTransform | null>;
  savePendingPrompt(
    prompt: string,
    screenId: string | null,
    position: { x: number; y: number } | null,
  ): Promise<void>;
  loadPendingPrompt(): Promise<{
    prompt: string;
    screenId: string | null;
    position: { x: number; y: number } | null;
  } | null>;
  clearPendingPrompt(): Promise<void>;
}

class IdbStorage implements Storage {
  private dbName = "ui-gen-db";
  private dbVersion = 3;
  private db: IDBPDatabase<UIDatabase> | null = null;

  private async getDB(): Promise<IDBPDatabase<UIDatabase>> {
    if (this.db) {
      return this.db;
    }

    this.db = await openDB<UIDatabase>(this.dbName, this.dbVersion, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("screens")) {
          db.createObjectStore("screens");
        }
        if (!db.objectStoreNames.contains("viewportTransform")) {
          db.createObjectStore("viewportTransform");
        }
        if (!db.objectStoreNames.contains("pendingPrompt")) {
          db.createObjectStore("pendingPrompt");
        }
      },
    });

    return this.db;
  }

  async saveScreens(screens: ScreenData[]): Promise<void> {
    try {
      const db = await this.getDB();
      await db.put("screens", screens, "all");
    } catch (error) {
      console.error("Error saving screens to IndexedDB:", error);
      throw error;
    }
  }

  async loadScreens(): Promise<ScreenData[]> {
    try {
      const db = await this.getDB();
      const screens = await db.get("screens", "all");
      return screens || [];
    } catch (error) {
      console.error("Error loading screens from IndexedDB:", error);
      return [];
    }
  }

  async clearScreens(): Promise<void> {
    try {
      const db = await this.getDB();
      await db.delete("screens", "all");
    } catch (error) {
      console.error("Error clearing screens from IndexedDB:", error);
      throw error;
    }
  }

  async saveViewportTransform(transform: ViewportTransform): Promise<void> {
    try {
      const db = await this.getDB();
      await db.put("viewportTransform", transform, "current");
    } catch (error) {
      console.error("Error saving viewport transform to IndexedDB:", error);
      throw error;
    }
  }

  async loadViewportTransform(): Promise<ViewportTransform | null> {
    try {
      const db = await this.getDB();
      const transform = await db.get("viewportTransform", "current");
      return transform || null;
    } catch (error) {
      console.error("Error loading viewport transform from IndexedDB:", error);
      return null;
    }
  }

  async savePendingPrompt(
    prompt: string,
    screenId: string | null,
    position: { x: number; y: number } | null,
  ): Promise<void> {
    try {
      const db = await this.getDB();
      await db.put("pendingPrompt", { prompt, screenId, position }, "current");
    } catch (error) {
      console.error("Error saving pending prompt to IndexedDB:", error);
      throw error;
    }
  }

  async loadPendingPrompt(): Promise<{
    prompt: string;
    screenId: string | null;
    position: { x: number; y: number } | null;
  } | null> {
    try {
      const db = await this.getDB();
      const pending = await db.get("pendingPrompt", "current");
      return pending || null;
    } catch (error) {
      console.error("Error loading pending prompt from IndexedDB:", error);
      return null;
    }
  }

  async clearPendingPrompt(): Promise<void> {
    try {
      const db = await this.getDB();
      await db.delete("pendingPrompt", "current");
    } catch (error) {
      console.error("Error clearing pending prompt from IndexedDB:", error);
      throw error;
    }
  }
}

// Yjs-integrated storage that syncs screens via Yjs while keeping IndexedDB for offline support
class YjsStorage implements Storage {
  public idbStorage: IdbStorage;
  private projectId: string;
  private userId?: string;
  private sseUrl?: string;
  private yjsProvider: ReturnType<typeof getYjsProvider> | null = null;
  private screensMap: Y.Map<Y.Map<unknown>> | null = null;
  private isInitialized = false;
  private initializationPromise: Promise<void> | null = null;

  constructor(projectId: string = "default", userId?: string, sseUrl?: string) {
    this.idbStorage = new IdbStorage();
    this.projectId = projectId;
    this.userId = userId;
    this.sseUrl = sseUrl;
  }

  private async initialize(): Promise<void> {
    if (this.isInitialized) return;
    if (this.initializationPromise) return this.initializationPromise;

    this.initializationPromise = (async () => {
      // Initialize Yjs provider
      this.yjsProvider = getYjsProvider({
        projectId: this.projectId,
        userId: this.userId,
        sseUrl: this.sseUrl,
      });

      this.screensMap = this.yjsProvider.getScreensMap();

      // Load initial screens from IndexedDB and sync to Yjs
      const idbScreens = await this.idbStorage.loadScreens();
      if (idbScreens.length > 0 && this.screensMap && this.screensMap.doc) {
        // Sync IndexedDB screens to Yjs (only on first load)
        // Use "indexeddb" origin to prevent sending these updates to server
        this.screensMap.doc.transact(() => {
          idbScreens.forEach((screen) => {
            const yScreen = screenDataToYjs(screen);
            this.screensMap!.set(screen.id, yScreen);
          });
        }, "indexeddb");
      }

      this.isInitialized = true;
    })();

    return this.initializationPromise;
  }

  async saveScreens(screens: ScreenData[]): Promise<void> {
    await this.initialize();

    // Save to IndexedDB for offline support
    await this.idbStorage.saveScreens(screens);

    // Sync to Yjs (only completed screens with HTML)
    // Note: This is called from the save effect, which should not trigger server updates
    // The actual user actions are handled in page.tsx with "user-action" origin
    if (this.screensMap && this.screensMap.doc) {
      this.screensMap.doc.transact(() => {
        screens.forEach((screen) => {
          // Only sync screens that have at least one completed conversation point
          const hasCompletedPoints = screen.conversationPoints.some((point) => point.html && point.html.trim().length > 0);
          if (hasCompletedPoints) {
            const yScreen = screenDataToYjs(screen);
            this.screensMap!.set(screen.id, yScreen);
          } else {
            // Remove incomplete screens from Yjs
            this.screensMap!.delete(screen.id);
          }
        });
      }, "indexeddb");
    }
  }

  async loadScreens(): Promise<ScreenData[]> {
    await this.initialize();

    // Try to load from Yjs first (if available and has data)
    if (this.screensMap && this.screensMap.size > 0) {
      const screens: ScreenData[] = [];
      this.screensMap.forEach((yScreen: Y.Map<unknown>) => {
        try {
          const screenData = yjsToScreenData(yScreen);
          // Add selectedPromptIndex if missing (client-side state)
          const fullScreenData: ScreenData = {
            ...screenData,
            selectedPromptIndex: screenData.selectedPromptIndex ?? null,
          };
          screens.push(fullScreenData);
        } catch (error: unknown) {
          console.error("Error converting Yjs screen to ScreenData:", error);
        }
      });
      if (screens.length > 0) {
        // Also save to IndexedDB for offline support
        await this.idbStorage.saveScreens(screens);
        return screens;
      }
    }

    // Fallback to IndexedDB
    return this.idbStorage.loadScreens();
  }

  async clearScreens(): Promise<void> {
    await this.initialize();
    await this.idbStorage.clearScreens();
    if (this.screensMap && this.screensMap.doc) {
      this.screensMap.doc.transact(() => {
        this.screensMap!.forEach((_, screenId) => {
          this.screensMap!.delete(screenId);
        });
      }, "user-action");
    }
  }

  // Viewport transform is NOT synced via Yjs (client-side only)
  async saveViewportTransform(transform: ViewportTransform): Promise<void> {
    return this.idbStorage.saveViewportTransform(transform);
  }

  async loadViewportTransform(): Promise<ViewportTransform | null> {
    return this.idbStorage.loadViewportTransform();
  }

  // Pending prompts are NOT synced via Yjs (client-side only)
  async savePendingPrompt(
    prompt: string,
    screenId: string | null,
    position: { x: number; y: number } | null,
  ): Promise<void> {
    return this.idbStorage.savePendingPrompt(prompt, screenId, position);
  }

  async loadPendingPrompt(): Promise<{
    prompt: string;
    screenId: string | null;
    position: { x: number; y: number } | null;
  } | null> {
    return this.idbStorage.loadPendingPrompt();
  }

  async clearPendingPrompt(): Promise<void> {
    return this.idbStorage.clearPendingPrompt();
  }

  // Get Yjs provider for subscribing to changes
  getYjsProvider() {
    return this.yjsProvider;
  }

  // Get screens map for direct Yjs access
  getScreensMap() {
    return this.screensMap;
  }
}

// Export default storage instance
// For now, use YjsStorage with default project
// In the future, this could be initialized with user session info
// SSE URL defaults to /api/yjs/sse if not specified
const sseUrl =
  typeof window !== "undefined"
    ? process.env.NEXT_PUBLIC_YJS_SSE_URL || "/api/yjs/sse"
    : undefined;

export const storage: Storage = new YjsStorage("default", undefined, sseUrl);
