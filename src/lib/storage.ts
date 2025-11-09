import { openDB, DBSchema, IDBPDatabase } from "idb";
import type { ScreenData } from "./types";

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
}

export interface Storage {
  saveScreens(screens: ScreenData[]): Promise<void>;
  loadScreens(): Promise<ScreenData[]>;
  clearScreens(): Promise<void>;
  saveViewportTransform(transform: ViewportTransform): Promise<void>;
  loadViewportTransform(): Promise<ViewportTransform | null>;
}

class IdbStorage implements Storage {
  private dbName = "ui-gen-db";
  private dbVersion = 2;
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
}

// Export default storage instance
export const storage: Storage = new IdbStorage();
