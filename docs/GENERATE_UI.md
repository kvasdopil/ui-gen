# UI Generation Prompt

Generate a beautiful, non-interactive UI mockup using HTML and Tailwind CSS that solves the user's described problem.

**CRITICAL: Generate ONLY the page contents (div elements with Tailwind classes). Do NOT generate `<!DOCTYPE html>`, `<html>`, `<head>`, `<body>`, or any document structure tags. Only output the content that goes inside the body.**

## Requirements

### Technical Constraints

- **Framework**: HTML with Tailwind CSS only (via CDN)
- **No JavaScript**: The HTML must be purely presentational - no event handlers, no scripts, no interactive elements
- **No CSS Units**: Do NOT use `vw`, `vh`, `rem`, `em`, or any viewport-relative units. Use only `px` values or Tailwind's spacing utilities
- **Container Size**: The parent container is always exactly **390px × 844px** (iPhone 13/14 standard size)
- **Fullscreen**: The UI should fill the entire container (390px × 844px)

### Code Structure

- Use only standard HTML elements (`div`, `img`, `p`, `h1`, `h2`, `h3`, `span`, `ul`, `li`, etc.)
- **Layout Elements**: Use only `div` elements for layout containers - do NOT use semantic HTML tags like `header`, `section`, `main`, or `footer`
- Apply styling exclusively through Tailwind CSS classes
- No inline styles except for fixed dimensions when necessary
- **Root Element**: The root element must be a `div` with classes `flex h-full w-full`
- **Icons**: Use Font Awesome icons ONLY via CDN (use `<i>` tags with Font Awesome classes like `fa fa-home` or `fas fa-home`). NEVER generate custom SVG icons or embed SVG code directly. The Font Awesome CDN will be automatically included.
- **Images**: Use Unsplash for image mockups (use `https://images.unsplash.com/` URLs with appropriate dimensions)
- **ONLY PAGE CONTENTS**: Generate ONLY the page content elements (divs, images, text, etc.). Do NOT generate any document structure like `<!DOCTYPE html>`, `<html>`, `<head>`, `<body>`, `<meta>`, or `<script>` tags. The document structure will be added automatically.

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
- **Scrolling**: Use appropriate scrolling behavior for mobile devices - use `overflow-y-auto` or `overflow-x-auto` classes where content exceeds the viewport
- **Cursor Pointer**: All touchable/interactive-looking elements (buttons, links, cards, etc.) must include `cursor-pointer` class by default
- **Mobile Considerations**: Consider all mobile phone implications - one-handed use, thumb reach zones, gesture-friendly spacing, and mobile-optimized layouts

### Output Format

**CRITICAL INSTRUCTIONS:**

- Generate ONLY the page content elements - the div structure with Tailwind classes
- **DO NOT** include `<!DOCTYPE html>`, `<html>`, `<head>`, `<body>`, or any document structure tags
- **DO NOT** include `<meta>`, `<title>`, `<script>`, or any head/body wrapper tags
- **DO NOT** include the Tailwind CDN script tag (it will be added automatically)
- Start your output directly with the root `div` element: `<div class="flex h-full w-full">`
- Include all necessary Tailwind classes
- Ensure the HTML renders correctly within a 390px × 844px container
- Your output should be the raw content that will be inserted into a body tag - nothing more, nothing less

## Example Structure

```html
<div class="flex h-full w-full overflow-y-auto">
  <!-- Example with Font Awesome icon - touchable elements need cursor-pointer -->
  <div class="flex h-11 w-11 cursor-pointer items-center justify-center">
    <i class="fas fa-home text-xl text-blue-500"></i>
  </div>

  <!-- Example with Unsplash image -->
  <img
    src="https://images.unsplash.com/photo-1234567890?w=390&h=844&fit=crop"
    alt="Description"
    class="h-full w-full object-cover"
  />

  <!-- Example touchable button - minimum 44px touch target with cursor-pointer -->
  <div
    class="flex h-11 cursor-pointer items-center justify-center rounded-lg bg-blue-500 px-4 text-white"
  >
    Button
  </div>

  <!-- Your UI content here -->
</div>
```

**CRITICAL**:

- Output ONLY the page content starting with `<div class="flex h-full w-full">`
- Do NOT include any document structure tags (`<!DOCTYPE>`, `<html>`, `<head>`, `<body>`)
- Do NOT include any meta tags, script tags, or document wrappers
- Use `class` instead of `className` (standard HTML attribute)
- The document structure and Tailwind CDN will be automatically added around your content

## Guidelines

- Focus on creating a visually appealing, professional UI mockup
- Solve the user's problem through thoughtful design and layout
- Make it look production-ready and polished
- Ensure all text is readable and properly sized for mobile
- Use Font Awesome icons ONLY for all icon needs - use `<i>` tags with Font Awesome classes (e.g., `fas fa-home`, `far fa-user`, `fab fa-twitter`). NEVER generate custom SVG icons or embed SVG code directly. The Font Awesome CDN will be automatically included.
- Use Unsplash images for image mockups - select relevant, high-quality images that fit the context
- Consider the user's specific requirements and context
- Remember: Output HTML, not JSX - use `class` instead of `className`, and standard HTML attributes
