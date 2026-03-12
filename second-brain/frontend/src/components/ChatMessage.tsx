import { cn } from "@/lib/utils";
import { SourceCard } from "./SourceCard";
import { User, Bot, Copy, Check } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface Message {
  role: "user" | "assistant";
  content: string;
  sources?: any[];
}

export function ChatMessage({ message }: { message: Message }) {
  const isUser = message.role === "user";
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={cn("flex w-full gap-6 p-6 group transition-colors hover:bg-white/5 rounded-2xl", isUser ? "bg-transparent" : "bg-transparent")}>
      <div className={cn(
        "flex h-10 w-10 shrink-0 select-none items-center justify-center rounded-xl border shadow-lg",
        isUser 
            ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white border-blue-500/50" 
            : "bg-gradient-to-br from-zinc-800 to-zinc-900 text-zinc-300 border-white/10"
      )}>
        {isUser ? <User className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
      </div>
      <div className="flex-1 space-y-3 min-w-0">
        <div className="flex justify-between items-start gap-4">
            <div className="prose prose-invert prose-p:text-zinc-300 prose-headings:text-zinc-100 prose-strong:text-zinc-100 prose-code:text-blue-300 prose-code:bg-blue-950/30 prose-code:px-1 prose-code:rounded prose-pre:bg-zinc-900 prose-pre:border prose-pre:border-white/10 max-w-none whitespace-pre-wrap break-words">
            {message.content}
            </div>
            {!isUser && (
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-zinc-500 opacity-0 group-hover:opacity-100 transition-all hover:text-blue-400 hover:bg-blue-500/10 rounded-lg"
                    onClick={copyToClipboard}
                >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
            )}
        </div>
        
        {message.sources && message.sources.length > 0 && (
          <div className="mt-6 border-t border-white/5 pt-4">
            <h4 className="mb-3 text-[10px] font-bold text-blue-400 uppercase tracking-widest flex items-center gap-2">
                <span className="w-1 h-1 bg-blue-500 rounded-full animate-pulse"></span>
                Referenced Sources
                <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-full">{message.sources.length}</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {message.sources.map((source, i) => (
                <SourceCard key={i} source={source} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
