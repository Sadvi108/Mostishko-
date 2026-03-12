"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageSquare, Library, Search, Network, Settings, Cpu } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

const navItems = [
  { name: "Chat", href: "/", icon: MessageSquare },
  { name: "Library", href: "/library", icon: Library },
  { name: "Search", href: "/search", icon: Search },
  { name: "Graph", href: "/graph", icon: Network },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isLocal, setIsLocal] = useState(false);

  useEffect(() => {
    // Check if we are in local mode (simple check if provider is ollama)
    /*
    fetch("http://localhost:8000/api/health/llm")
      .then(res => res.json())
      .then(data => {
        if (data.llm_provider === "ollama" || data.embedding_provider === "ollama") {
          setIsLocal(true);
        }
      })
      .catch(() => {});
    */
     setIsLocal(true); // Assume local for now to debug
  }, []);

  return (
    <div className="flex h-screen w-64 flex-col border-r border-border bg-sidebar text-sidebar-foreground transition-all duration-300">
      <div className="flex h-16 items-center border-b border-border px-6 justify-between bg-sidebar/50 backdrop-blur-sm">
        <h1 className="text-xl font-bold flex items-center gap-3 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          <span className="h-8 w-8 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white text-sm shadow-lg shadow-blue-500/20">M</span>
          Mostishko
        </h1>
        {isLocal && (
          <div className="flex items-center gap-1.5 rounded-full bg-blue-500/10 px-2.5 py-1 text-[10px] font-bold text-blue-400 border border-blue-500/20 shadow-[0_0_10px_-3px_rgba(59,130,246,0.3)]">
            <Cpu className="h-3 w-3 animate-pulse" />
            LOCAL
          </div>
        )}
      </div>
      <nav className="flex-1 space-y-1.5 p-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href} className="block group">
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-3 px-4 py-6 text-sm font-medium transition-all duration-200",
                  isActive 
                    ? "bg-gradient-to-r from-blue-600/10 to-purple-600/10 text-blue-400 border-l-2 border-blue-500 shadow-[inset_10px_0_20px_-10px_rgba(59,130,246,0.1)] rounded-r-xl rounded-l-none" 
                    : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-100 hover:translate-x-1"
                )}
              >
                <item.icon className={cn("h-5 w-5 transition-colors", isActive ? "text-blue-400 drop-shadow-[0_0_5px_rgba(59,130,246,0.5)]" : "text-zinc-500 group-hover:text-zinc-300")} />
                {item.name}
              </Button>
            </Link>
          );
        })}
      </nav>
      
      <div className="border-t border-border p-4 bg-sidebar/30">
        <div className="flex items-center gap-3 rounded-xl bg-gradient-to-br from-zinc-800/50 to-zinc-900/50 p-3 border border-white/5 shadow-lg backdrop-blur-md hover:border-white/10 transition-colors cursor-pointer group">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold shadow-md ring-2 ring-white/5 group-hover:ring-blue-500/50 transition-all">
            U
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-zinc-200 group-hover:text-white transition-colors">User</span>
            <span className="text-[10px] font-medium text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded-md w-fit mt-0.5">Pro Plan</span>
          </div>
        </div>
      </div>
    </div>
  );
}
