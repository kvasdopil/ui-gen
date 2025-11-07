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
- **Icons**: Use `react-icons` library for all icons (import from `react-icons/fa`, `react-icons/md`, `react-icons/hi`, etc.)
- **Images**: Use Unsplash for image mockups (use `https://images.unsplash.com/` URLs with appropriate dimensions)
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
import { FaHome, FaUser } from "react-icons/fa";

export default function Contents() {
  return (
    <div className="flex h-full w-full">
      {/* Example with react-icons */}
      <FaHome className="text-blue-500" />
      
      {/* Example with Unsplash image */}
      <img 
        src="https://images.unsplash.com/photo-1234567890?w=390&h=844&fit=crop" 
        alt="Description" 
        className="w-full h-full object-cover"
      />
      
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
- Use `react-icons` for all icon needs - choose appropriate icon sets (FontAwesome, Material Design, Heroicons, etc.)
- Use Unsplash images for image mockups - select relevant, high-quality images that fit the context
- Consider the user's specific requirements and context