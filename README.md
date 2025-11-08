# UI Generator

An AI-powered UI mockup generator that creates beautiful, non-interactive HTML interfaces using Google Gemini and Tailwind CSS. Users can describe their desired UI in natural language, and the application generates a mobile-optimized (390px × 844px) HTML mockup rendered in an iframe.

## Features

- 🤖 **AI-Powered Generation**: Uses Google Gemini (via Vercel AI SDK) to generate UI mockups from natural language prompts
- 📱 **Mobile-First Design**: Generates UIs optimized for mobile screens (iPhone 13/14 standard: 390px × 844px)
- 🎨 **Tailwind CSS**: All generated UIs use Tailwind CSS for styling via CDN
- 🖼️ **Iframe Rendering**: Generated HTML is safely rendered in an isolated iframe
- ⚡ **Real-time Generation**: Fast UI generation with loading states and error handling
- 🎯 **Clean Output**: Automatically strips markdown code blocks from AI responses

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **React**: 19.2.0
- **TypeScript**: 5.x
- **Styling**: Tailwind CSS 4
- **AI Integration**: 
  - Vercel AI SDK (`ai` package)
  - Google Gemini (`@ai-sdk/google`)
- **Icons**: React Icons (FontAwesome)

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
│   └── lib/
│       └── utils.ts                  # Utility functions
├── docs/
│   ├── GENERATE_UI.md                # System prompt for AI generation
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

1. Enter a description of the UI you want to generate in the prompt panel (positioned to the right of the screen)
2. Press `Ctrl+Enter` (or `Cmd+Enter` on Mac) or click the send button
3. Wait for the AI to generate the UI (a loading spinner will appear over the screen)
4. The generated UI will be displayed in the 390px × 844px screen container

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

### API Design

The `/api/create` endpoint:
- Reads `docs/GENERATE_UI.md` as the system prompt
- Uses Google Gemini 2.5 Flash model (fast and cost-effective)
- Cleans up markdown code blocks from AI responses
- Returns clean HTML ready for iframe rendering

### Component Structure

- **Screen.tsx**: Main container component managing state and API calls
- **PromptPanel.tsx**: Reusable input component for user prompts
- Separation of concerns: UI generation logic in API route, rendering in components

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

## Future Improvements

- [ ] Support for multiple screen sizes
- [ ] Export generated UI as image or HTML file
- [ ] Save/load generated UIs
- [ ] History of generated UIs
- [ ] Custom Tailwind configuration
- [ ] Better error handling and user feedback
- [ ] Streaming responses for faster perceived performance

## License

[Add your license here]

## Contributing

[Add contribution guidelines here]
