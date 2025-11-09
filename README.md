# UI Generator

An AI-powered UI mockup generator that creates beautiful, non-interactive HTML interfaces using Google Gemini and Tailwind CSS. Users can describe their desired UI in natural language, and the application generates a mobile-optimized (390px × 844px) HTML mockup rendered in an iframe.

## Features

- 🤖 **AI-Powered Generation**: Uses Google Gemini (via Vercel AI SDK) to generate UI mockups from natural language prompts
- 📱 **Mobile-First Design**: Generates UIs optimized for mobile screens (iPhone 13/14 standard: 390px × 844px)
- 🎨 **Tailwind CSS**: All generated UIs use Tailwind CSS for styling via CDN
- 🎯 **Font Awesome Icons**: Generated UIs use Font Awesome icons via CDN for consistent, professional iconography
- 🖼️ **Iframe Rendering**: Generated HTML is safely rendered in an isolated iframe
- ⚡ **Real-time Generation**: Fast UI generation with loading states and error handling
- 🧹 **Clean Output**: Automatically strips markdown code blocks from AI responses
- 🔄 **Follow-up Modifications**: Iteratively refine designs by modifying previous prompts with full conversation context
- 📜 **Conversation History**: View all previous prompts in a history panel with the ability to modify and regenerate
- 🖱️ **Clickable Prompts**: Click any prompt in the history to view its corresponding LLM output
- 🗑️ **Delete History Entries**: Delete conversation points from history; deleting the last entry removes the entire screen
- 📊 **Output History**: Browse through all generated UI outputs by selecting different prompts from the history
- 🎯 **Multiple Screens**: Create and manage multiple UI screens simultaneously
- ➕ **New Screen Creation**: Click anywhere on empty space to create a new screen at that location
- 📍 **Positioned Screens**: Each screen is positioned absolutely at its creation location
- 💾 **Persistent Storage**: All screens, conversations, generated content, and camera position/zoom are automatically saved to IndexedDB
- 🔍 **Pan & Zoom Viewport**: Press and drag to pan and scroll to zoom (10% to 100%) the viewport
- 🖱️ **Selectable Screens**: Click any screen to select it and see its prompt panel
- 🎨 **Visual Selection**: Selected screens display a 2px blue border
- 👆 **Click Outside to Deselect**: Click on empty space to deselect the current screen
- 🖱️ **Draggable Screens**: Drag unselected screens to reposition them; panning is disabled during screen drag
- 📍 **Camera Persistence**: Camera position and zoom level are saved and restored when you reload the page
- 🏷️ **Screen Titles**: Each generated screen displays a descriptive title above it, extracted from HTML metadata

## User Stories

### UI Generation

- **As a** designer or developer, **I want to** describe a UI in natural language, **so that** I can quickly generate a visual mockup without writing code
- **As a** user, **I want to** see a loading indicator while my UI is being generated, **so that** I know the system is processing my request
- **As a** user, **I want to** generate UIs optimized for mobile screens (390px × 844px), **so that** I can create mobile-first designs
- **As a** user, **I want to** generate UIs using Tailwind CSS, **so that** the generated mockups use modern, consistent styling

### UI Modification

- **As a** user, **I want to** modify an existing generated UI by describing changes, **so that** I can iteratively refine the design
- **As a** user, **I want to** see my previous prompts displayed in a history panel, **so that** I can track the evolution of my design
- **As a** user, **I want to** see my first prompt appear in the history panel immediately when I click "Create", **so that** I can see the conversation history right away
- **As a** user, **I want to** click a "Modify" button to enter a new modification request, **so that** I can easily request changes
- **As a** user, **I want to** cancel the modify flow by clicking away from an empty input field, **so that** I can easily exit edit mode
- **As a** user, **I want to** send modification requests using keyboard shortcuts (Ctrl+Enter / Cmd+Enter), **so that** I can work efficiently

### Display & Rendering

- **As a** user, **I want to** see generated UIs rendered in an isolated iframe, **so that** the generated content doesn't affect the main application
- **As a** user, **I want to** view generated UIs in a fixed-size container (390px × 844px), **so that** I can see how they appear on mobile devices
- **As a** user, **I want to** see the generated UI immediately after generation completes, **so that** I can review the result without delay
- **As a** user, **I want to** pan the viewport by dragging empty space, **so that** I can navigate around multiple screens
- **As a** user, **I want to** zoom the viewport using scroll (10% to 100%), **so that** I can see screens at different scales
- **As a** user, **I want to** click a screen to select it, **so that** I can interact with it and see its prompt panel
- **As a** user, **I want to** drag unselected screens to reposition them, **so that** I can organize my screens spatially
- **As a** user, **I want** panning to be disabled when dragging a screen, **so that** I can move screens without accidentally panning the viewport
- **As a** user, **I want** selected screens to remain non-draggable, **so that** I can interact with them without accidentally moving them
- **As a** user, **I want to** see a visual indicator (blue border) on selected screens, **so that** I know which screen is active
- **As a** user, **I want to** click outside screens to deselect them, **so that** I can pan and zoom without interference
- **As a** user, **I want to** see the prompt panel only when a screen is selected, **so that** the interface stays clean when no screen is active
- **As a** user, **I want to** see a descriptive title above each screen, **so that** I can quickly identify different screens at a glance
- **As a** user, **I want** my camera position and zoom level to be saved, **so that** I can continue from where I left off when I reload the page

### User Interface

- **As a** user, **I want to** click on empty space twice to create a new screen (first click deselects, second shows form), **so that** I can easily deselect screens without accidentally triggering the creation form
- **As a** user, **I want to** see a floating form appear at the click location when creating a new screen, **so that** I can enter the prompt for the new screen
- **As a** user, **I want to** have my input preserved if I cancel the new screen form, **so that** I don't lose my work if I click outside accidentally
- **As a** user, **I want** the new screen form to close when I select a screen, **so that** the form doesn't stay visible when I'm working with existing screens
- **As a** user, **I want to** create new screens that are positioned at the form location, **so that** I can organize screens spatially
- **As a** user, **I want to** see a prompt history panel appear when I select a screen, **so that** I can see my conversation history
- **As a** user, **I want to** see all my previous prompts displayed as read-only text in the history panel, **so that** I can reference my conversation history
- **As a** user, **I want to** click any prompt in the history panel, **so that** I can view the LLM output that was generated for that prompt
- **As a** user, **I want to** see which prompt is currently selected with visual highlighting, **so that** I know which output I'm viewing
- **As a** user, **I want to** browse through output history by clicking different prompts, **so that** I can compare different versions of the generated UI
- **As a** user, **I want to** delete conversation points from history, **so that** I can clean up unwanted entries
- **As a** user, **I want to** see a delete icon appear when hovering over the last history entry, **so that** I can easily remove it
- **As a** user, **I want to** confirm before deleting a history entry, **so that** I don't accidentally lose my work
- **As a** user, **I want** the previous entry to be selected automatically when I delete the currently selected entry, **so that** I can continue viewing history seamlessly
- **As a** user, **I want** the entire screen to be removed when I delete the last remaining history entry, **so that** empty screens don't clutter my workspace
- **As a** user, **I want to** click a "Modify" button (ghost style that turns blue on hover) to enter modification mode, **so that** I can request changes to the current UI
- **As a** user, **I want to** see a modification input field with a label "What you would like to change" when I click Modify, **so that** I can clearly understand what to enter
- **As a** user, **I want** my modification prompts to appear in history immediately when I send them, **so that** I can see what I requested while the UI is being generated
- **As a** user, **I want to** have my screens automatically saved, **so that** I don't lose my work when I refresh the page

### Error Handling

- **As a** user, **I want to** receive clear error messages if UI generation fails, **so that** I understand what went wrong
- **As a** user, **I want to** be prevented from sending empty prompts, **so that** I don't waste API calls
- **As a** user, **I want to** see disabled states on buttons during loading, **so that** I don't accidentally trigger duplicate requests

### Technical Requirements

- **As a** developer, **I want** generated HTML to be automatically cleaned of markdown code blocks, **so that** the HTML renders correctly in the iframe
- **As a** developer, **I want** the system to maintain full conversation history (user prompts and assistant responses), **so that** modifications can be made with complete context
- **As a** developer, **I want** the API to accept conversation history and format it properly for the LLM, **so that** follow-up modifications understand the full context
- **As a** developer, **I want** the API to validate required environment variables, **so that** configuration errors are caught early
- **As a** developer, **I want** all screens, conversation data, and camera position/zoom to be persisted in IndexedDB, **so that** users don't lose their work
- **As a** user, **I want** generated UIs to use Font Awesome icons via CDN, **so that** icons render correctly without additional setup
- **As a** user, **I want** generated UIs to use Unsplash images, **so that** mockups include realistic placeholder images

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **React**: 19.2.0
- **TypeScript**: 5.x
- **Styling**: Tailwind CSS 4
- **AI Integration**:
  - Vercel AI SDK (`ai` package)
  - Google Gemini (`@ai-sdk/google`)
- **Storage**:
  - IndexedDB (`idb` package) - Client-side persistence
- **Icons**:
  - React Icons (FontAwesome) - Used in the application UI
  - Font Awesome 6.5.1 CDN - Used in generated UI mockups

## Project Structure

```
ui-gen/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── create/
│   │   │       └── route.ts          # API endpoint for UI generation
│   │   ├── layout.tsx                # Root layout
│   │   ├── page.tsx                  # Home page (viewport management)
│   │   └── globals.css               # Global styles
│   ├── components/
│   │   ├── Screen.tsx                 # Individual screen component with iframe
│   │   ├── PromptPanel.tsx            # History panel and modification interface
│   │   └── Contents.tsx              # Legacy component (example UI)
│   ├── lib/
│   │   ├── types.ts                  # TypeScript type definitions
│   │   ├── storage.ts                # Storage abstraction (IndexedDB)
│   │   └── utils.ts                  # Utility functions
│   └── prompts/
│       └── generate-ui.ts            # System prompt constant for AI generation
├── docs/
│   └── MEMORY.md                     # Development notes and decisions
└── package.json
```

## Setup

### Prerequisites

- Node.js 20+
- npm, yarn, or pnpm
- Google Gemini API key

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd ui-gen
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Create a `.env.local` file in the root directory:

```env
GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key_here
```

Get your API key from [Google AI Studio](https://makersuite.google.com/app/apikey)

4. Run the development server:

```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

### Initial Generation

1. When the viewport is empty, click anywhere on the empty space
2. A floating form will appear at the click location
3. Enter a description of the UI you want to generate
4. Press `Ctrl+Enter` (or `Cmd+Enter` on Mac) or click the "Create" button with the magic icon
5. Wait for the AI to generate the UI (a loading spinner will appear over the screen)
6. The generated UI will be displayed in a 390px × 844px screen container
7. The screen will be created at the location where you clicked

### Creating New Screens

1. **Deselect First**: If a screen is selected, click on empty space once to deselect it
2. **Click Again to Create**: Click on empty space again (when no screen is selected) to show the new screen form
3. **Enter Prompt**: A floating form will appear at the click location with a "What you want to create" input field
4. **Create Screen**: Enter your prompt and click the "Create" button - a new screen will be created at that location and start generating immediately
5. **Cancel**: Click outside the form or select any screen to cancel (your input will be preserved for the next attempt)
6. **Positioning**: Each new screen is positioned absolutely at the location where you clicked, allowing you to organize screens spatially

### Navigating Multiple Screens

1. **Panning**: Press and drag on empty space to pan around the viewport
2. **Zooming**: Use your mouse wheel to zoom in/out (10% to 100% scale)
3. **Selecting Screens**: Click any screen to select it and view its prompt panel (this will also close the new screen form if it's open)
4. **Dragging Screens**: Click and drag unselected screens to reposition them; panning is automatically disabled during screen drag
5. **Visual Feedback**: Selected screens display a 2px blue border and appear on top; unselected screens show a grab cursor
6. **Deselecting**: Click on empty space to deselect the current screen
7. **Prompt Panel**: The prompt history panel only appears when a screen is selected
8. **Z-Index**: Newer screens appear above older ones; selected screens always appear on top
9. **Camera Persistence**: Your camera position and zoom level are automatically saved and restored when you reload the page

### Viewing Output History

1. After generating multiple UIs, select a screen to see its prompt history panel on the right
2. Click any prompt in the history panel to view its corresponding LLM output
3. The selected prompt will be highlighted with a blue border and background
4. The Screen panel will display the UI that was generated for the selected prompt
5. You can click different prompts to browse through your output history and compare different versions

### Deleting History Entries

1. Select a screen to see its prompt history panel
2. Hover over the last entry in the history to reveal a gray delete icon on the right
3. Hover over the delete icon to see the entry highlight in red
4. Click the delete icon to open a confirmation dialog
5. Confirm deletion to remove the entry from history
6. If you delete the currently selected entry, the previous entry will be automatically selected
7. If you delete the last remaining entry, the entire screen will be removed
8. All changes are saved immediately to persistent storage

### Making Modifications

1. Select a screen to see its prompt history panel on the right
2. Click the "Modify" button (ghost style, turns blue on hover) at the bottom of the history
3. Enter your modification request in the "What you would like to change" field
4. Press `Ctrl+Enter` (or `Cmd+Enter` on Mac) or click the "Create" button
5. The new modification prompt will be added to the history immediately (before generation completes)
6. A loading spinner will appear while the UI is being regenerated
7. Once generation completes, the prompt will be updated with the generated HTML
8. The newly created prompt will be automatically selected, showing its output
9. You can continue making modifications iteratively - each modification builds on the full conversation history
10. Each screen maintains its own independent conversation history

### Example Prompts

- "A recipe card with an image, title, ingredients list, and cooking instructions"
- "A social media post with profile picture, username, post content, and like/share buttons"
- "A weather app showing current temperature, forecast, and location"
- "A todo list with add button, task items, and checkboxes"

## Architecture Decisions

### Why Iframe?

Generated HTML is rendered in an iframe for:

- **Security**: Isolates generated content from the main application
- **Styling Isolation**: Prevents generated styles from affecting the main app
- **Clean Rendering**: Ensures the generated UI renders in a controlled 390px × 844px container

### Why Tailwind CDN?

- **No Build Step**: Generated HTML doesn't need compilation
- **Dynamic Content**: Works with dynamically generated HTML
- **Easy Integration**: Simple script tag injection

### Why Font Awesome CDN?

- **Consistent Icons**: All generated UIs use the same icon library for visual consistency
- **No Custom SVG**: Prevents AI from generating custom SVG icons, ensuring reliable rendering
- **Easy Integration**: Simple CSS link tag injection in the iframe template
- **Professional Look**: Font Awesome provides a comprehensive set of well-designed icons

### API Design

The `/api/create` endpoint:

- Accepts a conversation history array (user prompts and assistant responses)
- Uses `GENERATE_UI_PROMPT` constant from `src/prompts/generate-ui.ts` as the system prompt
- Formats the full conversation history for the LLM, including:
  - Original user prompts
  - Previous LLM-generated HTML outputs
  - New modification requests
- Uses Google Gemini 2.5 Flash model (fast and cost-effective)
- Cleans up markdown code blocks from AI responses
- Returns clean HTML ready for iframe rendering
- Generated HTML includes title metadata as a comment (`<!-- Title: ... -->`) at the beginning

### Component Structure

- **page.tsx**: Main viewport component managing multiple screens, pan/zoom, selection, and dragging
  - Manages viewport transform state (pan position and zoom scale)
  - Handles panning via mouse press and drag on empty space
  - Handles zooming via mouse wheel (10% to 100%) with non-passive event listener
  - Manages multiple screen instances and their data with absolute positioning
  - Tracks selected screen ID
  - Handles screen dragging: unselected screens can be dragged to reposition them
  - Disables panning when dragging a screen to prevent interference
  - Deselects screens when clicking outside or starting to drag another screen
  - Provides new screen creation flow: first click on empty space deselects current screen, second click (when no screen selected) shows form
  - Preserves form input when canceling the new screen flow
  - Auto-loads screens and viewport transform from IndexedDB on mount
  - Auto-saves screens and viewport transform to IndexedDB whenever they change (screens debounced by 300ms, viewport transform debounced by 500ms)
  - Uses functional state updates in `handleScreenUpdate` to prevent race conditions when multiple screens update simultaneously
  - Always preserves screen positions during updates unless explicitly changed
  - Z-index management: newer screens appear above older ones, selected screens always on top
- **Screen.tsx**: Individual screen component managing state, conversation history, and API calls
  - Manages conversation points state (prompt, HTML, title, timestamp for each point)
  - Tracks selected prompt index for output history viewing
  - Renders generated UI in iframe based on selected conversation point
  - Extracts and displays screen title from HTML metadata (`<!-- Title: ... -->`) above the screen
  - Automatically starts generation when created with initial conversation point (for new screens from form)
  - Replaces incomplete conversation points instead of duplicating them (prevents duplicate prompts in history)
  - Adds modification prompts to history immediately (before API response) for better UX
  - Replaces incomplete points with completed ones when generation finishes
  - Removes incomplete points if generation fails
  - Uses ref with screen ID + timestamp key to prevent duplicate API calls
  - Reuses existing incomplete conversation points when auto-generation triggers to prevent duplicates
  - Preserves original timestamps when completing conversation points
  - Shows PromptPanel only when screen is selected
  - Handles screen click events for selection
  - Displays "No content" message when screen has no HTML
  - Handles deletion of conversation points with automatic selection adjustment
  - Removes entire screen when last conversation point is deleted
  - Persists all changes immediately via onUpdate callback
- **PromptPanel.tsx**: History panel component displaying conversation and modification interface
  - Displays all conversation points (prompts) as clickable cards
  - Highlights the currently selected prompt with blue border and background
  - Allows clicking prompts to view their corresponding HTML outputs
  - Shows delete icon on hover for the last history entry
  - Delete icon appears gray by default, turns red on hover
  - Hovering delete icon highlights the entry with red border and background
  - Provides confirmation dialog before deleting entries
  - Provides "Modify" button to enter modification mode
  - Shows modification input field with "Create" button when in edit mode
  - Handles canceling edit mode when input field loses focus and is empty
  - Only visible when parent screen is selected
  - All entries maintain consistent width (space reserved for delete icon)

- Separation of concerns: UI generation logic in API route, rendering in components, viewport management in page component, persistence in storage abstraction

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run TypeScript and ESLint checks
- `npm run lint:prettier` - Check code formatting
- `npm run lint:knip` - Check for unused code
- `npm run lint:jscpd` - Check for code duplication
- `npm run lint:full` - Run all linting checks

### Code Style

- TypeScript strict mode enabled
- ESLint with Next.js config
- Prettier for code formatting
- Tailwind CSS for styling

## Configuration

### Environment Variables

- `GOOGLE_GENERATIVE_AI_API_KEY`: Required. Your Google Gemini API key

### AI Model Configuration

The API endpoint uses:

- Model: `gemini-2.5-flash`
- Temperature: `0.5` (balanced creativity/consistency)

These can be adjusted in `src/app/api/create/route.ts`

## Limitations

- Generated UIs are **non-interactive** (no JavaScript, no event handlers)
- Tailwind CDN is used (not recommended for production, but suitable for mockups)
- Generated HTML is sanitized but should be reviewed for production use
- Screen size is fixed at 390px × 844px (mobile only)
- Zoom is limited to 10% to 100% scale
- Unselected screens can be dragged to reposition them
- Panning is automatically disabled when dragging a screen
- Selected screens are non-draggable to allow interaction with their content
- Camera position and zoom are persisted and restored on page reload
- New screen form appears on mouse release (not mouse down) to prevent accidental triggers while dragging

## Future Improvements

- [ ] Support for multiple screen sizes
- [ ] Export generated UI as image or HTML file
- [x] Save/load generated UIs (IndexedDB persistence)
- [x] View previous UI versions from history (clickable prompts)
- [x] Multiple conversation branches/screens
- [x] Pan and zoom viewport
- [x] Selectable screens with visual feedback
- [x] New screen creation flow with positioned screens
- [x] Draggable screens for repositioning
- [x] Camera position and zoom persistence
- [ ] Custom Tailwind configuration
- [ ] Better error handling and user feedback
- [ ] Streaming responses for faster perceived performance
- [ ] Keyboard shortcuts for navigation
- [ ] Screen arrangement/organization tools

## Rules

- do not launch dev server yourself, ask user to do that instead
- run `yarn lint` to check if the project builds
- write notes to yourself in `docs/MEMORY.md`
- run `yarn format` after you're done with the code
