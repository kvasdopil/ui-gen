export const GENERATE_UI_PROMPT = `# UI Generation Prompt

Generate a beautiful, non-interactive UI mockup using HTML and Tailwind CSS that solves the user's described problem.

**CRITICAL: Generate ONLY the page contents (div elements with Tailwind classes). Do NOT generate \`<!DOCTYPE html>\`, \`<html>\`, \`<head>\`, \`<body>\`, or any document structure tags. Only output the content that goes inside the body.**

## Requirements

### Technical Constraints

- **Framework**: HTML with Tailwind CSS only (via CDN)
- **No JavaScript**: The HTML must be purely presentational - no event handlers, no scripts, no interactive elements
- **No CSS Units**: Do NOT use \`vw\`, \`vh\`, \`rem\`, \`em\`, or any viewport-relative units. Use only \`px\` values or Tailwind's spacing utilities
- **Container Size**: The parent container is always exactly **390px × 844px** (iPhone 13/14 standard size)
- **Fullscreen**: The UI should fill the entire container (390px × 844px)

### Code Structure

- Use only standard HTML elements (\`div\`, \`img\`, \`p\`, \`h1\`, \`h2\`, \`h3\`, \`span\`, \`ul\`, \`li\`, \`a\`, \`button\`, etc.)
- **Layout Elements**: Use only \`div\` elements for layout containers - do NOT use semantic HTML tags like \`header\`, \`section\`, \`main\`, or \`footer\`
- **Interactive Elements**: Use semantic HTML for clickable elements:
  - **Navigation**: Clickable elements that initiate navigation should use \`<a>\` tags with \`href="#"\` (e.g., links to other pages, navigation items, menu items that navigate)
  - **Actions**: Clickable elements that initiate actions should use \`<button>\` tags (e.g., submit buttons, action buttons, toggle buttons, delete buttons, etc.)
  - Do NOT use \`div\` elements with \`cursor-pointer\` for interactive elements - use proper semantic HTML (\`<a>\` or \`<button>\`)
  - **aria-roledescription**: ALL \`<a>\` and \`<button>\` tags MUST include an \`aria-roledescription\` attribute with a human-readable, globally unique name that describes the element's role. Each \`aria-roledescription\` value must be unique across the entire page (e.g., \`aria-roledescription="home navigation link"\`, \`aria-roledescription="submit form button"\`, \`aria-roledescription="close dialog button"\`). Make each description specific and descriptive enough to be globally unique.
- Apply styling exclusively through Tailwind CSS classes
- No inline styles except for fixed dimensions when necessary
- **Root Element**: The root element must be a \`div\` with classes \`flex h-full w-full\`
- **Icons**: Use Font Awesome icons ONLY via CDN (use \`<i>\` tags with Font Awesome classes like \`fa fa-home\` or \`fas fa-home\`). NEVER generate custom SVG icons or embed SVG code directly. The Font Awesome CDN will be automatically included.
- **Images**: Use Unsplash for image mockups (use \`https://images.unsplash.com/\` URLs with appropriate dimensions)
- **Accessibility**: 
  - **aria-roledescription for interactive elements**: ALL \`<a>\` and \`<button>\` tags MUST include an \`aria-roledescription\` attribute with a human-readable, globally unique name. Each value must be unique across the entire page and should describe the element's specific role (e.g., \`aria-roledescription="home navigation link"\`, \`aria-roledescription="submit form button"\`, \`aria-roledescription="delete item button"\`). Make each description specific enough to be globally unique.
  - **aria-label**: Add \`aria-label\` attributes to key UI elements for screen reader support. **IMPORTANT**: aria-labels should describe the element's purpose and context, not just duplicate visible text. They should provide meaningful information that helps screen reader users understand what the element does or contains:
  - Lists: Add \`aria-label="list of [items]"\` to list containers (e.g., \`aria-label="list of users"\`, \`aria-label="list of recipes"\`) - describe what the list contains, not just "list"
  - Keyboards/Input areas: Add \`aria-label="main keyboard"\` or \`aria-label="search keyboard"\` to input containers - describe the keyboard's purpose
  - Navigation elements: Add descriptive labels like \`aria-label="main navigation"\` or \`aria-label="bottom navigation"\` - explain the navigation's role
  - Button groups: Add labels like \`aria-label="action buttons"\` or \`aria-label="filter options"\` - describe what the group of buttons does
  - Content sections: Add labels like \`aria-label="user profile"\`, \`aria-label="product details"\`, etc. - describe the section's purpose
  - Interactive elements without visible text: Always include \`aria-label\` for icon-only buttons or elements - describe what the button does (e.g., \`aria-label="Close dialog"\` not just \`aria-label="X"\`)
  - **Best Practice**: If an element already has visible, descriptive text, you may not need an aria-label. Only add aria-labels when they add meaningful context or when the element lacks descriptive visible text
- **ONLY PAGE CONTENTS**: Generate ONLY the page content elements (divs, images, text, etc.). Do NOT generate any document structure like \`<!DOCTYPE html>\`, \`<html>\`, \`<head>\`, \`<body>\`, \`<meta>\`, or \`<script>\` tags. The document structure will be added automatically.

### Design Best Practices

- **Visual Hierarchy**: Use appropriate typography scales, spacing, and contrast
- **Spacing**: Maintain consistent spacing using Tailwind's spacing scale (p-4, gap-4, mb-6, etc.)
- **Color**: Use a cohesive color palette with proper contrast ratios for readability
- **Typography**: Choose appropriate font sizes and weights for different content types
- **Layout**: Use Flexbox or Grid (via Tailwind utilities) for responsive layouts
- **Mobile-First**: Design specifically for mobile phone screens (390px width)
- **Safe Areas**: Consider safe areas and avoid content in status bar/notch regions
- **Visual Polish**: Include subtle shadows, rounded corners, and modern design elements where appropriate
- **Content Density**: Balance information density with whitespace for good readability

### Mobile-Specific Requirements

- **Touch Targets**: All touchable/interactive-looking elements must be large enough for mobile interaction - minimum 44px × 44px touch target size
- **Scrolling**: Use appropriate scrolling behavior for mobile devices - use \`overflow-y-auto\` or \`overflow-x-auto\` classes where content exceeds the viewport
- **Semantic HTML for Interactions**: Use \`<a href="#">\` for navigation elements and \`<button>\` for action elements - these provide proper semantic meaning and accessibility
- **Mobile Considerations**: Consider all mobile phone implications - one-handed use, thumb reach zones, gesture-friendly spacing, and mobile-optimized layouts

### Output Format

**CRITICAL INSTRUCTIONS:**

- **TITLE METADATA**: At the very beginning of your output, include a title comment in the format: \`<!-- Title: Your short descriptive title -->\`. The title should be short, concise, and descriptive (e.g., "Basic calculator app", "Recipe card", "Weather dashboard"). This title will be used for display purposes.
- Generate ONLY the page content elements - the div structure with Tailwind classes
- **DO NOT** include \`<!DOCTYPE html>\`, \`<html>\`, \`<head>\`, \`<body>\`, or any document structure tags
- **DO NOT** include \`<meta>\`, \`<title>\`, \`<script>\`, or any head/body wrapper tags
- **DO NOT** include the Tailwind CDN script tag (it will be added automatically)
- Start your output with the title comment, then the root \`div\` element: \`<!-- Title: Your title -->\n<div class="flex h-full w-full">\`
- Include all necessary Tailwind classes
- Ensure the HTML renders correctly within a 390px × 844px container
- Your output should be the raw content that will be inserted into a body tag - nothing more, nothing less

## Example Structure

\`\`\`html
<!-- Title: Basic calculator app -->
<div class="flex h-full w-full overflow-y-auto">
  <!-- Example navigation link with Font Awesome icon -->
  <a href="#" class="flex h-11 w-11 items-center justify-center" aria-label="Navigate to home" aria-roledescription="home navigation link">
    <i class="fas fa-home text-xl text-blue-500"></i>
  </a>

  <!-- Example with Unsplash image -->
  <img
    src="https://images.unsplash.com/photo-1234567890?w=390&h=844&fit=crop"
    alt="Description"
    class="h-full w-full object-cover"
  />

  <!-- Example action button - minimum 44px touch target -->
  <button
    class="flex h-11 items-center justify-center rounded-lg bg-blue-500 px-4 text-white"
    aria-label="Submit form"
    aria-roledescription="submit form button"
  >
    Submit
  </button>

  <!-- Example list with aria-label -->
  <div class="flex flex-col gap-2" aria-label="list of users">
    <div class="p-4 bg-gray-100 rounded">User 1</div>
    <div class="p-4 bg-gray-100 rounded">User 2</div>
  </div>

  <!-- Example keyboard/input area with aria-label -->
  <div class="flex flex-wrap gap-2 p-4" aria-label="main keyboard">
    <div class="w-12 h-12 cursor-pointer flex items-center justify-center border rounded">A</div>
    <div class="w-12 h-12 cursor-pointer flex items-center justify-center border rounded">B</div>
  </div>

  <!-- Your UI content here -->
</div>
\`\`\`

**CRITICAL**:

- Output ONLY the page content starting with the title comment followed by \`<div class="flex h-full w-full">\`
- Always include the title comment at the very beginning: \`<!-- Title: Your short descriptive title -->\`
- Do NOT include any document structure tags (\`<!DOCTYPE>\`, \`<html>\`, \`<head>\`, \`<body>\`)
- Do NOT include any meta tags, script tags, or document wrappers
- Use \`class\` instead of \`className\` (standard HTML attribute)
- The document structure and Tailwind CDN will be automatically added around your content

## Guidelines

- Focus on creating a visually appealing, professional UI mockup
- Solve the user's problem through thoughtful design and layout
- Make it look production-ready and polished
- Ensure all text is readable and properly sized for mobile
- Use Font Awesome icons ONLY for all icon needs - use \`<i>\` tags with Font Awesome classes (e.g., \`fas fa-home\`, \`far fa-user\`, \`fab fa-twitter\`). NEVER generate custom SVG icons or embed SVG code directly. The Font Awesome CDN will be automatically included.
- Use Unsplash images for image mockups - select relevant, high-quality images that fit the context
- **Semantic HTML for Interactive Elements**: 
  - Use \`<a href="#">\` for clickable elements that initiate navigation (links, menu items, navigation buttons)
  - Use \`<button>\` for clickable elements that initiate actions (submit, delete, toggle, etc.)
  - Do NOT use \`div\` elements with \`cursor-pointer\` for interactive elements - always use proper semantic HTML
  - **REQUIRED**: ALL \`<a>\` and \`<button>\` tags MUST include an \`aria-roledescription\` attribute with a human-readable, globally unique name. Each value must be unique across the entire page (e.g., \`aria-roledescription="home navigation link"\`, \`aria-roledescription="submit form button"\`, \`aria-roledescription="close dialog button"\`). Make each description specific and descriptive enough to be globally unique.
- **Accessibility Best Practices**: Always add \`aria-label\` attributes to key elements, but remember:
  - **Purpose over duplication**: aria-labels should describe the element's purpose and provide context, not just repeat visible text. For example, use \`aria-label="Close dialog"\` not \`aria-label="X"\`, or \`aria-label="list of users"\` not just \`aria-label="list"\`
  - **Meaningful context**: Describe what the element does or contains, helping screen reader users understand its role in the interface
  - **When to use**: Add aria-labels to lists, keyboard/input areas, navigation elements, button groups, content sections, and any interactive element without descriptive visible text
  - **When not needed**: If an element already has clear, descriptive visible text that explains its purpose, an aria-label may be redundant
- Consider the user's specific requirements and context
- Remember: Output HTML, not JSX - use \`class\` instead of \`className\`, and standard HTML attributes`;
