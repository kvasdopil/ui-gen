// Grid size for snapping
const GRID_SIZE = 16;

// Helper function to snap a value to the grid
export const snapToGrid = (value: number): number => {
  return Math.round(value / GRID_SIZE) * GRID_SIZE;
};

// Helper function to convert string to kebab case
export const toKebabCase = (str: string): string => {
  return str
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .replace(/[\s_]+/g, "-")
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
};

// Helper function to wrap HTML with Tailwind and remove links
export const wrapHtmlWithTailwindAndRemoveLinks = (html: string): string => {
  // Remove links by converting <a> tags to <span> tags
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const links = doc.querySelectorAll("a[href]");
  links.forEach((link) => {
    const span = doc.createElement("span");
    // Copy all attributes except href
    Array.from(link.attributes).forEach((attr) => {
      if (attr.name !== "href") {
        span.setAttribute(attr.name, attr.value);
      }
    });
    // Copy all child nodes
    while (link.firstChild) {
      span.appendChild(link.firstChild);
    }
    link.parentNode?.replaceChild(span, link);
  });
  const processedHtml = doc.body.innerHTML;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Generated UI</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" integrity="sha512-DTOQO9RWCH3ppGqcWaEA1BIZOC6xxalwEsw9c2QQeAIftl+Vegovlnee1c9QX4TctnWMn13TZye+giMm8e2LwA==" crossorigin="anonymous" referrerpolicy="no-referrer" />
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { width: 100%; min-height: 844px; }
    body > * { min-height: 844px; }
  </style>
</head>
<body>
  ${processedHtml}
</body>
</html>`;
};

