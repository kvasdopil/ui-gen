export type ConversationPoint = {
  prompt: string;
  html: string;
  title: string | null;
  timestamp: number;
};

export type ScreenData = {
  id: string;
  conversationPoints: ConversationPoint[];
  selectedPromptIndex: number | null;
  position?: { x: number; y: number };
};

