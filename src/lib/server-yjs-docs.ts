import * as Y from "yjs";

type ProjectDocState = {
  doc: Y.Doc;
  lastHydratedAt: number;
  lastPersistedVector: string | null;
  isHydrating: boolean;
  hydrationPromise: Promise<void> | null;
};

const projectDocs = new Map<string, ProjectDocState>();

export function getOrCreateProjectDoc(projectId: string): Y.Doc {
  if (!projectDocs.has(projectId)) {
    projectDocs.set(projectId, {
      doc: new Y.Doc(),
      lastHydratedAt: 0,
      lastPersistedVector: null,
      isHydrating: false,
      hydrationPromise: null,
    });
  }
  return projectDocs.get(projectId)!.doc;
}

export function getProjectDoc(projectId: string): Y.Doc | undefined {
  return projectDocs.get(projectId)?.doc;
}

export function setProjectDoc(projectId: string, doc: Y.Doc): void {
  projectDocs.set(projectId, {
    doc,
    lastHydratedAt: projectDocs.get(projectId)?.lastHydratedAt ?? 0,
    lastPersistedVector: projectDocs.get(projectId)?.lastPersistedVector ?? null,
    isHydrating: projectDocs.get(projectId)?.isHydrating ?? false,
    hydrationPromise: projectDocs.get(projectId)?.hydrationPromise ?? null,
  });
}

export function destroyProjectDoc(projectId: string): void {
  const state = projectDocs.get(projectId);
  if (state) {
    state.doc.destroy();
    projectDocs.delete(projectId);
  }
}

export function markDocHydrated(projectId: string): void {
  const state = projectDocs.get(projectId);
  if (state) {
    state.lastHydratedAt = Date.now();
    state.isHydrating = false;
    state.hydrationPromise = null;
  } else {
    projectDocs.set(projectId, {
      doc: new Y.Doc(),
      lastHydratedAt: Date.now(),
      lastPersistedVector: null,
      isHydrating: false,
      hydrationPromise: null,
    });
  }
}

export function getDocHydratedAt(projectId: string): number {
  return projectDocs.get(projectId)?.lastHydratedAt ?? 0;
}

export function setDocStateVector(projectId: string, vector: string): void {
  const state = projectDocs.get(projectId);
  if (state) {
    state.lastPersistedVector = vector;
  } else {
    projectDocs.set(projectId, {
      doc: new Y.Doc(),
      lastHydratedAt: 0,
      lastPersistedVector: vector,
      isHydrating: false,
      hydrationPromise: null,
    });
  }
}

export function getDocStateVector(projectId: string): string | null {
  return projectDocs.get(projectId)?.lastPersistedVector ?? null;
}

export function setDocHydrationPromise(projectId: string, promise: Promise<void>): void {
  const state = projectDocs.get(projectId);
  if (state) {
    state.isHydrating = true;
    state.hydrationPromise = promise;
  } else {
    projectDocs.set(projectId, {
      doc: new Y.Doc(),
      lastHydratedAt: 0,
      lastPersistedVector: null,
      isHydrating: true,
      hydrationPromise: promise,
    });
  }
}

export function getDocHydrationPromise(projectId: string): Promise<void> | null {
  return projectDocs.get(projectId)?.hydrationPromise ?? null;
}
