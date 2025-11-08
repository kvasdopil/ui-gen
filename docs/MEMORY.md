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

- **Decision**: Single `/api/create` endpoint that reads system prompt from file
- **Reason**: Keeps prompt management in markdown file, easier to update
- **Important**: System prompt is read from `docs/GENERATE_UI.md` at runtime
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
  - Reads `docs/GENERATE_UI.md` as system prompt
  - Uses `gemini-2.5-flash` model with temperature 0.5
  - Cleans markdown code blocks from response
  - Returns `{ html: string }`

### Screen Component

- **File**: `src/components/Screen.tsx`
- **Key Features**:
  - Manages `input`, `htmlContent`, and `isLoading` state
  - Wraps generated HTML with full document structure
  - Injects Tailwind CDN and helper scripts
  - Renders iframe with `sandbox="allow-same-origin allow-scripts"`

### Prompt Panel

- **File**: `src/components/PromptPanel.tsx`
- **Key Features**:
  - Multiline textarea (6 rows)
  - Ctrl/Cmd+Enter to submit
  - Positioned absolutely to the right of Screen component
  - Uses `left-full ml-2` for positioning

## System Prompt

### Location

- **File**: `docs/GENERATE_UI.md`
- **Purpose**: Defines how the AI should generate UI mockups

### Key Requirements (from prompt)

- Generate ONLY page content (no `<!DOCTYPE>`, `<html>`, `<head>`, `<body>` tags)
- Use HTML with `class` attribute (not JSX `className`)
- Root element must be `<div class="flex h-full w-full">`
- Container size: 390px × 844px
- No JavaScript, no interactive elements
- Use Tailwind CSS classes exclusively
- Use SVG icons or icon fonts/CDN
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

## File Naming Conventions

- Components: PascalCase (e.g., `Screen.tsx`, `PromptPanel.tsx`)
- API routes: lowercase (e.g., `route.ts` in `api/create/`)
- Utilities: camelCase (e.g., `utils.ts`)

## Component Props

### PromptPanel

```typescript
interface PromptPanelProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  isLoading: boolean;
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

1. User enters prompt in `PromptPanel`
2. `Screen` component calls `/api/create` with prompt
3. API endpoint:
   - Reads `GENERATE_UI.md` as system prompt
   - Calls Gemini API via Vercel AI SDK
   - Cleans markdown code blocks
   - Returns HTML
4. `Screen` component:
   - Wraps HTML with document structure
   - Injects Tailwind CDN
   - Sets `srcDoc` on iframe
5. Iframe renders the generated UI

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
4. **History**: Save and reload previously generated UIs
5. **Multiple Sizes**: Support different screen sizes beyond 390px × 844px
6. **Custom Tailwind Config**: Allow users to customize Tailwind settings
7. **Pre-compiled Tailwind**: Consider using a pre-compiled Tailwind CSS file instead of CDN for better reliability

## Notes for AI Assistants

- Always check `docs/GENERATE_UI.md` when modifying generation logic
- The API endpoint automatically cleans markdown code blocks - don't duplicate this logic
- Iframe sandbox must allow scripts for Tailwind to work
- Screen component is 390px × 844px - this is fixed and important for mobile mockups
- PromptPanel is positioned absolutely relative to Screen component wrapper
- Loading spinner only covers Screen, not the entire page
