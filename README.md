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
- 📊 **Output History**: Browse through all generated UI outputs by selecting different prompts from the history
- 🎯 **Multiple Screens**: Create and manage multiple UI screens simultaneously
- ➕ **New Screen Creation**: Click anywhere on empty space to create a new screen at that location
- 📍 **Positioned Screens**: Each screen is positioned absolutely at its creation location
- 🔍 **Pan & Zoom Viewport**: Press and drag to pan and scroll to zoom (10% to 100%) the viewport
- 🖱️ **Selectable Screens**: Click any screen to select it, center it, and zoom to 100%
- 🎨 **Visual Selection**: Selected screens display a 2px blue border
- 👆 **Click Outside to Deselect**: Click on empty space to deselect the current screen
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
- **As a** user, **I want to** have selected screens automatically centered and zoomed to 100%, **so that** I can focus on the selected screen
- **As a** user, **I want to** see a visual indicator (blue border) on selected screens, **so that** I know which screen is active
- **As a** user, **I want to** click outside screens to deselect them, **so that** I can pan and zoom without interference
- **As a** user, **I want to** see the prompt panel only when a screen is selected, **so that** the interface stays clean when no screen is active
- **As a** user, **I want to** see a descriptive title above each screen, **so that** I can quickly identify different screens at a glance

### User Interface

- **As a** user, **I want to** enter my initial prompt in a centered textarea within the screen container, **so that** I can start generating UIs from a clean slate
- **As a** user, **I want to** see a "Create" button with a magic icon below the prompt input, **so that** I can easily trigger UI generation
- **As a** user, **I want to** click anywhere on empty space to create a new screen, **so that** I can quickly add new screens at specific locations
- **As a** user, **I want to** see a floating form appear at the click location when creating a new screen, **so that** I can enter the prompt for the new screen
- **As a** user, **I want to** have my input preserved if I cancel the new screen form, **so that** I don't lose my work if I click outside accidentally
- **As a** user, **I want to** create new screens that are positioned at the form location, **so that** I can organize screens spatially
- **As a** user, **I want to** see a prompt history panel appear immediately when I send my first prompt, **so that** I can see my conversation history right away
- **As a** user, **I want to** see all my previous prompts displayed as read-only text in the history panel, **so that** I can reference my conversation history
- **As a** user, **I want to** click any prompt in the history panel, **so that** I can view the LLM output that was generated for that prompt
- **As a** user, **I want to** see which prompt is currently selected with visual highlighting, **so that** I know which output I'm viewing
- **As a** user, **I want to** browse through output history by clicking different prompts, **so that** I can compare different versions of the generated UI
- **As a** user, **I want to** click a "Modify" button (ghost style that turns blue on hover) to enter modification mode, **so that** I can request changes to the current UI
- **As a** user, **I want to** see a modification input field with a label "What you would like to change" when I click Modify, **so that** I can clearly understand what to enter

### Error Handling

- **As a** user, **I want to** receive clear error messages if UI generation fails, **so that** I understand what went wrong
- **As a** user, **I want to** be prevented from sending empty prompts, **so that** I don't waste API calls
- **As a** user, **I want to** see disabled states on buttons during loading, **so that** I don't accidentally trigger duplicate requests

### Technical Requirements

- **As a** developer, **I want** generated HTML to be automatically cleaned of markdown code blocks, **so that** the HTML renders correctly in the iframe
- **As a** developer, **I want** the system to maintain full conversation history (user prompts and assistant responses), **so that** modifications can be made with complete context
- **As a** developer, **I want** the API to accept conversation history and format it properly for the LLM, **so that** follow-up modifications understand the full context
- **As a** developer, **I want** the API to validate required environment variables, **so that** configuration errors are caught early
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
│   │   ├── page.tsx                  # Home page
│   │   └── globals.css               # Global styles
│   ├── components/
│   │   ├── Screen.tsx                # Main screen component with iframe
│   │   ├── PromptPanel.tsx           # Input panel for user prompts
│   │   └── Contents.tsx              # Legacy component (example UI)
│   ├── prompts/
│   │   └── generate-ui.ts            # System prompt constant for AI generation
│   └── lib/
│       └── utils.ts                  # Utility functions
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

1. When the viewport is empty, you'll see a centered prompt input field
2. Enter a description of the UI you want to generate
3. Press `Ctrl+Enter` (or `Cmd+Enter` on Mac) or click the "Create" button with the magic icon
4. The prompt will immediately appear in the history panel on the right (when the screen is selected)
5. Wait for the AI to generate the UI (a loading spinner will appear over the screen)
6. The generated UI will be displayed in a 390px × 844px screen container
7. The new screen will be automatically selected, centered, and zoomed to 100%

### Creating New Screens

1. **Click on Empty Space**: Click anywhere on empty space (not on an existing screen) to initiate the new screen flow
2. **Enter Prompt**: A floating form will appear at the click location with a "What you want to create" input field
3. **Create Screen**: Enter your prompt and click the "Create" button - a new screen will be created at that location and start generating immediately
4. **Cancel**: Click outside the form to cancel (your input will be preserved for the next attempt)
5. **Positioning**: Each new screen is positioned absolutely at the location where you clicked, allowing you to organize screens spatially

### Navigating Multiple Screens

1. **Panning**: Press and drag on empty space to pan around the viewport
2. **Zooming**: Use your mouse wheel to zoom in/out (10% to 100% scale)
3. **Selecting Screens**: Click any screen to select it - it will be centered and zoomed to 100%
4. **Visual Feedback**: Selected screens display a 2px blue border
5. **Deselecting**: Click on empty space to deselect the current screen
6. **Prompt Panel**: The prompt history panel only appears when a screen is selected

### Viewing Output History

1. After generating multiple UIs, select a screen to see its prompt history panel on the right
2. Click any prompt in the history panel to view its corresponding LLM output
3. The selected prompt will be highlighted with a blue border and background
4. The Screen panel will display the UI that was generated for the selected prompt
5. You can click different prompts to browse through your output history and compare different versions

### Making Modifications

1. Select a screen to see its prompt history panel on the right
2. Click the "Modify" button (ghost style, turns blue on hover) at the bottom of the history
3. Enter your modification request in the "What you would like to change" field
4. Press `Ctrl+Enter` (or `Cmd+Enter` on Mac) or click the "Create" button
5. The new modification prompt will be added to the history immediately
6. The UI will be regenerated with the full conversation context, updating the selected screen
7. The newly created prompt will be automatically selected, showing its output
8. You can continue making modifications iteratively - each modification builds on the full conversation history
9. Each screen maintains its own independent conversation history

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

- **page.tsx**: Main viewport component managing multiple screens, pan/zoom, and selection
  - Manages viewport transform state (pan position and zoom scale)
  - Handles panning via mouse press and drag on empty space
  - Handles zooming via mouse wheel (10% to 100%)
  - Manages multiple screen instances and their data with absolute positioning
  - Tracks selected screen ID
  - Centers and zooms selected screens to 100% (works correctly at all zoom levels)
  - Deselects screens when clicking outside
  - Provides new screen creation flow: clicking empty space shows a form, clicking Create creates a screen at that location
  - Preserves form input when canceling the new screen flow
- **Screen.tsx**: Individual screen component managing state, conversation history, and API calls
  - Handles initial prompt input (centered in screen when empty)
  - Manages conversation history state for the screen
  - Tracks selected prompt index for output history viewing
  - Renders generated UI in iframe based on selected prompt
  - Extracts and displays screen title from HTML metadata (`<!-- Title: ... -->`) above the screen
  - Automatically starts generation when created with initial history (for new screens from form)
  - Automatically selects newly created prompts after generation
  - Shows PromptPanel only when screen is selected
  - Handles screen click events for selection
  - Ignores mouse events when not selected (except for selection clicks)
- **PromptPanel.tsx**: History panel component displaying conversation and modification interface
  - Displays all user prompts as clickable cards
  - Highlights the currently selected prompt with blue border and background
  - Allows clicking prompts to view their corresponding LLM outputs
  - Provides "Modify" button to enter modification mode
  - Shows modification input field with "Create" button when in edit mode
  - Handles canceling edit mode when input field loses focus and is empty
  - Only visible when parent screen is selected

- Separation of concerns: UI generation logic in API route, rendering in components, viewport management in page component

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
- Unselected screens ignore mouse events (except for selection clicks) to allow panning
- New screen form appears on mouse release (not mouse down) to prevent accidental triggers while dragging

## Future Improvements

- [ ] Support for multiple screen sizes
- [ ] Export generated UI as image or HTML file
- [ ] Save/load generated UIs
- [x] View previous UI versions from history (clickable prompts)
- [x] Multiple conversation branches/screens
- [x] Pan and zoom viewport
- [x] Selectable screens with visual feedback
- [x] New screen creation flow with positioned screens
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
