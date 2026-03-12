"use client";

import { useEffect, useState, useRef } from "react";
import dynamic from "next/dynamic";
import { Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

// Dynamically import ForceGraph2D to avoid SSR issues
const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), {
  ssr: false,
  loading: () => <div className="flex h-[600px] items-center justify-center text-zinc-400">Loading Graph...</div>
});

interface GraphData {
  nodes: any[];
  links: any[];
}

export default function GraphPage() {
  const [data, setData] = useState<GraphData>({ nodes: [], links: [] });
  const [loading, setLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  const fetchGraph = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/graph`);
      const graphData = await res.json();
      setData(graphData);
    } catch (error) {
      console.error("Failed to fetch graph:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGraph();
  }, []);

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight
        });
      }
    };

    window.addEventListener('resize', updateDimensions);
    updateDimensions();

    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  return (
    <div className="flex flex-col h-full bg-background text-foreground">
      <div className="flex justify-between items-center p-4 border-b border-border bg-sidebar/50 backdrop-blur-sm">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">Knowledge Graph</h1>
        <Button variant="outline" size="sm" onClick={fetchGraph} disabled={loading} className="gap-2 border-white/10 bg-white/5 hover:bg-white/10 hover:text-white text-zinc-300">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          Refresh
        </Button>
      </div>
      
      <div ref={containerRef} className="flex-1 overflow-hidden bg-background relative">
        {data.nodes.length === 0 && !loading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-500">
                <p className="mb-2">No connections found yet.</p>
                <p className="text-sm text-zinc-600">Upload documents with overlapping topics to see them connect.</p>
            </div>
        ) : (
            <ForceGraph2D
            width={dimensions.width}
            height={dimensions.height}
            graphData={data}
            nodeLabel="label"
            nodeColor={(node: any) => node.type === 'pdf' ? '#ef4444' : '#3b82f6'}
            nodeRelSize={6}
            linkColor={() => '#334155'}
            backgroundColor="#09090b"
            />
        )}
      </div>
    </div>
  );
}
