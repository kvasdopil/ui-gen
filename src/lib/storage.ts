import { openDB, DBSchema, IDBPDatabase } from "idb";
import type { ScreenData } from "./types";

export type ViewportTransform = {
  x: number;
  y: number;
  scale: number;
};

interface UIDatabase extends DBSchema {
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
  saveScreen(screen: ScreenData): Promise<void>;
  loadScreens(): Promise<ScreenData[]>;
  clearScreens(): Promise<void>;
  deleteScreen(screenId: string): Promise<void>;
  deleteDialogEntry(screenId: string, dialogId: string): Promise<void>;
  updateDialogEntryArrows(
    screenId: string,
    dialogId: string,
    arrows: Array<{
      touchableId: string;
      targetScreenId: string;
      startPoint?: { x: number; y: number };
    }>,
  ): Promise<void>;
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

class ApiStorage implements Storage {
  private dbName = "ui-gen-db";
  private dbVersion = 2;
  private db: IDBPDatabase<UIDatabase> | null = null;

  private async getDB(): Promise<IDBPDatabase<UIDatabase>> {
    if (this.db) {
      return this.db;
    }

    this.db = await openDB<UIDatabase>(this.dbName, this.dbVersion, {
      upgrade(db) {
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
      // Save screens to API - update each screen individually
      for (const screen of screens) {
        if (screen.id && screen.position) {
          // Update screen position and selectedPromptIndex
          const response = await fetch(`/api/screens/${screen.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              x: screen.position.x,
              y: screen.position.y,
              selectedPromptIndex: screen.selectedPromptIndex,
            }),
          });

          if (!response.ok) {
            console.error(`Error updating screen ${screen.id}:`, await response.text());
          }
        }
      }
    } catch (error) {
      console.error("Error saving screens to API:", error);
      throw error;
    }
  }

  async saveScreen(screen: ScreenData): Promise<void> {
    try {
      if (screen.id && screen.position) {
        // Update screen position and selectedPromptIndex
        const response = await fetch(`/api/screens/${screen.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            x: screen.position.x,
            y: screen.position.y,
            selectedPromptIndex: screen.selectedPromptIndex,
          }),
        });

        if (!response.ok) {
          console.error(`Error updating screen ${screen.id}:`, await response.text());
        }
      }
    } catch (error) {
      console.error("Error saving screen to API:", error);
      throw error;
    }
  }

  async loadScreens(): Promise<ScreenData[]> {
    try {
      const response = await fetch("/api/screens");
      if (!response.ok) {
        if (response.status === 401) {
          // Not authenticated, return empty array
          return [];
        }
        throw new Error(`Failed to load screens: ${response.statusText}`);
      }
      const screens = await response.json();
      return screens || [];
    } catch (error) {
      console.error("Error loading screens from API:", error);
      return [];
    }
  }

  async clearScreens(): Promise<void> {
    try {
      // Load all screens and delete them
      const screens = await this.loadScreens();
      for (const screen of screens) {
        await this.deleteScreen(screen.id);
      }
    } catch (error) {
      console.error("Error clearing screens:", error);
      throw error;
    }
  }

  async deleteScreen(screenId: string): Promise<void> {
    try {
      const response = await fetch(`/api/screens/${screenId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Error deleting screen ${screenId}:`, errorText);
        throw new Error(`Failed to delete screen: ${errorText}`);
      }
    } catch (error) {
      console.error("Error deleting screen:", error);
      throw error;
    }
  }

  async deleteDialogEntry(screenId: string, dialogId: string): Promise<void> {
    try {
      const response = await fetch(`/api/screens/${screenId}/dialog/${dialogId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Error deleting dialog entry ${dialogId}:`, errorText);
        throw new Error(`Failed to delete dialog entry: ${errorText}`);
      }
    } catch (error) {
      console.error("Error deleting dialog entry:", error);
      throw error;
    }
  }

  async updateDialogEntryArrows(
    screenId: string,
    dialogId: string,
    arrows: Array<{
      touchableId: string;
      targetScreenId: string;
      startPoint?: { x: number; y: number };
    }>,
  ): Promise<void> {
    try {
      const response = await fetch(`/api/screens/${screenId}/dialog/${dialogId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ arrows }),
      });
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Error updating dialog entry arrows ${dialogId}:`, errorText);
        throw new Error(`Failed to update dialog entry arrows: ${errorText}`);
      }
    } catch (error) {
      console.error("Error updating dialog entry arrows:", error);
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

// Export default storage instance
export const storage: Storage = new ApiStorage();
