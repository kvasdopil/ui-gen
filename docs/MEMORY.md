# Development Memory & Notes

This file contains important notes, decisions, and gotchas for future development and AI assistance.

## Project Overview

This is a UI generation tool that uses Google Gemini AI to generate HTML mockups based on user prompts. The generated HTML is rendered in an iframe with Tailwind CSS via CDN.

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

- **Decision**: Single `/api/create` endpoint that uses system prompt constant
- **Reason**: Prompt is embedded in codebase as a constant for better performance and bundling
- **Important**: System prompt is imported from `src/prompts/generate-ui.ts` as `GENERATE_UI_PROMPT` constant
- **Location**: `src/app/api/create/route.ts`

### 4. HTML Cleanup

- **Decision**: Strip markdown code blocks from AI responses
- **Reason**: AI sometimes wraps output in ```html code blocks
- **Implementation**: Regex patterns to remove leading/trailing backticks and "html" label
- **Location**: `src/app/api/create/route.ts` (lines 42-55)

### 5. Component Separation

- **Decision**: Separate `PromptPanel` component from `Screen` component
- **Reason**: Reusability and separation of concerns
- **Location**: `src/components/PromptPanel.tsx`

### 6. Loading State

- **Decision**: Loading spinner only covers Screen component, not entire page
- **Reason**: User can still see and interact with prompt panel during generation
- **Location**: `src/components/Screen.tsx` (overlay inside Screen container)

### 7. Data Persistence

- **Decision**: Use IndexedDB for client-side persistence with abstraction layer
- **Reason**: Persist screens, conversations, generated content, and camera position/zoom without backend dependency
- **Implementation**:
  - Storage abstraction interface in `src/lib/storage.ts`
  - `IdbStorage` class implementing IndexedDB operations
  - Auto-save on screen changes, auto-load on mount
  - Auto-save viewport transform (camera position and zoom) with 500ms debounce to avoid excessive writes
  - Auto-save screens with 300ms debounce to batch rapid updates and prevent race conditions
  - Auto-load viewport transform on mount
  - Database version: 2 (upgraded from 1 to add viewportTransform object store)
  - Easy to swap for backend persistence later (just implement Storage interface)
- **Location**: `src/lib/storage.ts`, `src/lib/types.ts`, `src/app/page.tsx`

### 8. Data Structure

- **Decision**: Store conversation points (prompt, HTML, title, timestamp) instead of separate history and HTML
- **Reason**: Better organization, stores complete metadata for each conversation point
- **Structure**: `ConversationPoint` type with `prompt`, `html`, `title`, `timestamp`
- **Location**: `src/lib/types.ts`

### 9. Screen Creation Flow

- **Decision**: No auto-selection or auto-centering when creating screens
- **Reason**: Prevents viewport disruption when creating multiple screens quickly
- **Z-Index**: Newer screens appear above older ones; selected screens always on top
- **Two-Click Behavior**: First click on empty space deselects current screen, second click (when no screen selected) shows initial popup
- **Two-Step Flow**:
  1. First shows `CreateScreenPopup` component with "Create screen" title and "Mobile app" button
  2. Clicking "Mobile app" button shows the "What you want to create" dialog form
- **Implementation**:
  - Track `hadSelectedScreen` in `handleMouseDown` to determine if popup should appear
  - Use `isCreateScreenPopupMode` state for initial popup, `isNewScreenMode` for prompt form
  - Both popups can be dismissed by clicking outside
- **Location**: `src/app/page.tsx`, `src/components/CreateScreenPopup.tsx`

### 10. Draggable Screens

- **Decision**: Allow unselected screens to be dragged for repositioning
- **Reason**: Enables spatial organization of screens without requiring selection
- **Implementation**:
  - Track `draggedScreenId` and `isDraggingScreen` state to distinguish between click and drag
  - Only mark as dragging after mouse moves >5px to allow clicks to select
  - Prevent viewport panning as soon as `draggedScreenId` is set (even before 5px threshold)
  - Update screen position in content coordinates, accounting for viewport scale
  - Selected screens remain non-draggable to allow interaction with their content
  - Deselect current screen when starting to drag another screen
  - Prevent selection if user dragged (not just clicked)
- **Location**: `src/app/page.tsx`

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

- **Decision**: Add overlay layer to highlight interactive elements (`<a>` and `<button>`) without modifying generated content
- **Reason**: Helps users identify clickable elements in generated designs for accessibility and design review
- **Implementation**:
  - Toggle button (TbHandClick icon) next to screen title to show/hide highlights
  - Icon is gray (`text-gray-400`) by default, blue (`text-blue-500`) when active
  - Overlay layer positioned absolutely over iframe with `pointer-events: none` to avoid interference
  - Highlights `<a>` elements with `href` attribute in magenta (`#ff00ff` with 10% opacity fill)
  - Highlights `<button>` elements in cyan (`#00ffff` with 10% opacity fill)
  - Uses `offsetLeft`/`offsetTop` to calculate element positions relative to iframe document (not affected by CSS transforms)
  - Adds iframe offset within container to get final position relative to container (where overlay is positioned)
  - Updates highlights when iframe content loads, changes, or window resizes
  - State (`showClickables`) is not persisted - resets to `false` on page reload
- **Gotcha**: `getBoundingClientRect()` returns viewport coordinates affected by CSS transforms, so we use `offsetLeft`/`offsetTop` instead to get positions relative to iframe document
- **Location**: `src/components/Screen.tsx`

### 20. Auth Flow Preservation

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

## Environment Variables

### Required

- `GOOGLE_GENERATIVE_AI_API_KEY`: Google Gemini API key
  - The `@ai-sdk/google` package automatically reads this variable
  - No need to pass it explicitly to the `google()` function
  - Get key from: https://makersuite.google.com/app/apikey
- `UNSPLASH_ACCESS_KEY`: Unsplash API Access Key
  - Get from: https://unsplash.com/developers
- `AUTH_SECRET`: Secret key for session encryption
  - Generate with: `openssl rand -base64 32`
  - Required for Auth.js session management
- `AUTH_URL`: Base URL for authentication
  - Local development: `http://localhost:3000`
  - Production: `https://your-domain.com`
- `GOOGLE_CLIENT_ID`: Google OAuth 2.0 Client ID
  - Get from Google Cloud Console > APIs & Services > Credentials
- `GOOGLE_CLIENT_SECRET`: Google OAuth 2.0 Client Secret
  - Get from Google Cloud Console > APIs & Services > Credentials
  - **Important**: When setting via Vercel CLI, use `echo -n` to avoid trailing newlines

## Important Code Locations

### API Route

- **File**: `src/app/api/create/route.ts`
- **Key Functions**:
  - **Requires Authentication**: Checks for authenticated session using `auth()` from Auth.js
  - Returns 401 Unauthorized if no session exists (client handles this by saving prompt and triggering auth)
  - Imports `GENERATE_UI_PROMPT` constant from `src/prompts/generate-ui.ts` as system prompt
  - Uses `gemini-2.5-flash` model with temperature 0.5
  - Cleans markdown code blocks from response
  - Returns `{ html: string }` with title metadata comment (`<!-- Title: ... -->`)

### Authentication

- **File**: `src/app/api/auth/[...nextauth]/route.ts`
- **Key Features**:
  - Google OAuth provider configuration
  - JWT session strategy
  - Callbacks to include user ID, name, email, and image in session
  - Exports `handlers`, `signIn`, `signOut`, and `auth` functions
  - `trustHost: true` to allow custom hosts (localhost, etc.)

### UserAvatar Component

- **File**: `src/components/UserAvatar.tsx`
- **Key Features**:
  - Uses `useSession` hook from `next-auth/react` to get session data
  - Fixed position in top-right corner (`fixed top-4 right-4 z-[9999]`)
  - Not affected by viewport transforms (positioned outside viewport-content div)
  - Shows default icon (`FaUserCircle`) when not authenticated
  - Shows Google profile image when authenticated (using Next.js Image component)
  - Click handler: initiates sign-in if not authenticated, shows popup if authenticated
  - Popup displays user name, email, and logout button
  - Prevents event propagation (onMouseDown, onMouseMove, onMouseUp, onClick) to avoid interfering with viewport
  - Uses `cursor-default` on popup menu to override viewport cursor
  - Closes popup when clicking outside

### Screen Component

- **File**: `src/components/Screen.tsx`
- **Key Features**:
  - Manages `conversationPoints` state (array of ConversationPoint objects)
  - Extracts screen title from HTML metadata (`<!-- Title: ... -->`) and displays it above the screen
  - **Flexible Layout**: Screen container has flexible width (stretches horizontally) with min-height of 844px
  - **Dynamic Iframe Height**: Iframe width is fixed at 390px, but height adjusts dynamically based on content (minimum 844px)
  - **Height Communication**: Uses `postMessage` API to communicate content height from iframe to parent
  - **Minimum Height Enforcement**: CSS ensures html, body, and root content element have min-height: 844px
  - Wraps generated HTML with full document structure and simplified CSS/JS for height management
  - Injects Tailwind CDN and helper scripts
  - Renders iframe with `sandbox="allow-same-origin allow-scripts"`
  - Auto-starts generation when screen has conversation point without HTML
  - Replaces incomplete conversation points instead of duplicating them (prevents duplicate prompts)
  - Adds modification prompts to history immediately (before API response) for better UX
  - Replaces incomplete points with completed ones when generation finishes
  - Removes incomplete points if generation fails
  - Uses `generationInProgressRef` with screen ID + timestamp key to prevent duplicate API calls
  - Reuses existing incomplete conversation points when auto-generation triggers to prevent duplicates
  - **Auth Flow Preservation**: When API returns 401, saves prompt and screenId to storage, triggers sign-in, and auto-retries after auth
  - Displays "No content" message when screen has no HTML
  - Shows PromptPanel only when screen is selected
  - **Clickable Highlights**: Toggle button next to screen title to show/hide interactive element highlights
    - Highlights `<a>` elements with `href` attribute in magenta
    - Highlights `<button>` elements in cyan
    - Overlay layer positioned absolutely over iframe without modifying generated content
    - Uses `offsetLeft`/`offsetTop` to calculate positions relative to iframe document (not affected by CSS transforms)
    - State is not persisted (resets on page reload)
  - **HTML Wrapper**: Simplified implementation with CSS rules for min-height and JavaScript for height calculation

### Prompt Panel

- **File**: `src/components/PromptPanel.tsx`
- **Key Features**:
  - Displays conversation points (prompts) as clickable cards
  - Highlights selected prompt with blue border and background
  - Modification input field with label "What you would like to change"
  - Ctrl/Cmd+Enter to submit modifications
  - Positioned absolutely to the right of Screen component
  - Uses `left-full ml-2` for positioning

### Storage

- **File**: `src/lib/storage.ts`
- **Key Features**:
  - `Storage` interface with `saveScreens`, `loadScreens`, `clearScreens`, `saveViewportTransform`, `loadViewportTransform`, `savePendingPrompt`, `loadPendingPrompt`, `clearPendingPrompt` methods
  - `IdbStorage` class implementing IndexedDB operations
  - Uses `idb` package for IndexedDB wrapper
  - Database name: `ui-gen-db`, version: 3 (upgraded from 2 to add pendingPrompt store)
  - Object stores:
    - `screens` with key `"all"` storing array of ScreenData
    - `viewportTransform` with key `"current"` storing ViewportTransform
    - `pendingPrompt` with key `"current"` storing `{ prompt: string, screenId: string | null, position: { x: number, y: number } | null }`
  - Auto-saves screens whenever they change (debounced by 300ms to prevent race conditions)
  - Auto-saves viewport transform with 500ms debounce
  - Auto-loads screens and viewport transform on mount
  - Pending prompts are saved when auth is required and loaded after authentication
  - Easy to swap for backend persistence (just implement Storage interface)

### Types

- **File**: `src/lib/types.ts`
- **Key Types**:
  - `ConversationPoint`: `{ prompt: string, html: string, title: string | null, timestamp: number }`
  - `ScreenData`: `{ id: string, conversationPoints: ConversationPoint[], selectedPromptIndex: number | null, position?: { x: number, y: number } }`
- **File**: `src/lib/storage.ts`
- **Key Types**:
  - `ViewportTransform`: `{ x: number, y: number, scale: number }` - Camera position and zoom level

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

## Known Issues & Workarounds

### 1. Tailwind CDN in Iframe

- **Issue**: Tailwind CDN may not always process classes correctly in iframes
- **Workaround**: Trigger a reflow by accessing `document.body.offsetHeight`
- **Location**: `src/components/Screen.tsx` (script in HTML wrapper)

### 2. Markdown Code Blocks

- **Issue**: AI sometimes wraps output in markdown code blocks
- **Workaround**: Regex cleanup in API endpoint
- **Location**: `src/app/api/create/route.ts`

### 3. Iframe Sandbox Restrictions

- **Issue**: Scripts won't run without proper sandbox permissions
- **Workaround**: Use `sandbox="allow-same-origin allow-scripts"`
- **Location**: `src/components/Screen.tsx` (iframe element)

## Dependencies

### Core

- `next`: 16.0.0 - Framework
- `react`: 19.2.0 - UI library
- `typescript`: 5.x - Type safety

### AI

- `ai`: ^4.0.0 - Vercel AI SDK
- `@ai-sdk/google`: ^1.2.22 - Google Gemini provider

### Styling

- `tailwindcss`: ^4 - CSS framework
- `react-icons`: ^5.5.0 - Icon library

### Storage

- `idb`: Latest - IndexedDB wrapper for client-side persistence

## File Naming Conventions

- Components: PascalCase (e.g., `Screen.tsx`, `PromptPanel.tsx`)
- API routes: lowercase (e.g., `route.ts` in `api/create/`)
- Utilities: camelCase (e.g., `utils.ts`)

## Component Props

### PromptPanel

```typescript
interface PromptPanelProps {
  conversationPoints: ConversationPoint[];
  onSend: (modificationPrompt: string) => void;
  isLoading: boolean;
  selectedPromptIndex: number | null;
  onPromptSelect: (pointIndex: number) => void;
}
```

## API Response Format

### Success

```json
{
  "html": "<div class=\"flex h-full w-full\">...</div>"
}
```

### Error

```json
{
  "error": "Error message"
}
```

## Development Workflow

### Creating New Screen

1. User clicks empty space (first click deselects if screen selected, second click shows initial popup)
2. `CreateScreenPopup` component appears at click location with "Create screen" title and "Mobile app" button
3. User clicks "Mobile app" button to open the prompt dialog form
4. User enters prompt and clicks "Create"
5. Screen is created with initial conversation point (prompt, no HTML yet)
6. `Screen` component auto-detects incomplete conversation point and calls `/api/create`
7. API endpoint:
   - Uses `GENERATE_UI_PROMPT` constant from `src/prompts/generate-ui.ts` as system prompt
   - Converts conversation points to history format (only completed points with HTML)
   - Calls Gemini API via Vercel AI SDK
   - Cleans markdown code blocks
   - Returns HTML with title metadata comment
8. `Screen` component:
   - Extracts title from HTML metadata (`<!-- Title: ... -->`)
   - Replaces the incomplete conversation point with completed one (prevents duplicate)
   - Updates conversation point with HTML and title
   - Displays title above the screen
   - Wraps HTML with document structure
   - Injects Tailwind CDN
   - Sets `srcDoc` on iframe
9. Screen data is automatically saved to IndexedDB
10. Iframe renders the generated UI

### Making Modifications

1. User selects a screen to see prompt history panel
2. User clicks "Modify" button
3. User enters modification request and clicks "Create"
4. `Screen` component immediately adds incomplete conversation point to history (prompt appears right away)
5. API call is made with full conversation history
6. When API response arrives, incomplete point is replaced with completed point
7. If API call fails, incomplete point is removed from history
8. User can click prompts in history panel to view different versions

## Testing Considerations

- Test with various prompt types (simple, complex, edge cases)
- Verify Tailwind classes are applied correctly
- Check iframe sandbox permissions
- Test markdown code block cleanup
- Verify loading states work correctly
- Test error handling

## Future Improvements to Consider

1. **Streaming Responses**: Use `streamText` instead of `generateText` for faster perceived performance
2. **Error Recovery**: Better error messages and retry mechanisms
3. **UI Export**: Allow users to download generated HTML
4. **Backend Persistence**: Replace IndexedDB with backend API (easy swap via Storage interface)
5. **Multiple Sizes**: Support different screen sizes beyond 390px × 844px
6. **Custom Tailwind Config**: Allow users to customize Tailwind settings
7. **Pre-compiled Tailwind**: Consider using a pre-compiled Tailwind CSS file instead of CDN for better reliability
8. **Screen Deletion**: Add ability to delete screens
9. **Screen Reordering**: Add ability to manually reorder screens
10. **Export All**: Export all screens as a collection

## Notes for AI Assistants

- System prompt is in `src/prompts/generate-ui.ts` as `GENERATE_UI_PROMPT` constant - update this file when modifying generation logic
- The API endpoint automatically cleans markdown code blocks - don't duplicate this logic
- Generated HTML includes title metadata (`<!-- Title: ... -->`) which is extracted and displayed above screens
- Screen component extracts and displays titles from HTML metadata for both active and inactive screens
- Iframe sandbox must allow scripts for Tailwind to work
- Screen component has flexible width (stretches horizontally) with min-height of 844px
- Iframe width is fixed at 390px, height adjusts dynamically based on content (minimum 844px)
- Empty state: When no screens exist, displays "Click anywhere to create your first screen" message at 0,0 in viewport coordinates (centered on first load)
- HTML wrapper uses simplified CSS/JS: CSS sets min-height on html, body, and body > \*; JavaScript calculates and sends height via postMessage
- PromptPanel is positioned absolutely relative to Screen component wrapper
- Loading spinner only covers Screen, not the entire page
- Data structure: Use `ConversationPoint` type for storing prompt, HTML, title, and timestamp together
- Storage abstraction: Use `Storage` interface from `src/lib/storage.ts` - can be swapped for backend easily
- Screens are auto-saved to IndexedDB on every change, auto-loaded on mount
- Viewport transform (camera position and zoom) is auto-saved with 500ms debounce, auto-loaded on mount
- New screens are NOT auto-selected or auto-centered to prevent viewport disruption
- Z-index: Newer screens appear above older ones; selected screens always on top
- Duplicate API call prevention: `generationInProgressRef` tracks in-progress generations using screen ID + timestamp key
- Race condition prevention: `handleScreenUpdate` uses functional updates to always work with latest state
- Storage debouncing: Screen saves are debounced by 300ms to batch rapid updates and prevent race conditions
- Position preservation: Screen positions are always preserved during updates unless explicitly changed
- Wheel event listener uses `{ passive: false }` to allow preventDefault for zoom
- No default screen - page starts empty, user clicks to create first screen
- Screen dragging: Unselected screens can be dragged; panning is disabled during drag; selected screens are non-draggable
- Drag detection: Only mark as dragging after >5px movement to allow clicks to select; prevent panning as soon as `draggedScreenId` is set
- Camera persistence: Viewport transform is persisted to IndexedDB in `viewportTransform` object store with key `"current"`
- New screen creation: Two-click behavior - first click deselects, second click shows initial popup; two-step flow: CreateScreenPopup with "Mobile app" button → prompt dialog form
- CreateScreenPopup component: Separate component for initial screen type selection; uses forwardRef for click-outside detection; ghost button style with icon and label
- Conversation points: Incomplete points are replaced (not duplicated) when generation completes; modification prompts appear immediately in history
- OAuth authentication: UserAvatar component in top-right corner; `/api/create` endpoint requires authenticated session; Auth.js v5 with Google OAuth provider
- UserAvatar positioning: Fixed position (`fixed top-4 right-4`) outside viewport-content div to avoid transform effects; prevents event propagation to avoid viewport interference
- OAuth environment variables: Must not have trailing newlines when setting via Vercel CLI (use `echo -n`); `AUTH_URL` must match production domain exactly
- Auth flow preservation: When 401 occurs, prompt and screenId are saved to IndexedDB; after auth, screen is selected and generation auto-retries; pending prompts are cleared after restoration
- 2025-03-29: Reviewed README.md and docs to refresh context; ready for follow-up implementation work.
- 2025-03-29: Updated README with collaboration/persistence documentation (Yjs + Prisma flow, env vars, setup checklist).
- 2025-03-29: Added docs/PERSITENCE.md detailing persistence hardening priorities and effort estimates.
- 2025-03-29: Temporarily locked project access so only sessions whose `user.id` matches `projectId` can hit project/Yjs endpoints (simple safeguard before full membership model).
- 2025-03-29: Implemented persistence hardening pass (shared Yjs doc store + Prisma helper, SSE state endpoint, client-side batching/state-vector sync, IndexedDB metadata clearing, linted/format run).
- 2025-03-29: Simplified project routing—server now uses `session.user.id` as the project key (query params ignored) and client no longer sends `projectId` in Yjs requests; also delay IndexedDB/Yjs persistence until drag completes to avoid streaming position writes.
- 2025-03-29: Added server-side state vector tracking + shared hydration helper with deduped promises so server docs preload from Prisma exactly once, cache their state vector, and skip redundant persistence when clients reconnect.
- 2025-03-30: Read through README.md and docs to refresh high-level architecture/context per user request; ready for follow-up tasks.
- 2025-03-30: Added fixed sync-status indicator (react-icons) wired to new Yjs provider status snapshots/retry hook so users can see offline/syncing/synced/error states with tooltip + manual retry that isn't affected by viewport transforms.
