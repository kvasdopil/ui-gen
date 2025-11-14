# Development Memory & Notes

This file contains important technical notes, decisions, and gotchas for future development and AI assistance. For user-facing documentation, see README.md.

## Key Architecture Decisions

### 1. Iframe Rendering

- **Decision**: Use `srcDoc` to render generated HTML in an iframe
- **Reason**: Security isolation and style containment
- **Important**: Iframe sandbox must include `allow-scripts` for Tailwind CDN to work
- **Location**: `src/components/Screen.tsx`

### 2. Tailwind CDN in Iframe

- **Decision**: Use Tailwind CDN (`https://cdn.tailwindcss.com`) instead of compiled CSS
- **Reason**: Dynamic content generation doesn't allow for build-time CSS compilation
- **Gotcha**: Tailwind CDN may not always process classes correctly in iframes - we trigger a reflow to help
- **Location**: `src/components/Screen.tsx` (HTML wrapper)

### 3. API Endpoint Structure

- **Decision**: RESTful API with separate endpoints for screens and dialog entries
- **Reason**: Better separation of concerns, consistent with REST principles, allows for more granular operations
- **Endpoints**:
  - `GET /api/screens` - List all screens for user's workspace
  - `POST /api/screens` - Create new screen (requires x, y coordinates)
  - `PUT /api/screens/:id` - Update screen (partial data)
  - `DELETE /api/screens/:id` - Delete screen
  - `POST /api/screens/:id/clone` - Clone screen up to a conversation point (requires convPointId, x, y)
  - `GET /api/screens/:id/dialog` - List dialog entries for a screen
  - `POST /api/screens/:id/dialog` - Create dialog entry (generates HTML)
  - `PUT /api/screens/:id/dialog/:dialogId` - Update dialog entry arrows only
  - `DELETE /api/screens/:id/dialog/:dialogId` - Delete dialog entry
- **Deprecated**: `/api/create` endpoint is deprecated but kept for backward compatibility
- **UI Generation**: Extracted to `src/lib/ui-generation.ts` as reusable function
- **Location**: `src/app/api/screens/`, `src/lib/ui-generation.ts`

### 4. HTML Cleanup

- **Decision**: Strip markdown code blocks from AI responses
- **Reason**: AI sometimes wraps output in ```html code blocks
- **Implementation**: Regex patterns to remove leading/trailing backticks and "html" label
- **Location**: `src/lib/ui-generation.ts` (also in deprecated `src/app/api/create/route.ts`)

### 5. Component Separation

- **Decision**: Separate `PromptPanel` component from `Screen` component
- **Reason**: Reusability and separation of concerns
- **Location**: `src/components/PromptPanel.tsx`

### 6. Loading State & Placeholder Screen

- **Decision**: Show placeholder screen with spinner, "Creating UI" text, and user prompt while generation is in progress
- **Reason**: Provides better visual feedback and shows what's being generated
- **Implementation**:
  - Placeholder shows when `isLoading` is true OR when there's an incomplete conversation point (has prompt but no HTML)
  - Placeholder also shows when screen exists but has no content yet (newly created screen waiting for first dialog entry)
  - Displays spinner in primary color, "Creating UI" text in primary color, and user prompt in smaller grey text
  - Maintains minimal screen size (390px × 844px) during loading
  - Replaces iframe content during generation
- **Location**: `src/components/Screen.tsx`

### 7. Data Persistence

- **Decision**: Use Neon PostgreSQL database for screens and dialog entries, IndexedDB for client-side state
- **Reason**: Server-side persistence allows data to be accessible across devices and sessions
- **Implementation**:
  - **Database**: Neon PostgreSQL with Prisma ORM
  - **Schema**: Workspace → Screen → DialogEntry (one-to-many relationships)
  - **User Identification**: Email hash (SHA-256) used as userId for privacy
  - **Workspace**: Each user has a default workspace (email hash + name 'default')
  - **Storage abstraction**: `ApiStorage` class in `src/lib/storage.ts` implements Storage interface
  - **API-based**: Screens and dialog entries saved via REST API endpoints
  - **IndexedDB**: Still used for viewport transform and pending prompts (client-side state)
  - Auto-save screens to API on changes (debounced by 300ms)
  - Auto-save viewport transform with 500ms debounce
  - Auto-load screens from API on mount
  - Database migrations managed via Prisma
- **Location**: `prisma/schema.prisma`, `src/lib/storage.ts`, `src/lib/prisma.ts`, `src/app/api/screens/`

### 8. Data Structure

- **Decision**: Store conversation points (prompt, HTML, title, timestamp) instead of separate history and HTML
- **Reason**: Better organization, stores complete metadata for each conversation point
- **Structure**: `ConversationPoint` type with `prompt`, `html`, `title`, `timestamp`, `id?` (optional dialog entry ID from database)
- **ID Field**: Added optional `id` field to store dialog entry IDs from database for deletion operations
- **Location**: `src/lib/types.ts`

### 9. Screen Creation Flow

- **Decision**: Two-step process - create screen first, then create first dialog entry
- **Reason**: More consistent API design, allows screen to appear immediately while HTML is being generated
- **Flow**:
  1. Right-click on empty space shows `CreateScreenPopup` component
  2. Popup appears at right-click location with "Create screen" title and "Mobile app" button
  3. Clicking "Mobile app" button shows the "What you want to create" dialog form
  4. User enters prompt and clicks "Create"
  5. **Step 1**: Screen is created via `POST /api/screens` (with x, y coordinates) - appears immediately
  6. **Step 2**: First dialog entry is created via `POST /api/screens/:id/dialog` (with prompt) - generates HTML
- **Implementation**:
  - Right-click handler (`handleContextMenu`) prevents default browser context menu
  - Uses `e.clientX` and `e.clientY` directly (browser viewport coordinates) for popup positioning
  - `CreateScreenPopup` and `NewScreenDialog` use `fixed` positioning
  - Popups are rendered outside the Viewport component (as siblings) to avoid being affected by viewport transform
  - When creating screen, converts from browser viewport coordinates → viewport container coordinates → content coordinates
  - Screen appears immediately with empty conversation points
  - Dialog entry creation happens asynchronously, updates screen when complete
- **Location**: `src/app/page.tsx`, `src/components/CreateScreenPopup.tsx`, `src/app/api/screens/`

### 10. Draggable Screens

- **Decision**: Allow all screens (selected and unselected) to be dragged for repositioning, with robust handling that continues even when mouse leaves viewport
- **Reason**: Enables spatial organization of screens without requiring deselection, and provides smooth dragging experience even with fast mouse movements
- **Implementation**:
  - Track `draggedScreenId` and `isDraggingScreen` state to distinguish between click and drag
  - Only mark as dragging after mouse moves >5px to allow clicks to select
  - Prevent viewport panning as soon as `draggedScreenId` is set (even before 5px threshold)
  - Update screen position in content coordinates, accounting for viewport scale
  - All screens (selected and unselected) can be dragged - removed condition that prevented dragging selected screens
  - If dragging a different screen, deselect the current one; if dragging the selected screen, keep it selected
  - Prevent selection if user dragged (not just clicked)
  - **Overlay Click Detection**: Check if click is on overlay element (touchable/clickable highlight) before starting screen drag
    - Overlay elements have `data-overlay-highlight` attribute for identification
    - Overlay highlights have `pointerEvents: "auto"` to receive mouse events
    - If clicking on overlay, skip screen drag and let overlay handler start link creation instead
  - **Robust Drag Handling**: Screen dragging continues even when mouse moves fast and leaves viewport boundaries
    - Uses refs (`isMouseDownRef`, `draggedScreenIdRef`) for reliable state tracking that persists even when React events stop firing
    - Attaches global window event listeners (`mousemove`, `mouseup`) with capture phase when `draggedScreenId` is set
    - Global listeners use capture phase (`{ capture: true }`) to catch events before other handlers can stop them
    - Viewport's `handleMouseLeave` and `handleMouseUp` check `disabled` prop and return early when dragging a screen
    - Page's `handleMouseUp` ignores `mouseleave` events when dragging a screen - only terminates on actual `mouseup` events
    - This ensures drag only terminates when user releases mouse button, not when mouse leaves viewport
- **Location**: `src/app/page.tsx`, `src/components/Viewport.tsx`, `src/components/Screen.tsx`

### 11. Camera Position Persistence

- **Decision**: Persist viewport transform (position and zoom) to IndexedDB
- **Reason**: Users expect to continue from where they left off when reloading the page
- **Implementation**:
  - Added `ViewportTransform` type with `x`, `y`, `scale` properties
  - Added `viewportTransform` object store to IndexedDB schema
  - Save viewport transform with 500ms debounce to avoid excessive writes during panning/zooming
  - Load viewport transform on mount alongside screens
  - Track `isLoadingViewport` state to prevent saving during initial load
- **Location**: `src/lib/storage.ts`, `src/app/page.tsx`

### 12. Conversation Point Management

- **Decision**: Replace incomplete conversation points instead of duplicating them, and show prompts immediately in history
- **Reason**:
  - Prevents duplicate prompts in history when creating new screens
  - Provides better UX by showing modification prompts immediately while generation is in progress
- **Implementation**:
  - When creating new screen: initial incomplete point is replaced with completed point after generation
  - When sending modification: add incomplete point immediately to history, replace with completed point when generation finishes
  - If generation fails: remove the incomplete point to keep history clean
  - Check if last point matches prompt and is incomplete before replacing (prevents duplicates)
  - Use existing timestamp when called from auto-generation to prevent duplicate points
  - Reuse existing incomplete points instead of creating new ones when generation is triggered multiple times
- **Location**: `src/components/Screen.tsx`

### 13. Race Condition Prevention in Screen Updates

- **Decision**: Use functional state updates and debounced storage saves to prevent race conditions
- **Reason**:
  - Multiple screens updating simultaneously could cause stale state issues
  - Screen positions could be lost when updates happen concurrently
  - Storage saves could overwrite in-flight updates
- **Implementation**:
  - `handleScreenUpdate` uses functional updates (`setScreens(prevScreens => ...)`) instead of closure state
  - This ensures each update works with the latest state, preventing overwrites
  - Screen saves are debounced by 300ms to batch rapid updates and prevent storage race conditions
  - Position is always preserved unless explicitly updated in the updates object
  - Added warning log if screen not found during update (for debugging)
- **Location**: `src/app/page.tsx`

### 15. OAuth Authentication

- **Decision**: Use Auth.js (NextAuth) v5 with Google OAuth provider
- **Reason**: Secure authentication without managing user credentials, easy integration with Next.js
- **Implementation**:
  - Auth.js API route at `src/app/api/auth/[...nextauth]/route.ts`
  - Google OAuth provider with JWT session strategy
  - SessionProvider wrapper in `src/components/Providers.tsx`
  - UserAvatar component in `src/components/UserAvatar.tsx`:
    - Fixed position in top-right corner (z-index 9999)
    - Not affected by viewport transforms (positioned outside viewport-content div)
    - Shows default icon when not authenticated, Google profile image when authenticated
    - Click handler: initiates sign-in if not authenticated, shows popup if authenticated
    - Popup displays user name, email, and logout button
    - Prevents event propagation to avoid interfering with viewport interactions
  - Protected `/api/create` endpoint requires authenticated session
  - Type definitions in `src/types/next-auth.d.ts` for TypeScript support
- **Configuration**:
  - OAuth consent screen must be configured in Google Cloud Console
  - OAuth client must have authorized redirect URIs for both localhost and production
  - Environment variables: `AUTH_SECRET`, `AUTH_URL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
- **Location**: `src/app/api/auth/[...nextauth]/route.ts`, `src/components/UserAvatar.tsx`, `src/components/Providers.tsx`, `src/app/api/create/route.ts`

### 16. Deployment to Vercel

- **Decision**: Deploy to Vercel with custom domain support
- **Implementation**:
  - Vercel CLI for deployment and environment variable management
  - Custom domain configuration via Vercel dashboard
  - DNS A record pointing to Vercel IP (76.76.21.21)
  - Automatic SSL certificate provisioning
  - Environment variables set in Vercel project settings
  - **Important**: Ensure OAuth client credentials don't have trailing newlines when setting via CLI
- **Gotcha**: OAuth redirect URIs must match exactly (including protocol and path)
- **Location**: Vercel project configuration, DNS settings

### 17. Duplicate API Call Prevention

- **Decision**: Use screen ID + timestamp for generation key and reuse existing incomplete points
- **Reason**:
  - Auto-generation effect could trigger multiple times with different timestamps
  - Multiple API calls for the same generation waste resources and cause duplicate entries
- **Implementation**:
  - Generation key format: `${screenData.id}-${lastPoint.timestamp}` (more unique than prompt-timestamp)
  - When auto-generation triggers, pass existing timestamp to `handleSend` to reuse incomplete point
  - `handleSend` checks for existing incomplete points before creating new ones
  - When called from auto-generation with existing timestamp, reuse the incomplete point from `screenData`
  - Preserve original timestamp when completing conversation points
- **Location**: `src/components/Screen.tsx`

### 19. Clickable Highlights Overlay

- **Decision**: Add overlay layer to highlight interactive elements (`<a>` and `<button>`) without modifying generated content, with clickable overlays for arrow creation
- **Reason**: Helps users identify clickable elements in generated designs for accessibility and design review, and enables creating visual connections between screens
- **Implementation**:
  - Toggle button (TbHandClick icon) next to screen title to show/hide highlights
  - Icon is gray (`text-gray-400`) by default, blue (`text-blue-500`) when active
  - Overlay layer positioned absolutely over iframe
  - Highlights `<a>` elements with `href` attribute in magenta (`#ff00ff` with 10% opacity fill)
  - Highlights `<button>` elements in cyan (`#00ffff` with 10% opacity fill)
  - **Touchable ID Extraction**: Extracts `aria-roledescription` attribute from each `<a>` and `<button>` element as `touchableId`
    - Elements without `aria-roledescription` are skipped (with console warning) and cannot be used for arrow creation
    - The `touchableId` is stored in highlight objects and used to identify arrows instead of overlay index
  - Uses `offsetLeft`/`offsetTop` to calculate element positions relative to iframe document (not affected by CSS transforms)
  - Adds iframe offset within container to get final position relative to container (where overlay is positioned)
  - Updates highlights when iframe content loads, changes, or window resizes
  - State (`showClickables`) is not persisted - resets to `false` on page reload
  - **Clickable Overlays**: Overlay highlight divs have `pointerEvents: "auto"` and `data-overlay-highlight` attribute
    - Clicking on overlay highlights starts arrow creation (calls `onOverlayClick`)
    - Screen drag handler checks for overlay clicks and skips dragging if click is on overlay
    - Prevents screen dragging when clicking on touchable elements - allows link creation instead
  - **Arrow Creation**: Arrow drawing from touchable overlays
    - `handleOverlayClick` sets `arrowLine` state and `isMouseDownRef.current = true` to enable mouse move tracking
    - Global window event listeners (`mousemove`, `mouseup`) attached when `arrowLine` exists to continue drawing even when mouse leaves viewport
    - `handleMouseUp` ignores `mouseleave` events when `arrowLine` exists (similar to screen dragging) - only terminates on actual `mouseup` events
    - Viewport is disabled (`disabled={!!draggedScreenId || !!arrowLine}`) during arrow drawing to prevent interference from viewport mouse handlers
    - Arrow drawing continues smoothly even when mouse moves fast and leaves screen boundaries
    - **Efficient Persistence**: Arrows are only persisted to database when completed (released over a screen) or removed - no server updates while dragging
    - **Database Storage**: Arrows are stored as JSON in `DialogEntry.arrows` field in PostgreSQL database, persisted per conversation point
    - **API Endpoint**: `PUT /api/screens/:id/dialog/:dialogId` endpoint updates arrows for a dialog entry
    - **Debugging**: Console logging added throughout arrow creation flow (in `Screen.tsx` and `page.tsx`) for troubleshooting - can be removed in production if desired
  - **Gotcha**: `getBoundingClientRect()` returns viewport coordinates affected by CSS transforms, so we use `offsetLeft`/`offsetTop` instead to get positions relative to iframe document
  - **Touchable ID**: Arrows are identified by `touchableId` (aria-roledescription attribute) instead of overlay index for stable identification
  - **Location**: `src/components/Screen.tsx`, `src/app/page.tsx`

### 20. Pending Arrow Button for Screen Creation

- **Decision**: When dragging a link/button and dropping it in empty space, show a button at the end instead of deleting the arrow
- **Reason**: Allows users to create new screens in their user flow by clicking the button, with automatic prompt generation based on the button's purpose
- **Implementation**:
  - When arrow is dropped in empty space, keep it in `isPending` state (frontend-only, not persisted to DB)
  - Show a rectangular button with rounded corners at the end of the arrow
  - Button displays the icon on top and the touchable ID as a label below
  - Button shows spinner and is disabled during cloning to prevent double submissions
  - Clicking the button:
    1. Clones the original screen using `POST /api/screens/:id/clone` endpoint with the active conversation point ID
    2. Creates a new screen at the arrow end position with all conversation points up to and including the active one
    3. Adds a new incomplete dialog entry with prompt: "Create a screen that should be shown after user presses at '{touchableId}'"
    4. Updates the arrow in the original screen's conversation point to point to the cloned screen
    5. Persists the arrow to the database
    6. Screen component's auto-generation effect handles creating the dialog entry and starting HTML generation
  - Button is cleared when clicking on screens, viewport, or empty space (but not when clicking the button itself)
  - Pending arrows are cleared when starting a new arrow drag from another touchable
  - Only one pending button (CreateFromTouchableButton) exists at a time - starting a new arrow automatically removes the previous pending arrow
  - Touchable remains unlinked until the button is clicked - arrow is only saved to database when button is clicked or when dropped on a screen
  - Touchable ID (aria-roledescription) is used to identify arrows instead of overlay index for stable identification
- **Location**: `src/app/page.tsx`, `src/components/Screen.tsx`

### 21. Arrow Color Coding and Visual Hierarchy

- **Decision**: Use different colors for arrows based on whether they're connected to the selected screen
- **Reason**: Provides better visual hierarchy and makes it easier to see which arrows are related to the active screen
- **Implementation**:
  - Arrows connected to the selected screen (either as start or end) are displayed in dark gray (#6b7280)
  - All other arrows are shown in lighter gray (#d1d5db)
  - Color is determined by checking if `selectedScreenId` matches either the start screen ID or end screen ID
  - Both the arrow stroke and arrowhead marker use the same color
  - Unique marker IDs are generated per arrow instance to avoid conflicts
- **Location**: `src/components/ArrowLine.tsx`, `src/app/page.tsx`

### 22. Invalid Arrow Cleanup

- **Decision**: Automatically filter out and remove arrows pointing to deleted or non-existent screens
- **Reason**: Maintains data integrity and prevents rendering errors when screens are deleted
- **Implementation**:
  - When loading screens from database, filter out arrows where `targetScreenId` doesn't match any existing screen
  - Invalid arrows are removed from local state immediately
  - Database is updated asynchronously to remove invalid arrows (doesn't block response)
  - Cleanup happens both server-side (in API route) and client-side (on load)
  - Arrows without `targetScreenId` are also filtered out
- **Location**: `src/app/api/screens/route.ts`, `src/app/page.tsx`

### 23. Dialog Dismissal on Viewport Click

- **Decision**: Dismiss dialogs (NewScreenDialog, CreateScreenPopup) when clicking on viewport
- **Reason**: Provides intuitive way to cancel dialog operations and clean up UI state
- **Implementation**:
  - Clicking on viewport (empty space or screens) dismisses both dialogs
  - Also unselects current screen and removes pending arrows
  - NewScreenDialog has click-outside handler (similar to CreateScreenPopup) that listens for clicks outside the dialog
  - Viewport click handler in `handleMouseDown` also dismisses dialogs
  - Early return checks prevent dismissal when clicking on the dialogs themselves
- **Location**: `src/components/NewScreenDialog.tsx`, `src/app/page.tsx`

### 24. Loading States for Screen Creation

- **Decision**: Show loading spinners and disable buttons during screen creation/cloning operations
- **Reason**: Prevents double submissions and provides clear visual feedback during async operations
- **Implementation**:
  - `isCreatingScreen` state tracks when new screen creation is in progress
  - `isCloningScreen` state tracks when screen cloning from pending arrow is in progress
  - NewScreenDialog shows spinner in Create button when `disabled` prop is true
  - Pending arrow button shows spinner when `isCloningScreen` is true
  - Both buttons are disabled during their respective operations
  - Loading states are cleared in finally blocks and on early returns (errors, auth redirects)
- **Location**: `src/app/page.tsx`, `src/components/NewScreenDialog.tsx`

### 22. Auth Flow Preservation

- **Decision**: Preserve prompts and restore create flow after authentication
- **Reason**: When users try to create/modify screens without being authenticated, they shouldn't lose their work
- **Implementation**:
  - When `/api/create` returns 401 Unauthorized, save the prompt and screenId to IndexedDB
  - Trigger Google OAuth sign-in with callback URL to return to the same page
  - After authentication completes, check for pending prompts in storage
  - If pending prompt exists with screenId, select that screen (which already has incomplete conversation point)
  - Screen component's auto-generation effect detects incomplete point and automatically retries API call
  - Clear pending prompt from storage after restoration to prevent reprocessing
  - Use `pendingPromptProcessedRef` to ensure restoration only happens once per session change
  - Reset processed flag when session user ID changes (e.g., logout/login)
- **Storage**:
  - Added `pendingPrompt` object store to IndexedDB schema (database version 3)
  - Stores: `{ prompt: string, screenId: string | null, position: { x: number, y: number } | null }`
  - Key: `"current"` (only one pending prompt at a time)
- **Flow**:
  1. User creates/modifies screen → API call → 401 Unauthorized
  2. Save prompt + screenId to `pendingPrompt` storage
  3. Trigger `signIn("google", { callbackUrl: window.location.href })`
  4. User authenticates → redirected back to page
  5. `page.tsx` detects authenticated session → checks for pending prompt
  6. If found, selects the screen (which has incomplete conversation point)
  7. `Screen.tsx` auto-generation effect detects incomplete point → retries API call
  8. Clear pending prompt from storage
- **Location**: `src/lib/storage.ts`, `src/components/Screen.tsx`, `src/app/page.tsx`

## Important Code Locations

### API Routes

- **Screens**: `src/app/api/screens/route.ts` and `src/app/api/screens/[id]/route.ts`
  - GET: List all screens for user's workspace
  - POST: Create new screen (requires x, y coordinates)
  - PUT: Update screen (partial data: x, y, selectedPromptIndex)
  - DELETE: Delete screen and all dialog entries
  - All endpoints require authentication
  - Auto-creates workspace if user doesn't have one

- **Dialog Entries**: `src/app/api/screens/[id]/dialog/route.ts` and `src/app/api/screens/[id]/dialog/[dialogId]/route.ts`
  - GET: List all dialog entries for a screen (includes arrows)
  - POST: Create dialog entry (requires prompt, generates HTML automatically)
  - PUT: Update dialog entry arrows (requires dialogId, updates arrows JSON field only - other fields are immutable)
  - DELETE: Delete dialog entry (requires screen ID and dialog entry ID)
  - Dialog entries are mostly immutable (prompt, html, title cannot be updated) - only arrows can be updated via PUT endpoint
  - All endpoints include dialog entry IDs in responses for frontend deletion operations

- **Screen Cloning**: `src/app/api/screens/[id]/clone/route.ts`
  - POST: Clone a screen up to a specific conversation point
  - Requires payload: `{ convPointId: string, x: number, y: number }`
  - Creates a new screen with all dialog entries up to and including the specified conversation point
  - Sets `selectedPromptIndex` to the index of the cloned conversation point
  - Preserves all conversation data including arrows
  - Returns the new screen data in the same format as other endpoints
  - Validates that the source screen exists and belongs to the user's workspace
  - Validates that the conversation point exists in the source screen

- **UI Generation**: `src/lib/ui-generation.ts`
  - Extracted reusable function `generateUIFromHistory()`
  - Uses `GENERATE_UI_PROMPT` constant from `src/prompts/generate-ui.ts` as system prompt
  - Uses `gemini-2.5-flash` model with temperature 0.5
  - Provides `findUnsplashImage` tool for automatic image search
    - Tool includes validation to ensure query parameter is always provided (non-empty string)
    - Gracefully falls back to generation without tools if tool calls fail
    - Wrapped in try-catch that retries generation without tools on error
  - Cleans markdown code blocks from response
  - Returns HTML with title metadata comment (`<!-- Title: ... -->`)

- **Deprecated**: `src/app/api/create/route.ts`
  - Kept for backward compatibility
  - Uses extracted UI generation function
  - Returns deprecation notice in response

### Authentication & User Management

- **File**: `src/app/api/auth/[...nextauth]/route.ts`
- **Key Features**:
  - Google OAuth provider configuration
  - JWT session strategy
  - Callbacks to include user ID, name, email, and image in session
  - Exports `handlers`, `signIn`, `signOut`, and `auth` functions
  - `trustHost: true` to allow custom hosts (localhost, etc.)

- **File**: `src/lib/auth.ts`
- **Key Functions**:
  - `getAuthenticatedUser()` - Gets authenticated user from session (requires email)
  - `getOrCreateWorkspace()` - Auto-creates workspace if user doesn't have one
  - `hashEmail()` - Creates SHA-256 hash of email for use as userId
  - Uses email hash for privacy (emails not stored in plain text)

### Storage

- **File**: `src/lib/storage.ts`
- **Key Features**:
  - `Storage` interface with `saveScreens`, `saveScreen`, `loadScreens`, `clearScreens`, `deleteScreen`, `deleteDialogEntry`, `updateDialogEntryArrows`, `saveViewportTransform`, `loadViewportTransform`, `savePendingPrompt`, `loadPendingPrompt`, `clearPendingPrompt` methods
  - `ApiStorage` class implementing API-based storage for screens
  - Uses REST API endpoints for screens and dialog entries
  - Uses IndexedDB for client-side state (viewport transform, pending prompts)
  - Database name: `ui-gen-db`, version: 3
  - Object stores:
    - `viewportTransform` with key `"current"` storing ViewportTransform
    - `pendingPrompt` with key `"current"` storing `{ prompt: string, screenId: string | null, position: { x: number, y: number } | null }`
  - Auto-saves screens to API whenever they change (debounced by 300ms)
  - **Optimized Screen Saving**: `saveScreen(screen)` method saves only a single screen, while `saveScreens(screens)` saves all screens
    - `page.tsx` tracks which screen was updated via `lastUpdatedScreenIdRef` when position or selectedPromptIndex changes
    - Only the specific updated screen is saved, not all screens - prevents unnecessary API calls when moving screens
    - Uses `hasCompletedInitialLoadRef` to prevent saving during initial page load
  - Auto-saves viewport transform with 500ms debounce
  - Auto-loads screens from API on mount
  - Pending prompts are saved when auth is required and loaded after authentication
  - **Deletion Methods**:
    - `deleteScreen(screenId)`: Calls `DELETE /api/screens/:id` to delete screen and all dialog entries (cascade delete)
    - `deleteDialogEntry(screenId, dialogId)`: Calls `DELETE /api/screens/:id/dialog/:dialogId` to delete a single dialog entry
  - **Arrow Persistence**:
    - `updateDialogEntryArrows(screenId, dialogId, arrows)`: Calls `PUT /api/screens/:id/dialog/:dialogId` to update arrows for a dialog entry
    - Arrows are stored as JSON in the database `DialogEntry.arrows` field
    - Only persisted when arrow is completed (released over a screen) or removed - no updates while dragging

### Types

- **File**: `src/lib/types.ts`
- **Key Types**:
  - `ConversationPoint`: `{ id?: string, prompt: string, html: string, title: string | null, timestamp: number, arrows?: ConversationPointArrow[] }`
    - `id` field is optional and stores dialog entry ID from database (used for deletion operations)
  - `ConversationPointArrow`: `{ touchableId: string, targetScreenId: string, startPoint?: { x: number, y: number } }`
    - `touchableId` is the `aria-roledescription` attribute value from the touchable element (`<a>` or `<button>`)
    - Used as a globally unique identifier for arrows instead of overlay index for stable identification
    - `targetScreenId` is the destination screen ID that the arrow points to
    - `startPoint` is optional and stores the arrow start position relative to screen center (for rendering)
  - `Arrow`: `{ id: string, startScreenId: string, conversationPointIndex: number, touchableId: string, startPoint: { x: number, y: number }, endScreenId: string | null, endPoint: { x: number, y: number } }`
    - Similar to `ConversationPointArrow` but includes additional rendering information
  - `ScreenData`: `{ id: string, conversationPoints: ConversationPoint[], selectedPromptIndex: number | null, position?: { x: number, y: number }, height?: number }`
- **File**: `src/lib/storage.ts`
- **Key Types**:
  - `ViewportTransform`: `{ x: number, y: number, scale: number }` - Camera position and zoom level
- **File**: `prisma/schema.prisma`
- **Database Models**:
  - `Workspace`: `{ id: uuid, userId: string (email hash), name: string (default: 'default'), createdAt, updatedAt }`
  - `Screen`: `{ id: uuid, workspaceId: uuid, positionX: float, positionY: float, selectedPromptIndex: int?, createdAt, updatedAt }`
  - `DialogEntry`: `{ id: uuid, screenId: uuid, prompt: string, html: string?, title: string?, arrows: json?, timestamp: bigint, createdAt, updatedAt }`
    - `arrows` field stores array of `ConversationPointArrow` objects as JSON
    - Each arrow contains `touchableId` (aria-roledescription value) instead of overlay index for stable identification

## System Prompt

### Location

- **File**: `src/prompts/generate-ui.ts`
- **Constant**: `GENERATE_UI_PROMPT`
- **Purpose**: Defines how the AI should generate UI mockups

### Key Requirements (from prompt)

- Generate ONLY page content (no `<!DOCTYPE>`, `<html>`, `<head>`, `<body>` tags)
- Include title metadata comment at the beginning: `<!-- Title: Your short descriptive title -->`
- Use HTML with `class` attribute (not JSX `className`)
- Root element must be `<div class="flex h-full w-full">`
- Container size: 390px × 844px
- No JavaScript, no interactive elements
- Use Tailwind CSS classes exclusively
- Use Font Awesome icons via CDN (no custom SVG)
- Use Unsplash for images
- **REQUIRED**: ALL `<a>` and `<button>` tags MUST include `aria-roledescription` attribute with a human-readable, globally unique name
  - This value is used as `touchableId` to identify arrows/links between screens
  - Each `aria-roledescription` value must be unique across the entire page
  - Elements without `aria-roledescription` are skipped when creating highlights and cannot be used for arrow creation

## Known Issues & Workarounds

### 1. Tailwind CDN in Iframe

- **Issue**: Tailwind CDN may not always process classes correctly in iframes
- **Workaround**: Trigger a reflow by accessing `document.body.offsetHeight`
- **Location**: `src/components/Screen.tsx` (script in HTML wrapper)

### 2. Markdown Code Blocks

- **Issue**: AI sometimes wraps output in markdown code blocks
- **Workaround**: Regex cleanup in API endpoint
- **Location**: `src/lib/ui-generation.ts`

### 3. Iframe Sandbox Restrictions

- **Issue**: Scripts won't run without proper sandbox permissions
- **Workaround**: Use `sandbox="allow-same-origin allow-scripts"`
- **Location**: `src/components/Screen.tsx` (iframe element)

### 4. Toaster Hydration Mismatch

- **Issue**: Toaster component caused hydration errors because it rendered differently on server vs client
- **Workaround**: Use `isMounted` state that starts as `false` and is set to `true` in `useEffect` (which only runs on client after hydration)
- **Implementation**: Component returns `null` during SSR and initial render, only renders portal after `isMounted` is `true`
- **Location**: `src/components/ui/toast.tsx`

## Notes for AI Assistants

### Critical Implementation Details

- System prompt is in `src/prompts/generate-ui.ts` as `GENERATE_UI_PROMPT` constant - update this file when modifying generation logic
- The API endpoint automatically cleans markdown code blocks - don't duplicate this logic
- Generated HTML includes title metadata (`<!-- Title: ... -->`) which is extracted and displayed above screens
- Iframe sandbox must allow scripts for Tailwind to work
- Screen component has flexible width (stretches horizontally) with min-height of 844px
- Iframe width is fixed at 390px, height adjusts dynamically based on content (minimum 844px)
- HTML wrapper uses simplified CSS/JS: CSS sets min-height on html, body, and body > \*; JavaScript calculates and sends height via postMessage
- PromptPanel is positioned absolutely relative to Screen component wrapper
- Placeholder screen replaces iframe content during generation, showing spinner, "Creating UI" text, and user prompt
- Data structure: Use `ConversationPoint` type for storing prompt, HTML, title, and timestamp together
- UI generation logic is extracted to `src/lib/ui-generation.ts` as reusable function `generateUIFromHistory()`
- Storage abstraction: Use `Storage` interface from `src/lib/storage.ts` - uses API for screens, IndexedDB for client state
- Screens are auto-saved to database via API when they change (only the specific screen that was updated), auto-loaded from API on mount
- Viewport transform (camera position and zoom) is auto-saved to IndexedDB with 500ms debounce, auto-loaded on mount
- Database: Neon PostgreSQL with Prisma ORM (see `prisma/schema.prisma`)
- User identification: Email hash (SHA-256) used as userId for privacy (see `src/lib/auth.ts` - `hashEmail()` function)
- Workspace: Each user has a default workspace (email hash + name 'default')
- Screen creation: Two-step process - create screen first via `POST /api/screens`, then create first dialog entry via `POST /api/screens/:id/dialog`
- Dialog entries: Immutable once created (no update endpoint, only DELETE) - except arrows can be updated via PUT
- API endpoints: RESTful design with separate endpoints for screens and dialog entries (see `src/app/api/screens/`)
- Validation: Zod schemas used for all API request validation (see `src/lib/validations.ts`)
- All API endpoints require authentication - use `getAuthenticatedUser()` from `src/lib/auth.ts`
- Workspace auto-creation: Use `getOrCreateWorkspace()` from `src/lib/auth.ts` to get or create user's workspace
- Deprecated endpoint: `/api/create` is deprecated but kept for backward compatibility

### State Management

- New screens are NOT auto-selected or auto-centered to prevent viewport disruption
- Placeholder screen: Shows when `isLoading` is true OR when there's an incomplete conversation point OR when screen exists but has no content yet
- Tool call error handling: `findUnsplashImage` tool includes validation and graceful fallback - if tool calls fail, generation retries without tools
- Empty screen support: PromptPanel shows even when screen has no conversation points, with "Modify" button to add first prompt
- Z-index: Newer screens appear above older ones; selected screens always on top
- Duplicate API call prevention: `generationInProgressRef` tracks in-progress generations using screen ID + timestamp key
- Race condition prevention: `handleScreenUpdate` uses functional updates to always work with latest state
- Storage debouncing: Screen saves are debounced by 300ms to batch rapid updates and prevent race conditions
- Optimized screen saving: Only the specific screen that was updated (position or selectedPromptIndex) is saved to the API, not all screens - prevents unnecessary API calls when moving screens
  - `handleScreenUpdate` tracks which screen was updated via `lastUpdatedScreenIdRef` when position or selectedPromptIndex changes
  - Save effect in `page.tsx` checks `lastUpdatedScreenIdRef` and only saves that specific screen using `storage.saveScreen()`
  - If no specific screen is tracked, no save occurs (prevents saving on initial load or unrelated updates)
- Initial load protection: `hasCompletedInitialLoadRef` prevents saving during initial page load to avoid unnecessary update calls
- Position preservation: Screen positions are always preserved during updates unless explicitly changed
- Wheel event listener uses `{ passive: false }` to allow preventDefault for zoom
- No default screen - page starts empty, user clicks to create first screen

### Interaction Patterns

- Screen dragging: All screens (selected and unselected) can be dragged; panning is disabled during drag; dragging continues even when mouse leaves viewport boundaries
- Drag detection: Only mark as dragging after >5px movement to allow clicks to select; prevent panning as soon as `draggedScreenId` is set
- Robust drag handling: Uses refs for state tracking and global window event listeners with capture phase to ensure drag only terminates on actual mouse up, not on mouse leave
- Camera persistence: Viewport transform is persisted to IndexedDB in `viewportTransform` object store with key `"current"`
- New screen creation: Two-click behavior - first click deselects, second click shows initial popup; two-step flow: CreateScreenPopup with "Mobile app" button → prompt dialog form
- CreateScreenPopup component: Separate component for initial screen type selection; uses forwardRef for click-outside detection; ghost button style with icon and label
- Conversation points: Incomplete points are replaced (not duplicated) when generation completes; modification prompts appear immediately in history
- OAuth authentication: UserAvatar component in top-right corner; all API endpoints require authenticated session; Auth.js v5 with Google OAuth provider
- UserAvatar positioning: Fixed position (`fixed top-4 right-4`) outside viewport-content div to avoid transform effects; prevents event propagation to avoid viewport interference
- OAuth environment variables: Must not have trailing newlines when setting via Vercel CLI (use `echo -n`); `AUTH_URL` must match production domain exactly
- Auth flow preservation: When 401 occurs, prompt and screenId are saved to IndexedDB; after auth, screen is selected and generation auto-retries; pending prompts are cleared after restoration
- Deletion functionality: Screens and conversation points can be deleted from the UI, and deletions are persisted to the database
  - Screen deletion: `handleScreenDelete` in `page.tsx` calls `storage.deleteScreen()` which calls `DELETE /api/screens/:id`
  - Conversation point deletion: `handleDeletePoint` in `Screen.tsx` calls `storage.deleteDialogEntry()` which calls `DELETE /api/screens/:id/dialog/:dialogId`
  - Dialog entry IDs are included in API responses and preserved in `ConversationPoint.id` field for deletion operations
  - Deletions update local state immediately for responsive UI, then persist to database via API calls
- Keyboard shortcuts: Delete key triggers delete confirmation dialog for latest conversation point
  - Implementation: Keyboard event listener in `Screen.tsx` that listens for Delete key when screen is selected
  - Only triggers when latest conversation point is explicitly selected (`selectedPromptIndex === lastIndex`)
  - Prevents triggering when user is typing in input/textarea/contentEditable elements
  - Uses `forwardRef` and `useImperativeHandle` in `PromptPanel.tsx` to expose `triggerDelete` method
  - Opens the same confirmation dialog as clicking the delete button in the menu
  - Location: `src/components/Screen.tsx` (keyboard handler), `src/components/PromptPanel.tsx` (ref interface)
- Toast notifications: Custom toast system in `src/components/ui/toast.tsx` - uses `isMounted` state to prevent hydration mismatches (returns `null` during SSR, only renders after client-side hydration completes)
