# Persistence Hardening Plan

Ordered by impact on overall reliability.

1. **Authorize project access (High effort)**
   - Current Yjs endpoints only check that a session exists, so any authenticated user can mutate any `projectId`.
   - Add membership checks against `ProjectMember` (or ownership of the `default` project) before opening SSE streams or accepting updates.
   - Requires extending session payload, updating Prisma queries, and defining error responses.

2. **Cold-start resilience for SSE docs (Medium effort)**
   - The in-memory Yjs docs and client lists vanish on deploy/restart; reconnects start empty until a client replays data.
   - Always hydrate from Prisma on every `/api/yjs/sse` GET (or cache per project with TTL) so newly started workers serve the latest snapshot immediately.
   - Ensures no data loss after restarts.

3. **Unify database sync logic (Medium effort)**
   - `/api/yjs/update` and `/api/yjs/sync` duplicate mapping logic into Prisma.
   - Extract a shared helper (e.g., `persistYDocToPrisma(projectId, doc)`) so the code path is single-sourced, easier to test, and less error-prone when schema changes.

4. **Back-pressure on update uplink (Medium effort)**
   - Every local mutation posts immediately; dragging or rapid edits flood the server and DB.
   - Introduce a short debounce/queue (100–250 ms) before POSTing to `/api/yjs/update`, or batch multiple encoded updates per request.

5. **State-vector sync for offline recovery (Medium/High effort)**
   - Today, offline clients replay blind updates that can overwrite remote edits.
   - Use `Y.encodeStateVector` to request missing updates before pushing local ones, or leverage `diffs = Y.encodeStateAsUpdate(doc, vector)` to reconcile.
   - Requires additional endpoints or parameters but avoids silent conflicts.

6. **Local cache invalidation (Low effort)**
   - `YjsStorage` only pushes IndexedDB data when the server doc is empty, but never purges stale local copies.
   - Track a version/state-vector hash so, on reconnect to a populated server doc, we clear or overwrite IndexedDB to prevent ghosts reappearing if the server restarts empty later.

7. **Batch Prisma writes (Low/Medium effort)**
   - Persistence currently performs multiple sequential upserts/deletes per screen/point.
   - Wrap in `prisma.$transaction`, use `createMany`/`upsert` where possible, or store the raw Yjs update blob alongside denormalized tables to reduce write time and contention.

Use this list as a checklist; tackle top items before shipping multi-user access. Effort tags assume existing familiarity with Yjs/Prisma.
