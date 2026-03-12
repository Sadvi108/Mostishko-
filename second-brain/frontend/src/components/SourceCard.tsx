import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalLink } from "lucide-react";

interface SourceProps {
  source: {
    title: string;
    url?: string;
    content?: string;
    score?: number;
  };
}

export function SourceCard({ source }: SourceProps) {
  return (
    <Card className="bg-zinc-900/50 border-white/5 text-zinc-300 mb-0 shadow-lg hover:bg-zinc-900 hover:border-blue-500/30 transition-all duration-300 group backdrop-blur-sm">
      <CardHeader className="p-3 pb-0">
        <CardTitle className="text-sm font-medium flex items-center justify-between text-zinc-200 group-hover:text-blue-300 transition-colors">
          <span className="truncate">{source.title}</span>
          {source.url && (
            <a href={source.url} target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:text-blue-400 transition-colors">
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 text-xs text-zinc-400 line-clamp-2 leading-relaxed">
        {source.content}
      </CardContent>
    </Card>
  );
}
