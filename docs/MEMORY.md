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

- **Decision**: RESTful API with separate endpoints for screens and dialog entries
- **Reason**: Better separation of concerns, consistent with REST principles, allows for more granular operations
- **Endpoints**:
  - `GET /api/screens` - List all screens for user's workspace
  - `POST /api/screens` - Create new screen (requires x, y coordinates)
  - `PUT /api/screens/:id` - Update screen (partial data)
  - `DELETE /api/screens/:id` - Delete screen
  - `GET /api/screens/:id/dialog` - List dialog entries for a screen
  - `POST /api/screens/:id/dialog` - Create dialog entry (generates HTML)
  - `DELETE /api/screens/:id/dialog/:dialogId` - Delete dialog entry
- **Deprecated**: `/api/create` endpoint is deprecated but kept for backward compatibility
- **UI Generation**: Extracted to `src/lib/ui-generation.ts` as reusable function
- **Location**: `src/app/api/screens/`, `src/lib/ui-generation.ts`

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
- **Structure**: `ConversationPoint` type with `prompt`, `html`, `title`, `timestamp`
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

- **Decision**: Allow all screens (selected and unselected) to be dragged for repositioning
- **Reason**: Enables spatial organization of screens without requiring deselection
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
- **Location**: `src/app/page.tsx`, `src/components/Screen.tsx`

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
  - Uses `offsetLeft`/`offsetTop` to calculate element positions relative to iframe document (not affected by CSS transforms)
  - Adds iframe offset within container to get final position relative to container (where overlay is positioned)
  - Updates highlights when iframe content loads, changes, or window resizes
  - State (`showClickables`) is not persisted - resets to `false` on page reload
  - **Clickable Overlays**: Overlay highlight divs have `pointerEvents: "auto"` and `data-overlay-highlight` attribute
    - Clicking on overlay highlights starts arrow creation (calls `onOverlayClick`)
    - Screen drag handler checks for overlay clicks and skips dragging if click is on overlay
    - Prevents screen dragging when clicking on touchable elements - allows link creation instead
- **Gotcha**: `getBoundingClientRect()` returns viewport coordinates affected by CSS transforms, so we use `offsetLeft`/`offsetTop` instead to get positions relative to iframe document
- **Location**: `src/components/Screen.tsx`, `src/app/page.tsx`

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
- `DATABASE_URL`: Neon PostgreSQL connection string
  - Get from Neon dashboard or CLI: `neonctl projects list`
  - Format: `postgresql://user:password@host/database?sslmode=require`
  - Required for Prisma database access

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
  - GET: List all dialog entries for a screen
  - POST: Create dialog entry (requires prompt, generates HTML automatically)
  - DELETE: Delete dialog entry
  - Dialog entries are immutable (no update endpoint)

- **UI Generation**: `src/lib/ui-generation.ts`
  - Extracted reusable function `generateUIFromHistory()`
  - Uses `GENERATE_UI_PROMPT` constant from `src/prompts/generate-ui.ts` as system prompt
  - Uses `gemini-2.5-flash` model with temperature 0.5
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
  - **Create Button Fix**: Uses `onMouseDown` with `preventDefault()` instead of `onClick` to prevent blur event from dismissing the panel when textarea is focused
    - Prevents `onBlur` handler from closing the form before `handleCreate` can execute
    - Ensures form stays open and create action completes successfully
  - Positioned absolutely to the right of Screen component
  - Uses `left-full ml-2` for positioning

### Storage

- **File**: `src/lib/storage.ts`
- **Key Features**:
  - `Storage` interface with `saveScreens`, `loadScreens`, `clearScreens`, `saveViewportTransform`, `loadViewportTransform`, `savePendingPrompt`, `loadPendingPrompt`, `clearPendingPrompt` methods
  - `ApiStorage` class implementing API-based storage for screens
  - Uses REST API endpoints for screens and dialog entries
  - Uses IndexedDB for client-side state (viewport transform, pending prompts)
  - Database name: `ui-gen-db`, version: 2
  - Object stores:
    - `viewportTransform` with key `"current"` storing ViewportTransform
    - `pendingPrompt` with key `"current"` storing `{ prompt: string, screenId: string | null, position: { x: number, y: number } | null }`
  - Auto-saves screens to API whenever they change (debounced by 300ms)
  - Auto-saves viewport transform with 500ms debounce
  - Auto-loads screens from API on mount
  - Pending prompts are saved when auth is required and loaded after authentication

### Types

- **File**: `src/lib/types.ts`
- **Key Types**:
  - `ConversationPoint`: `{ prompt: string, html: string, title: string | null, timestamp: number, arrows?: ConversationPointArrow[] }`
  - `ScreenData`: `{ id: string, conversationPoints: ConversationPoint[], selectedPromptIndex: number | null, position?: { x: number, y: number }, height?: number }`
- **File**: `src/lib/storage.ts`
- **Key Types**:
  - `ViewportTransform`: `{ x: number, y: number, scale: number }` - Camera position and zoom level
- **File**: `prisma/schema.prisma`
- **Database Models**:
  - `Workspace`: `{ id: uuid, userId: string (email hash), name: string (default: 'default'), createdAt, updatedAt }`
  - `Screen`: `{ id: uuid, workspaceId: uuid, positionX: float, positionY: float, selectedPromptIndex: int?, createdAt, updatedAt }`
  - `DialogEntry`: `{ id: uuid, screenId: uuid, prompt: string, html: string?, title: string?, timestamp: bigint, createdAt, updatedAt }`

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
5. **Step 1**: Screen is created via `POST /api/screens` (with x, y coordinates)
   - Screen appears immediately with empty conversation points
   - Screen ID is returned right away
6. **Step 2**: First dialog entry is created via `POST /api/screens/:id/dialog` (with prompt)
   - API endpoint uses `generateUIFromHistory()` from `src/lib/ui-generation.ts`
   - Converts existing dialog entries to history format (none for first entry)
   - Calls Gemini API via Vercel AI SDK
   - Cleans markdown code blocks
   - Returns dialog entry with HTML and title metadata
7. `Screen` component:
   - Updates with the new dialog entry
   - Extracts title from HTML metadata (`<!-- Title: ... -->`)
   - Displays title above the screen
   - Wraps HTML with document structure
   - Injects Tailwind CDN
   - Sets `srcDoc` on iframe
8. Screen data is automatically saved to database via API
9. Iframe renders the generated UI

### Making Modifications

1. User selects a screen to see prompt history panel
2. User clicks "Modify" button
3. User enters modification request and clicks "Create"
4. `Screen` component immediately adds incomplete conversation point to history (prompt appears right away)
5. API call is made to `POST /api/screens/:id/dialog` with the prompt
6. API endpoint:
   - Loads all existing dialog entries for the screen
   - Converts them to history format
   - Adds the new prompt to history
   - Calls `generateUIFromHistory()` to generate HTML
   - Creates new dialog entry in database
7. When API response arrives, incomplete point is replaced with completed point
8. If API call fails, incomplete point is removed from history
9. User can click prompts in history panel to view different versions

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
4. **Backend Persistence**: ✅ Completed - Screens and dialog entries now use PostgreSQL database via REST API
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
- UI generation logic is extracted to `src/lib/ui-generation.ts` as reusable function `generateUIFromHistory()`
- The UI generation function automatically cleans markdown code blocks - don't duplicate this logic
- Storage abstraction: Use `Storage` interface from `src/lib/storage.ts` - uses API for screens, IndexedDB for client state
- Screens are auto-saved to database via API on every change, auto-loaded from API on mount
- Viewport transform (camera position and zoom) is auto-saved to IndexedDB with 500ms debounce, auto-loaded on mount
- Database: Neon PostgreSQL with Prisma ORM (see `prisma/schema.prisma`)
- User identification: Email hash (SHA-256) used as userId for privacy (see `src/lib/auth.ts` - `hashEmail()` function)
- Workspace: Each user has a default workspace (email hash + name 'default')
- Screen creation: Two-step process - create screen first via `POST /api/screens`, then create first dialog entry via `POST /api/screens/:id/dialog`
- Dialog entries: Immutable once created (no update endpoint, only DELETE)
- API endpoints: RESTful design with separate endpoints for screens and dialog entries (see `src/app/api/screens/`)
- Validation: Zod schemas used for all API request validation (see `src/lib/validations.ts`)
- All API endpoints require authentication - use `getAuthenticatedUser()` from `src/lib/auth.ts`
- Workspace auto-creation: Use `getOrCreateWorkspace()` from `src/lib/auth.ts` to get or create user's workspace
- Deprecated endpoint: `/api/create` is deprecated but kept for backward compatibility
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
- OAuth authentication: UserAvatar component in top-right corner; all API endpoints require authenticated session; Auth.js v5 with Google OAuth provider
- UserAvatar positioning: Fixed position (`fixed top-4 right-4`) outside viewport-content div to avoid transform effects; prevents event propagation to avoid viewport interference
- OAuth environment variables: Must not have trailing newlines when setting via Vercel CLI (use `echo -n`); `AUTH_URL` must match production domain exactly
- Auth flow preservation: When 401 occurs, prompt and screenId are saved to IndexedDB; after auth, screen is selected and generation auto-retries; pending prompts are cleared after restoration
