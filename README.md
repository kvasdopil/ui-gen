# UI Generator

An AI-powered UI mockup generator that creates beautiful, non-interactive HTML interfaces using Google Gemini and Tailwind CSS. Users can describe their desired UI in natural language, and the application generates a mobile-optimized (390px × 844px) HTML mockup rendered in an iframe.

## Features

- 🔐 **OAuth Authentication**: Google OAuth authentication via Auth.js (NextAuth) - sign in with your Google account
- 👤 **User Profile**: User avatar in top-right corner with profile menu showing name, email, and logout option
- 🔒 **Protected API**: UI generation endpoint requires authenticated users
- 🔄 **Auth Flow Preservation**: If you try to create or modify a screen without being authenticated, your prompt is automatically saved and restored after you sign in
- 🤖 **AI-Powered Generation**: Uses Google Gemini (via Vercel AI SDK) to generate UI mockups from natural language prompts
- 📱 **Mobile-First Design**: Generates UIs optimized for mobile screens (iPhone 13/14 standard: 390px × 844px)
- 🎨 **Tailwind CSS**: All generated UIs use Tailwind CSS for styling via CDN
- 🎯 **Font Awesome Icons**: Generated UIs use Font Awesome icons via CDN for consistent, professional iconography
- 🖼️ **Unsplash Image Integration**: AI can automatically search and include relevant images from Unsplash using the `findUnsplashImage` tool
- 🔄 **Multi-Step Conversations**: Supports up to 5 conversation steps, allowing the AI to make tool calls and follow-up responses
- ♿ **Accessibility**: Generated UIs include proper semantic HTML (`<a>` for navigation, `<button>` for actions) and aria-labels for screen reader support
- 🖼️ **Iframe Rendering**: Generated HTML is safely rendered in an isolated iframe
- ⚡ **Real-time Generation**: Fast UI generation with loading states and error handling
- 🧹 **Clean Output**: Automatically strips markdown code blocks from AI responses
- 🔄 **Follow-up Modifications**: Iteratively refine designs by modifying previous prompts with full conversation context
- 📜 **Conversation History**: View all previous prompts in a history panel with the ability to modify and regenerate
- 🖱️ **Clickable Prompts**: Click any prompt in the history to view its corresponding LLM output
- 🗑️ **Delete History Entries**: Delete conversation points from history; deleting the last entry removes the entire screen
- 📊 **Output History**: Browse through all generated UI outputs by selecting different prompts from the history
- 📋 **Clone Screens**: Clone a screen at any point in its conversation history, creating a new screen with full history up to that point (cloned screen is not auto-selected)
- 📤 **Export to Clipboard**: Export any conversation point's HTML to clipboard with prompt history comment prefix - includes all prompts up to that point formatted as a comment block
- 🎯 **Multiple Screens**: Create and manage multiple UI screens simultaneously
- ➕ **New Screen Creation**: Right-click on empty space to create a new screen at that location
- 📍 **Positioned Screens**: Each screen is positioned absolutely at its creation location
- 💾 **Persistent Storage**: All screens, conversations, generated content, and camera position/zoom are automatically saved to IndexedDB
- 🔍 **Pan & Zoom Viewport**: Press and drag to pan and scroll to zoom (10% to 100%) the viewport
- 🖱️ **Selectable Screens**: Click any screen to select it and see its prompt panel
- 🎨 **Visual Selection**: Screens have a transparent border by default, display a 2px solid blue border when selected, and show a 2px solid blue border on hover when not selected
- 👆 **Click Outside to Deselect**: Click on empty space to deselect the current screen
- 🖱️ **Draggable Screens**: Drag unselected screens to reposition them; panning is disabled during screen drag
- 📍 **Camera Persistence**: Camera position and zoom level are saved and restored when you reload the page
- 🚫 **Non-Interactive Screens**: Screen contents (iframe and overlays) are always non-interactive to prevent accidental clicks while navigating
- 🖱️ **Double-Click to Activate**: Double-click any screen to activate it, center the camera, and zoom to 100%
- 🏷️ **Screen Titles**: Each generated screen displays a descriptive title above it, extracted from HTML metadata
- 🎯 **Clickable Highlights**: Toggle visibility of interactive elements - highlights `<a>` links in magenta and `<button>` elements in cyan with a toggle button next to the screen title
- ➡️ **Arrow Connections**: Create visual connections between screens by clicking on clickable overlays (when "show clickables" is enabled) and dragging to another screen - arrows use Bezier curves that connect screen boundaries and scale with zoom
- 💾 **Persistent Arrows**: Arrows are stored with conversation entry metadata (along with HTML) - each arrow is identified by clickable index and contains target screen ID, automatically saved and restored
- 📏 **Dynamic Height Tracking**: Screen heights are tracked and used for accurate arrow boundary detection, supporting screens taller than the minimum 844px

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
- **As a** user, **I want to** view generated UIs with a fixed width (390px) and dynamic height (minimum 844px), **so that** I can see the full design without scrolling while maintaining mobile proportions
- **As a** user, **I want** screens to stretch horizontally to fill available space, **so that** I can see the whole design page without scrolling
- **As a** user, **I want** the iframe height to adjust automatically based on content, **so that** tall designs are fully visible
- **As a** user, **I want to** see the generated UI immediately after generation completes, **so that** I can review the result without delay
- **As a** user, **I want to** see an empty state message when no screens exist, **so that** I know how to get started (right-click to create)
- **As a** user, **I want to** pan the viewport by dragging empty space, **so that** I can navigate around multiple screens
- **As a** user, **I want to** zoom the viewport using scroll (10% to 100%), **so that** I can see screens at different scales
- **As a** user, **I want** zoom operations to be smooth without jitter, **so that** I can comfortably navigate at different zoom levels
- **As a** user, **I want to** click a screen to select it, **so that** I can interact with it and see its prompt panel
- **As a** user, **I want to** double-click a screen to activate it, center the camera, and zoom to 100%, **so that** I can quickly focus on a specific screen
- **As a** user, **I want** screen contents to be non-interactive, **so that** I don't accidentally trigger actions while navigating or panning
- **As a** user, **I want to** drag unselected screens to reposition them, **so that** I can organize my screens spatially
- **As a** user, **I want** panning to be disabled when dragging a screen, **so that** I can move screens without accidentally panning the viewport
- **As a** user, **I want** selected screens to remain non-draggable, **so that** I can interact with them without accidentally moving them
- **As a** user, **I want to** see a visual indicator (blue border) on selected screens and when hovering over unselected screens, **so that** I know which screen is active or being targeted
- **As a** user, **I want to** click outside screens to deselect them, **so that** I can pan and zoom without interference
- **As a** user, **I want to** see the prompt panel only when a screen is selected, **so that** the interface stays clean when no screen is active
- **As a** user, **I want to** see a descriptive title above each screen, **so that** I can quickly identify different screens at a glance
- **As a** user, **I want** my camera position and zoom level to be saved, **so that** I can continue from where I left off when I reload the page
- **As a** user, **I want to** toggle visibility of clickable elements (links and buttons) in generated designs, **so that** I can easily identify interactive elements
- **As a** user, **I want to** create visual connections between screens by clicking on clickable overlays and dragging to other screens, **so that** I can document relationships and user flows between different screens
- **As a** user, **I want** arrows to be automatically saved with my conversation history, **so that** my screen connections persist across page reloads
- **As a** user, **I want** arrows to be associated with specific conversation points, **so that** each version of a screen can have its own set of connections

### User Interface

- **As a** user, **I want to** right-click on empty space to create a new screen, **so that** I can create screens without interfering with left-click interactions (panning, selecting, etc.)
- **As a** user, **I want to** see a floating form appear at the click location when creating a new screen, **so that** I can enter the prompt for the new screen
- **As a** user, **I want to** have my input preserved if I cancel the new screen form or modify prompt, **so that** I don't lose my work if I click outside accidentally
- **As a** user, **I want** the new screen form to close when I select a screen, **so that** the form doesn't stay visible when I'm working with existing screens
- **As a** user, **I want to** create new screens that are positioned at the form location, **so that** I can organize screens spatially
- **As a** user, **I want to** see a prompt history panel appear when I select a screen, **so that** I can see my conversation history
- **As a** user, **I want to** see all my previous prompts displayed as read-only text in the history panel, **so that** I can reference my conversation history
- **As a** user, **I want to** click any prompt in the history panel, **so that** I can view the LLM output that was generated for that prompt
- **As a** user, **I want to** see which prompt is currently selected with visual highlighting, **so that** I know which output I'm viewing
- **As a** user, **I want to** browse through output history by clicking different prompts, **so that** I can compare different versions of the generated UI
- **As a** user, **I want to** delete conversation points from history, **so that** I can clean up unwanted entries
- **As a** user, **I want to** see a menu button appear when hovering over history entries, **so that** I can access actions for each entry
- **As a** user, **I want to** see a delete option in the menu for the last history entry, **so that** I can easily remove it
- **As a** user, **I want to** confirm before deleting a history entry, **so that** I don't accidentally lose my work
- **As a** user, **I want** the previous entry to be selected automatically when I delete the currently selected entry, **so that** I can continue viewing history seamlessly
- **As a** user, **I want** the entire screen to be removed when I delete the last remaining history entry, **so that** empty screens don't clutter my workspace
- **As a** user, **I want to** clone a screen at any point in its conversation history, **so that** I can branch off and explore different design directions from that state
- **As a** user, **I want** cloned screens to include the full conversation history up to the cloned point, **so that** I have complete context for further modifications
- **As a** user, **I want** cloned screens to be immediately ready to drag, **so that** I can quickly position them in my workspace
- **As a** user, **I want to** export any conversation point's HTML to clipboard with its prompt history, **so that** I can easily copy and use the generated code in other projects
- **As a** user, **I want** the exported HTML to include a comment block with all prompts used to generate it, **so that** I can track how the UI was created
- **As a** user, **I want to** see a notification when HTML is successfully copied to clipboard, **so that** I know the export completed
- **As a** user, **I want to** click a "Modify" button (ghost style that turns blue on hover) to enter modification mode, **so that** I can request changes to the current UI
- **As a** user, **I want to** see a modification input field with a label "What you would like to change" when I click Modify, **so that** I can clearly understand what to enter
- **As a** user, **I want** my modification prompts to appear in history immediately when I send them, **so that** I can see what I requested while the UI is being generated
- **As a** user, **I want to** have my screens automatically saved, **so that** I don't lose my work when I refresh the page

### Error Handling

- **As a** user, **I want to** receive clear error messages if UI generation fails, **so that** I understand what went wrong
- **As a** user, **I want to** be prevented from sending empty prompts, **so that** I don't waste API calls
- **As a** user, **I want to** see disabled states on buttons during loading, **so that** I don't accidentally trigger duplicate requests

### Authentication

- **As a** user, **I want to** sign in with my Google account, **so that** I can access the UI generation features
- **As a** user, **I want to** see my profile information (name, email) when authenticated, **so that** I know I'm signed in
- **As a** user, **I want to** be able to sign out, **so that** I can switch accounts or end my session
- **As a** user, **I want** my prompt to be automatically saved if I try to create/modify a screen without being authenticated, **so that** I don't lose my work
- **As a** user, **I want** the system to automatically restore my prompt and continue generation after I authenticate, **so that** I don't have to re-enter my request

### Technical Requirements

- **As a** developer, **I want** generated HTML to be automatically cleaned of markdown code blocks, **so that** the HTML renders correctly in the iframe
- **As a** developer, **I want** the system to maintain full conversation history (user prompts and assistant responses), **so that** modifications can be made with complete context
- **As a** developer, **I want** the API to accept conversation history and format it properly for the LLM, **so that** follow-up modifications understand the full context
- **As a** developer, **I want** the API to validate required environment variables, **so that** configuration errors are caught early
- **As a** developer, **I want** all screens, conversation data, and camera position/zoom to be persisted in IndexedDB, **so that** users don't lose their work
- **As a** user, **I want** generated UIs to use Font Awesome icons via CDN, **so that** icons render correctly without additional setup
- **As a** user, **I want** generated UIs to use Unsplash images, **so that** mockups include realistic placeholder images
- **As a** developer, **I want** the AI to have access to an Unsplash image search tool, **so that** it can automatically find and include relevant images in generated UIs
- **As a** developer, **I want** all tool calls to be logged, **so that** I can debug and monitor AI tool usage
- **As a** developer, **I want** the AI to support multi-step conversations with tool calls, **so that** it can perform complex operations like searching for images before generating the final UI
- **As a** user with accessibility needs, **I want** generated UIs to use semantic HTML (`<a>` for navigation, `<button>` for actions), **so that** screen readers can properly interpret the interface
- **As a** user with accessibility needs, **I want** key UI elements to have descriptive aria-labels, **so that** I can understand the purpose of each element through screen readers

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **React**: 19.2.0
- **TypeScript**: 5.x
- **Styling**: Tailwind CSS 4
- **Authentication**: Auth.js (NextAuth) v5 with Google OAuth provider
- **AI Integration**:
  - Vercel AI SDK (`ai` package)
  - Google Gemini (`@ai-sdk/google`)
- **Storage**:
  - IndexedDB (`idb` package) - Client-side persistence
- **Icons**:
  - React Icons (FontAwesome) - Used in the application UI
  - Font Awesome 6.5.1 CDN - Used in generated UI mockups
- **Notifications**:
  - Custom toast notification system for user feedback
- **Deployment**: Vercel

## Project Structure

```
ui-gen/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   └── [...nextauth]/
│   │   │   │       └── route.ts     # Auth.js API route handlers
│   │   │   └── create/
│   │   │       └── route.ts          # API endpoint for UI generation (protected)
│   │   ├── layout.tsx                # Root layout with SessionProvider
│   │   ├── page.tsx                  # Home page (viewport management)
│   │   └── globals.css               # Global styles
│   ├── components/
│   │   ├── Screen.tsx                 # Individual screen component with iframe
│   │   ├── PromptPanel.tsx            # History panel and modification interface
│   │   ├── UserAvatar.tsx             # User avatar and authentication UI
│   │   ├── Providers.tsx              # SessionProvider wrapper
│   │   └── Contents.tsx              # Legacy component (example UI)
│   ├── lib/
│   │   ├── types.ts                  # TypeScript type definitions
│   │   ├── storage.ts                # Storage abstraction (IndexedDB)
│   │   └── utils.ts                  # Utility functions
│   ├── prompts/
│   │   └── generate-ui.ts            # System prompt constant for AI generation
│   └── types/
│       └── next-auth.d.ts            # NextAuth type definitions
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
UNSPLASH_ACCESS_KEY=your_unsplash_access_key_here
AUTH_SECRET=your_auth_secret_here
AUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=your_google_oauth_client_id
GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret
```

Get your API keys from:

- Google Gemini: [Google AI Studio](https://makersuite.google.com/app/apikey)
- Unsplash: [Unsplash Developers](https://unsplash.com/developers) - Register as a developer and create a new application to get your Access Key

### OAuth Setup

1. **Create Google Cloud Project**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one

2. **Enable OAuth Consent Screen**:
   - Navigate to **APIs & Services** > **OAuth consent screen**
   - Choose **External** user type
   - Fill in app information (name, support email, etc.)
   - Add scopes: `email`, `profile`, `openid`
   - Add test users if in testing mode

3. **Create OAuth 2.0 Client**:
   - Go to **APIs & Services** > **Credentials**
   - Click **Create Credentials** > **OAuth client ID**
   - Choose **Web application**
   - Add authorized JavaScript origins:
     - `http://localhost:3000` (for development)
     - `https://your-production-domain.com` (for production)
   - Add authorized redirect URIs:
     - `http://localhost:3000/api/auth/callback/google` (for development)
     - `https://your-production-domain.com/api/auth/callback/google` (for production)
   - Copy the **Client ID** and **Client Secret**

4. **Generate AUTH_SECRET**:

   ```bash
   openssl rand -base64 32
   ```

5. **Set Environment Variables**:
   - Add `AUTH_SECRET` (from step 4)
   - Add `AUTH_URL` (`http://localhost:3000` for local, `https://your-domain.com` for production)
   - Add `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` (from step 3)

6. Run the development server:

```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

### Authentication

1. **Sign In**: Click the user avatar icon in the top-right corner
2. **Google OAuth**: You'll be redirected to Google sign-in
3. **Authorize**: Grant permissions to the application
4. **Profile Menu**: After signing in, click the avatar to see your profile menu with name, email, and logout option

**Note**: UI generation requires authentication. You must be signed in to create or modify screens.

**Auth Flow Preservation**: If you try to create or modify a screen without being authenticated, the system will:

1. Save your prompt automatically
2. Prompt you to sign in with Google
3. After authentication, automatically restore your prompt and continue the generation process
4. You won't lose your work - the screen will be created/modified seamlessly after you authenticate

### Initial Generation

1. When the viewport is empty, right-click anywhere on the empty space
2. A small popup will appear with "Create screen" title and a "Mobile app" button
3. Click the "Mobile app" button to open the prompt dialog
4. Enter a description of the UI you want to generate
5. Press `Ctrl+Enter` (or `Cmd+Enter` on Mac) or click the "Create" button with the magic icon
6. Wait for the AI to generate the UI (a loading spinner will appear over the screen)
7. The generated UI will be displayed in a 390px × 844px screen container
8. The screen will be created at the location where you right-clicked

### Creating New Screens

1. **Right-Click to Create**: Right-click on empty space to show the initial popup (left-click anywhere will dismiss the popup if it's open)
2. **Select Type**: A small popup will appear at the right-click location with "Create screen" title and a "Mobile app" button
3. **Enter Prompt**: Click the "Mobile app" button to open the "What you want to create" dialog, then enter your prompt
4. **Create Screen**: Click the "Create" button - a new screen will be created at that location and start generating immediately
5. **Cancel**: Left-click anywhere outside the popup/form or select any screen to cancel (your input will be preserved for the next attempt)
6. **Positioning**: Each new screen is positioned absolutely at the location where you right-clicked, allowing you to organize screens spatially

### Navigating Multiple Screens

1. **Panning**: Press and drag on empty space to pan around the viewport
2. **Zooming**: Use your mouse wheel to zoom in/out (10% to 100% scale) - smooth zoom without jitter
3. **Selecting Screens**: Click any screen to select it and view its prompt panel (this will also close the new screen form if it's open)
4. **Double-Click to Focus**: Double-click any screen to activate it, center the camera on it, and zoom to 100% - works for both selected and unselected screens
5. **Non-Interactive Content**: Screen contents (iframe and clickable overlays) are always non-interactive to prevent accidental clicks while navigating
6. **Dragging Screens**: Click and drag unselected screens to reposition them; panning is automatically disabled during screen drag
7. **Visual Feedback**: Selected screens display a 2px blue border and appear on top; unselected screens show a grab cursor
8. **Deselecting**: Click on empty space to deselect the current screen
9. **Prompt Panel**: The prompt history panel only appears when a screen is selected
10. **Z-Index**: Newer screens appear above older ones; selected screens always appear on top
11. **Camera Persistence**: Your camera position and zoom level are automatically saved and restored when you reload the page

### Viewing Output History

1. After generating multiple UIs, select a screen to see its prompt history panel on the right
2. Click any prompt in the history panel to view its corresponding LLM output
3. The selected prompt will be highlighted with a blue border and background
4. The Screen panel will display the UI that was generated for the selected prompt
5. You can click different prompts to browse through your output history and compare different versions

### Managing History Entries

1. Select a screen to see its prompt history panel
2. Hover over any entry in the history to reveal a menu button (three dots) on the right
3. Click the menu button to open a dropdown menu with available actions
4. **Export to Clipboard**: Click "Export to clipboard" on any entry to copy its HTML to your clipboard
   - The exported HTML includes a comment block at the top with all prompts used to generate that version
   - Prompt history is formatted as: `(prompt1)` separated by `--` between prompts
   - A toast notification will appear confirming the copy: "Screen {screen name} is copied to clipboard"
   - The HTML is ready to use in other projects
5. **Clone**: Click "Clone" on any entry to create a new screen with the full conversation history up to and including that point
   - The cloned screen will have a new unique ID
   - It will be positioned 50px offset from the original screen
   - The cloned screen will not be auto-selected (you can click it to select it)
   - The cloned point will be selected in the new screen
6. **Delete**: Click "Delete" on the last entry to remove it from history
   - A confirmation dialog will appear before deletion
   - If you delete the currently selected entry, the previous entry will be automatically selected
   - If you delete the last remaining entry, the entire screen will be removed
7. All changes are saved immediately to persistent storage

### Making Modifications

1. Select a screen to see its prompt history panel on the right
2. Click the "Modify" button (ghost style, turns blue on hover) at the bottom of the history
3. Enter your modification request in the "What you would like to change" field
4. **Text Preservation**: If you click outside or dismiss the modify form, your entered text will be preserved - click "Modify" again to continue editing
5. Press `Ctrl+Enter` (or `Cmd+Enter` on Mac) or click the "Create" button
6. The new modification prompt will be added to the history immediately (before generation completes)
7. A loading spinner will appear while the UI is being regenerated
8. Once generation completes, the prompt will be updated with the generated HTML
9. The newly created prompt will be automatically selected, showing its output
10. You can continue making modifications iteratively - each modification builds on the full conversation history
11. Each screen maintains its own independent conversation history

### Creating Arrow Connections

1. **Enable Clickable Highlights**: Click the hand icon next to a screen's title to show clickable overlays
2. **Start Arrow**: Click on any highlighted clickable overlay (link or button) to start creating an arrow
3. **Connect to Screen**: Drag from the overlay to another screen - the arrow will follow your cursor
4. **Complete Connection**: Release the mouse button over another screen to connect the arrow (the arrow tip will snap to the destination screen boundary)
5. **Cancel**: Release the mouse button outside of any screen to cancel arrow creation
6. **One Arrow Per Overlay**: Each clickable overlay can only have one outgoing arrow - creating a new arrow from the same overlay replaces the previous one
7. **Persistent Arrows**: Arrows are automatically saved with the conversation entry metadata (along with HTML) - each arrow is identified by its clickable index and contains the target screen ID
8. **Per-Conversation-Point**: Arrows are stored with each conversation point, so different versions of a screen can have different arrow connections
9. **Move with Screens**: Arrows remain visible after creation and move with screens when you drag them
10. **Scalable**: Arrows scale with zoom and maintain consistent curvature at all zoom levels
11. **Bezier Curves**: Arrows use smooth Bezier curves that connect screen boundaries perpendicularly
12. **Dynamic Height Support**: Arrow boundary detection automatically adapts to screens taller than 844px for accurate connections

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

### Accessibility Features

Generated UIs include accessibility best practices:

- **Semantic HTML**:
  - Navigation elements use `<a href="#">` tags
  - Action elements use `<button>` tags
  - Prevents use of non-semantic `<div>` elements for interactive content
- **ARIA Labels**:
  - Key UI elements include descriptive `aria-label` attributes
  - Labels describe element purpose and context, not just duplicate visible text
  - Examples: `aria-label="list of users"`, `aria-label="main keyboard"`, `aria-label="Close dialog"`
  - Applied to lists, navigation elements, button groups, content sections, and interactive elements without descriptive visible text
- **Screen Reader Support**: Proper semantic structure and labels enable screen readers to properly interpret and navigate the generated interfaces

### API Design

The `/api/create` endpoint:

- **Requires Authentication**: Returns 401 Unauthorized if user is not authenticated (client automatically handles this by saving prompt and triggering auth flow)
- Accepts a conversation history array (user prompts and assistant responses)
- Uses `GENERATE_UI_PROMPT` constant from `src/prompts/generate-ui.ts` as the system prompt
- Formats the full conversation history for the LLM, including:
  - Original user prompts
  - Previous LLM-generated HTML outputs
  - New modification requests
- Uses Google Gemini 2.5 Flash model (fast and cost-effective)
- Supports up to 5 conversation steps (`maxSteps: 5`) for multi-turn interactions and tool calls
- Provides `findUnsplashImage` tool that allows the AI to:
  - Search Unsplash for images matching a query string
  - Return medium-resolution image URLs (`urls.regular`) for use in generated HTML
  - Automatically log all tool calls with input parameters and results
- Validates required environment variables (GOOGLE_GENERATIVE_AI_API_KEY and UNSPLASH_ACCESS_KEY)
- Cleans up markdown code blocks from AI responses
- Returns clean HTML ready for iframe rendering
- Generated HTML includes title metadata as a comment (`<!-- Title: ... -->`) at the beginning

### Authentication

- **Auth.js Configuration**: `src/app/api/auth/[...nextauth]/route.ts`
  - Google OAuth provider configuration
  - JWT session strategy
  - Callbacks to include user ID, name, email, and image in session
- **UserAvatar Component**: `src/components/UserAvatar.tsx`
  - Fixed position in top-right corner (not affected by viewport transforms)
  - Shows default icon when not authenticated
  - Shows Google profile image when authenticated
  - Click handler: initiates sign-in if not authenticated, shows popup if authenticated
  - Popup displays user name, email, and logout button
  - Prevents event propagation to avoid interfering with viewport interactions
- **SessionProvider**: `src/components/Providers.tsx`
  - Wraps the app with Auth.js SessionProvider for client-side session access

### Component Structure

- **page.tsx**: Main viewport component managing multiple screens, pan/zoom, selection, and dragging
  - Manages viewport transform state (pan position and zoom scale)
  - Uses refs to prevent rerenders during zoom operations for smooth performance
  - Handles panning via mouse press and drag on empty space
  - Handles zooming via mouse wheel (10% to 100%) with non-passive event listener
  - Zoom handler uses refs instead of state dependencies to prevent event listener recreation and jitter
  - Manages multiple screen instances and their data with absolute positioning
  - Tracks selected screen ID
  - **Empty State**: Displays "Right-click to create your first screen" message when no screens exist, positioned at 0,0 in viewport coordinates (centered on first load)
  - Centers viewport on first load when no screens exist and no saved transform
  - Handles screen dragging: unselected screens can be dragged to reposition them
  - Disables panning when dragging a screen to prevent interference
  - Deselects screens when clicking outside or starting to drag another screen
  - Provides new screen creation flow: right-click on empty space shows popup, left-click anywhere dismisses popup
  - Preserves form input when canceling the new screen flow or modify prompt
  - Auto-loads screens and viewport transform from IndexedDB on mount
  - Auto-saves screens and viewport transform to IndexedDB whenever they change (screens debounced by 300ms, viewport transform debounced by 500ms)
  - Uses functional state updates in `handleScreenUpdate` to prevent race conditions when multiple screens update simultaneously
  - Always preserves screen positions during updates unless explicitly changed
  - Z-index management: newer screens appear above older ones, selected screens always on top
  - **Double-Click Handler**: Centers camera and zooms to 100% when double-clicking screens
  - **Arrow Management**: Creates and stores arrows in conversation point metadata
    - Stores arrows in `ConversationPoint.arrows` array with `overlayIndex` and `targetScreenId`
    - Renders arrows from all conversation points across all screens
    - Uses actual screen height from `ScreenData.height` for boundary calculations
    - Removes arrows when clicking on overlays to start new arrow creation
- **Screen.tsx**: Individual screen component managing state, conversation history, and API calls
  - Manages conversation points state (prompt, HTML, title, timestamp for each point)
  - Tracks selected prompt index for output history viewing
  - **Flexible Layout**: Screen container has flexible width (stretches horizontally) with min-height of 844px
  - **Dynamic Iframe Height**: Iframe width is fixed at 390px, height adjusts dynamically based on content (minimum 844px)
  - Uses `postMessage` API to communicate content height from iframe to parent
  - **Height Persistence**: Screen height is stored in `ScreenData.height` and used for accurate arrow boundary detection
  - Renders generated UI in iframe based on selected conversation point
  - Extracts and displays screen title from HTML metadata (`<!-- Title: ... -->`) above the screen
  - **Non-Interactive Content**: Iframe and overlay highlights are always non-interactive (`pointerEvents: "none"`) to prevent accidental clicks while navigating
  - **Double-Click Handler**: Double-clicking a screen activates it, centers the camera, and zooms to 100% - works for both selected and unselected screens
  - **Selection Prevention**: Prevents text/element selection on double-click using CSS `user-select: none` and event prevention
  - **Clickable Highlights**: Toggle button next to screen title to show/hide interactive element highlights
    - Highlights `<a>` elements with `href` attribute in magenta
    - Highlights `<button>` elements in cyan
    - Overlay layer positioned absolutely over iframe without modifying generated content
    - Uses `offsetLeft`/`offsetTop` to calculate positions relative to iframe document (not affected by CSS transforms)
    - State is not persisted (resets on page reload)
    - Highlights are non-interactive (cannot be clicked)
  - **Arrow Connections**: Create visual connections between screens by clicking on clickable overlays
    - Click any highlighted overlay to start an arrow from its center
    - Drag to another screen to create a connection
    - Arrows use Bezier curves that connect screen boundaries perpendicularly
    - Each overlay can only have one outgoing arrow (new arrows replace old ones)
    - **Persistent Storage**: Arrows are stored in `ConversationPoint.arrows` array along with HTML metadata
    - Each arrow contains: `overlayIndex` (clickable index) and `targetScreenId` (destination screen)
    - Arrows are automatically saved with conversation entries and restored on page reload
    - Arrows move with screens when you drag them
    - Arrows scale with zoom and maintain consistent curvature
    - **Dynamic Height**: Screen heights are tracked and used for accurate boundary detection (supports screens taller than 844px)
  - **HTML Wrapper**: Simplified implementation with CSS ensuring html, body, and root content element have min-height: 844px
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
  - **Arrow Connections**: Handles overlay clicks to start arrow creation
    - Passes overlay center coordinates and screen ID to parent component
    - Overlay click handlers calculate center position in viewport coordinates
- **ArrowLine.tsx**: Arrow component rendering Bezier curves between screens
  - Renders arrows in content coordinates as part of the scalable viewport
  - Calculates line-rectangle intersections to find connection points on screen boundaries
  - Uses actual screen height from `ScreenData.height` for accurate boundary detection (not fixed 844px)
  - Creates Bezier curves that are perpendicular to screen edges at intersection points
  - Arrows scale with zoom and maintain consistent curvature
  - Arrow tip positioned at destination screen boundary
  - Uses SVG with viewBox for proper scaling
- **PromptPanel.tsx**: History panel component displaying conversation and modification interface
  - Displays all conversation points (prompts) as clickable cards
  - Highlights the currently selected prompt with blue border and background
  - Allows clicking prompts to view their corresponding HTML outputs
  - Shows menu button (three dots) on hover for each entry
  - Dropdown menu provides actions: Export to clipboard (all entries), Clone (all entries), and Delete (last entry only)
  - Export to clipboard formats HTML with prompt history comment prefix showing all prompts up to that point
  - Shows toast notification after successful clipboard copy
  - Delete option uses destructive styling (red) in the menu
  - Provides confirmation dialog before deleting entries
  - Provides "Modify" button to enter modification mode
  - Shows modification input field with "Create" button when in edit mode
  - Preserves entered text when dismissing the modify form (text remains when clicking "Modify" again)
  - Handles canceling edit mode when input field loses focus and is empty
  - Only visible when parent screen is selected
  - All entries maintain consistent width (space reserved for menu button)
  - All dropdown menu items have cursor pointer styling

- Separation of concerns: UI generation logic in API route, rendering in components, viewport management in page component, persistence in storage abstraction

## Development

### Development Workflow

1. **Start Development Server**:

   ```bash
   yarn dev
   ```

2. **Run Linting**:

   ```bash
   yarn lint
   ```

3. **Format Code**:

   ```bash
   yarn format
   ```

4. **Run All Linting Checks**:
   ```bash
   yarn lint:full
   ```

### Code Style Guidelines

- TypeScript strict mode enabled
- ESLint with Next.js config
- Prettier for code formatting
- Tailwind CSS for styling

### Important Notes

- Always run `yarn format` after making code changes
- Run `yarn lint` to check if the project builds
- Never commit to git unless explicitly asked by the user
- Do not launch dev server yourself - ask user to do that instead

## Deployment

### Deploying to Vercel

1. **Install Vercel CLI**:

   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**:

   ```bash
   vercel login
   ```

3. **Deploy**:

   ```bash
   vercel --prod
   ```

4. **Set Environment Variables**:
   - Go to Vercel project settings > Environment Variables
   - Add all required environment variables (see Environment Variables section)
   - **Important**: Set `AUTH_URL` to your production domain (e.g., `https://ui.guskov.dev`)
   - **Important**: Ensure `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` don't have trailing newlines (use `echo -n` when adding via CLI)

5. **Configure Custom Domain**:
   - Add your domain in Vercel project settings
   - Configure DNS A record pointing to Vercel's IP (usually `76.76.21.21`)
   - Vercel will automatically provision SSL certificate

6. **Update OAuth Redirect URIs**:
   - Add your production domain to Google Cloud Console OAuth client:
     - Authorized JavaScript origins: `https://your-domain.com`
     - Authorized redirect URIs: `https://your-domain.com/api/auth/callback/google`

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run TypeScript and ESLint checks
- `npm run format` - Format code with Prettier
- `npm run lint:prettier` - Check code formatting
- `npm run lint:knip` - Check for unused code
- `npm run lint:jscpd` - Check for code duplication
- `npm run lint:full` - Run all linting checks

## Configuration

### Environment Variables

#### Required for Local Development

- `GOOGLE_GENERATIVE_AI_API_KEY`: Your Google Gemini API key
- `UNSPLASH_ACCESS_KEY`: Your Unsplash API Access Key (get it from [Unsplash Developers](https://unsplash.com/developers))
- `AUTH_SECRET`: Secret key for session encryption (generate with `openssl rand -base64 32`)
- `AUTH_URL`: Base URL for authentication (`http://localhost:3000` for local development)
- `GOOGLE_CLIENT_ID`: Google OAuth 2.0 Client ID
- `GOOGLE_CLIENT_SECRET`: Google OAuth 2.0 Client Secret

#### Production (Vercel)

Set these in Vercel project settings:

- All the above variables with `AUTH_URL` set to your production domain (e.g., `https://ui.guskov.dev`)

### AI Model Configuration

The API endpoint uses:

- Model: `gemini-2.5-flash`
- Temperature: `0.5` (balanced creativity/consistency)

These can be adjusted in `src/app/api/create/route.ts`

## Limitations

- **Authentication Required**: UI generation requires Google OAuth authentication
- Generated UIs are **non-interactive** (no JavaScript, no event handlers)
- Screen contents (iframe and overlays) are **always non-interactive** to prevent accidental clicks while navigating
- Tailwind CDN is used (not recommended for production, but suitable for mockups)
- Generated HTML is sanitized but should be reviewed for production use
- Screen size is fixed at 390px × 844px (mobile only)
- Zoom is limited to 10% to 100% scale with smooth performance (no jitter)
- Unselected screens can be dragged to reposition them
- Panning is automatically disabled when dragging a screen
- Selected screens are non-draggable to allow interaction with their content
- Camera position and zoom are persisted and restored on page reload
- New screen form appears on mouse release (not mouse down) to prevent accidental triggers while dragging
- Double-click any screen to activate it, center the camera, and zoom to 100%

## Future Improvements

- [ ] Support for multiple screen sizes
- [x] Export generated UI to clipboard with prompt history
- [x] Save/load generated UIs (IndexedDB persistence)
- [x] View previous UI versions from history (clickable prompts)
- [x] Multiple conversation branches/screens
- [x] Pan and zoom viewport
- [x] Selectable screens with visual feedback
- [x] New screen creation flow with positioned screens
- [x] Draggable screens for repositioning
- [x] Camera position and zoom persistence
- [x] Arrow connections between screens with Bezier curves
- [ ] Custom Tailwind configuration
- [ ] Better error handling and user feedback
- [ ] Streaming responses for faster perceived performance
- [ ] Keyboard shortcuts for navigation
- [ ] Screen arrangement/organization tools
