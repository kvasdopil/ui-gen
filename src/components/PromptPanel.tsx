import { FaPaperPlane } from "react-icons/fa";

interface PromptPanelProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  isLoading: boolean;
}

export default function PromptPanel({
  value,
  onChange,
  onSend,
  isLoading,
}: PromptPanelProps) {
  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className="absolute -top-2 left-full ml-2 z-10 flex gap-2">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyPress}
        placeholder="Describe the UI you want..."
        rows={6}
        className="w-48 resize-none rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs shadow-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
        disabled={isLoading}
      />
      <button
        onClick={onSend}
        disabled={isLoading || !value.trim()}
        className="flex h-8 w-8 items-center justify-center self-start rounded-lg bg-blue-500 text-white shadow-lg transition-colors hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <FaPaperPlane className="text-xs" />
      </button>
    </div>
  );
}

