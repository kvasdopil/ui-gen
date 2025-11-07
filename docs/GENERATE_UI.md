# UI Generation Prompt

Generate a beautiful, non-interactive UI mockup using React and Tailwind CSS that solves the user's described problem.

## Requirements

### Technical Constraints
- **Framework**: React with Tailwind CSS only
- **No JavaScript**: The component must be purely presentational - no event handlers, no state, no hooks, no interactive elements
- **No CSS Units**: Do NOT use `vw`, `vh`, `rem`, `em`, or any viewport-relative units. Use only `px` values or Tailwind's spacing utilities
- **Container Size**: The parent container is always exactly **390px × 844px** (iPhone 13/14 standard size)
- **Fullscreen**: The UI should fill the entire container (390px × 844px)

### Code Structure
- Use only standard HTML elements (`div`, `section`, `header`, `main`, `footer`, `img`, `p`, `h1`, `h2`, `h3`, `span`, `ul`, `li`, etc.)
- Apply styling exclusively through Tailwind CSS classes
- No inline styles except for fixed dimensions when necessary
- **Component Location**: The code must be placed in `Contents.tsx` file
- **Component Name**: Export as a default functional component named `Contents`
- **Root Element**: The root component must be a `div` with classes `flex h-full w-full`
- Component should be self-contained and ready to render

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

### Output Format
- Return only the React component code for `Contents.tsx`
- Use TypeScript if the project uses TypeScript, otherwise use JavaScript
- Include all necessary Tailwind classes
- Ensure the component renders correctly within a 390px × 844px container
- The component must be named `Contents` and exported as default

## Example Structure

```tsx
export default function Contents() {
  return (
    <div className="flex h-full w-full">
      {/* Your UI content here */}
    </div>
  );
}
```

**Important**: The component must be named `Contents` and exported as default, as it will be placed in `Contents.tsx`.

## Guidelines
- Focus on creating a visually appealing, professional UI mockup
- Solve the user's problem through thoughtful design and layout
- Make it look production-ready and polished
- Ensure all text is readable and properly sized for mobile
- Use appropriate icons/images placeholders if needed
- Consider the user's specific requirements and context

