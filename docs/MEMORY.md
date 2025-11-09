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
- **Reason**: Persist screens, conversations, and generated content without backend dependency
- **Implementation**: 
  - Storage abstraction interface in `src/lib/storage.ts`
  - `IdbStorage` class implementing IndexedDB operations
  - Auto-save on screen changes, auto-load on mount
  - Easy to swap for backend persistence later (just implement Storage interface)
- **Location**: `src/lib/storage.ts`, `src/lib/types.ts`

### 8. Data Structure

- **Decision**: Store conversation points (prompt, HTML, title, timestamp) instead of separate history and HTML
- **Reason**: Better organization, stores complete metadata for each conversation point
- **Structure**: `ConversationPoint` type with `prompt`, `html`, `title`, `timestamp`
- **Location**: `src/lib/types.ts`

### 9. Screen Creation Flow

- **Decision**: No auto-selection or auto-centering when creating screens
- **Reason**: Prevents viewport disruption when creating multiple screens quickly
- **Z-Index**: Newer screens appear above older ones; selected screens always on top
- **Location**: `src/app/page.tsx`

## Environment Variables

### Required

- `GOOGLE_GENERATIVE_AI_API_KEY`: Google Gemini API key
  - The `@ai-sdk/google` package automatically reads this variable
  - No need to pass it explicitly to the `google()` function
  - Get key from: https://makersuite.google.com/app/apikey

## Important Code Locations

### API Route

- **File**: `src/app/api/create/route.ts`
- **Key Functions**:
  - Imports `GENERATE_UI_PROMPT` constant from `src/prompts/generate-ui.ts` as system prompt
  - Uses `gemini-2.5-flash` model with temperature 0.5
  - Cleans markdown code blocks from response
  - Returns `{ html: string }` with title metadata comment (`<!-- Title: ... -->`)

### Screen Component

- **File**: `src/components/Screen.tsx`
- **Key Features**:
  - Manages `conversationPoints` state (array of ConversationPoint objects)
  - Extracts screen title from HTML metadata (`<!-- Title: ... -->`) and displays it above the screen
  - Wraps generated HTML with full document structure
  - Injects Tailwind CDN and helper scripts
  - Renders iframe with `sandbox="allow-same-origin allow-scripts"`
  - Auto-starts generation when screen has conversation point without HTML
  - Uses `generationInProgressRef` to prevent duplicate API calls
  - Displays "No content" message when screen has no HTML
  - Shows PromptPanel only when screen is selected

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
  - `Storage` interface with `saveScreens`, `loadScreens`, `clearScreens` methods
  - `IdbStorage` class implementing IndexedDB operations
  - Uses `idb` package for IndexedDB wrapper
  - Database name: `ui-gen-db`, version: 1
  - Object store: `screens` with key `"all"` storing array of ScreenData
  - Auto-saves screens whenever they change
  - Auto-loads screens on mount
  - Easy to swap for backend persistence (just implement Storage interface)

### Types

- **File**: `src/lib/types.ts`
- **Key Types**:
  - `ConversationPoint`: `{ prompt: string, html: string, title: string | null, timestamp: number }`
  - `ScreenData`: `{ id: string, conversationPoints: ConversationPoint[], selectedPromptIndex: number | null, position?: { x: number, y: number } }`

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

1. User clicks empty space to create new screen
2. Floating form appears at click location
3. User enters prompt and clicks "Create"
4. Screen is created with initial conversation point (prompt, no HTML yet)
5. `Screen` component auto-detects incomplete conversation point and calls `/api/create`
6. API endpoint:
   - Uses `GENERATE_UI_PROMPT` constant from `src/prompts/generate-ui.ts` as system prompt
   - Converts conversation points to history format (only completed points with HTML)
   - Calls Gemini API via Vercel AI SDK
   - Cleans markdown code blocks
   - Returns HTML with title metadata comment
7. `Screen` component:
   - Extracts title from HTML metadata (`<!-- Title: ... -->`)
   - Updates conversation point with HTML and title
   - Displays title above the screen
   - Wraps HTML with document structure
   - Injects Tailwind CDN
   - Sets `srcDoc` on iframe
8. Screen data is automatically saved to IndexedDB
9. Iframe renders the generated UI
10. User can click prompts in history panel to view different versions
11. User can click "Modify" to add new conversation points

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
- Screen component is 390px × 844px - this is fixed and important for mobile mockups
- PromptPanel is positioned absolutely relative to Screen component wrapper
- Loading spinner only covers Screen, not the entire page
- Data structure: Use `ConversationPoint` type for storing prompt, HTML, title, and timestamp together
- Storage abstraction: Use `Storage` interface from `src/lib/storage.ts` - can be swapped for backend easily
- Screens are auto-saved to IndexedDB on every change, auto-loaded on mount
- New screens are NOT auto-selected or auto-centered to prevent viewport disruption
- Z-index: Newer screens appear above older ones; selected screens always on top
- Duplicate API call prevention: `generationInProgressRef` tracks in-progress generations
- Wheel event listener uses `{ passive: false }` to allow preventDefault for zoom
- No default screen - page starts empty, user clicks to create first screen
