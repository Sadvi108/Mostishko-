"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Search as SearchIcon, Loader2, FileText } from "lucide-react";

interface SearchResult {
  id: number;
  title: string;
  content: string;
  score: number;
  source_type: string;
}

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setHasSearched(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (data.results) {
        setResults(data.results);
      } else {
        setResults([]);
      }
    } catch (error) {
      console.error("Search failed:", error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 space-y-8 max-w-4xl mx-auto text-zinc-100">
      <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">Search</h1>

      <form onSubmit={handleSearch} className="flex gap-3">
        <div className="relative flex-1 group">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500 group-focus-within:text-blue-500 transition-colors" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search documents..."
            className="pl-11 bg-zinc-900/50 border-white/10 text-zinc-200 focus-visible:ring-blue-500/50 focus-visible:border-blue-500/50 h-12 text-base rounded-xl transition-all shadow-lg"
          />
        </div>
        <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-500 text-white h-12 px-6 rounded-xl shadow-lg shadow-blue-600/20 border-none">
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Search"}
        </Button>
      </form>

      <div className="space-y-4">
        {hasSearched && results.length === 0 && !loading && (
          <div className="text-center py-16 bg-zinc-900/30 rounded-2xl border border-dashed border-zinc-800">
            <SearchIcon className="h-10 w-10 text-zinc-700 mx-auto mb-3" />
            <p className="text-zinc-500">No results found for "{query}"</p>
          </div>
        )}

        {results.map((result) => (
          <Card key={result.id} className="bg-zinc-900/40 border-white/5 hover:border-blue-500/30 hover:bg-zinc-900/60 transition-all duration-300 shadow-lg group backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-blue-400 hover:text-blue-300 cursor-pointer flex items-center gap-2 transition-colors">
                <FileText className="h-4 w-4" />
                {result.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-zinc-400 line-clamp-3 leading-relaxed">
                {result.content}
              </p>
              <div className="mt-3 flex items-center gap-2">
                <span className="text-[10px] px-2 py-0.5 rounded uppercase font-bold tracking-wider bg-zinc-800 text-zinc-400 border border-zinc-700">
                  {result.source_type}
                </span>
                {result.score > 0 && (
                    <span className="text-[10px] text-zinc-500 font-mono">
                        Score: {result.score.toFixed(2)}
                    </span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
