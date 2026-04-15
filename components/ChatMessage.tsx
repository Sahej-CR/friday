export type MessageRole = "user" | "assistant";

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  isError?: boolean;
}

interface ChatMessageProps {
  message: Message;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";

  if (isUser) {
    return (
      <div className="flex justify-end mb-4">
        <div className="max-w-[75%] lg:max-w-[60%]">
          <div className="bg-gold text-navy-DEFAULT rounded-2xl rounded-tr-sm px-4 py-3 shadow-md">
            <p className="text-sm font-medium leading-relaxed">
              {message.content}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3 mb-4">
      {/* Friday avatar */}
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-navy-surface border border-gold/30 flex items-center justify-center shadow-sm">
        <span className="text-gold text-xs font-semibold select-none">CR</span>
      </div>

      <div className="max-w-[75%] lg:max-w-[60%]">
        <div
          className={`bg-navy-card border rounded-2xl rounded-tl-sm px-4 py-3 shadow-md ${
            message.isError
              ? "border-red-800/50 bg-red-950/30"
              : "border-navy-border"
          }`}
        >
          <p
            className={`text-sm leading-relaxed whitespace-pre-wrap ${
              message.isError ? "text-red-400" : "text-slate-200"
            }`}
          >
            {message.content}
          </p>
        </div>
      </div>
    </div>
  );
}
