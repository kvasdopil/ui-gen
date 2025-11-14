export type ConversationPointArrow = {
  overlayIndex: number; // Index of the clickable overlay in this conversation point's HTML
  targetScreenId: string; // Target screen id that this arrow points to
  startPoint?: { x: number; y: number }; // Optional: start point relative to screen center (for rendering)
};

export type ConversationPoint = {
  id?: string; // Dialog entry ID from database (optional for backward compatibility)
  prompt: string;
  html: string;
  title: string | null;
  timestamp: number;
  arrows?: ConversationPointArrow[]; // Arrows associated with this conversation point
};

export type ScreenData = {
  id: string;
  conversationPoints: ConversationPoint[];
  selectedPromptIndex: number | null;
  position?: { x: number; y: number };
  height?: number; // Actual iframe height (defaults to 844 if not set)
};

export type Arrow = {
  id: string;
  startScreenId: string;
  conversationPointIndex: number; // Index of the conversation point in the screen
  overlayIndex: number; // Index of the clickable overlay on the start screen
  startPoint: { x: number; y: number }; // Relative to start screen center (content coordinates)
  endScreenId: string | null;
  endPoint: { x: number; y: number }; // Relative to end screen center (content coordinates)
};
