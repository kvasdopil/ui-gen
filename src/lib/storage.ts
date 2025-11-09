import { openDB, DBSchema, IDBPDatabase } from "idb";
import type { ScreenData } from "./types";

interface UIDatabase extends DBSchema {
  screens: {
    key: string;
    value: ScreenData[];
  };
}

export interface Storage {
  saveScreens(screens: ScreenData[]): Promise<void>;
  loadScreens(): Promise<ScreenData[]>;
  clearScreens(): Promise<void>;
}

class IdbStorage implements Storage {
  private dbName = "ui-gen-db";
  private dbVersion = 1;
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
}

// Export default storage instance
export const storage: Storage = new IdbStorage();

