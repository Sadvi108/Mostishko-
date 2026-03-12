"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Trash2, Loader2, AlertTriangle } from "lucide-react";

export default function SettingsPage() {
  const [deleting, setDeleting] = useState(false);

  const handleDeleteAll = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/settings/delete-all`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete");
      alert("All documents have been deleted.");
    } catch (error) {
      console.error("Delete failed:", error);
      alert("Failed to delete documents.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="p-8 space-y-8 max-w-4xl mx-auto text-zinc-100">
      <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">Settings</h1>

      <Card className="bg-zinc-900/50 border-red-500/20 shadow-lg backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-red-400 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Danger Zone
          </CardTitle>
          <CardDescription className="text-zinc-500">
            Irreversible actions for your knowledge base.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-red-500/10 rounded-xl bg-red-500/5">
            <div>
              <h3 className="font-medium text-red-200">Delete All Documents</h3>
              <p className="text-sm text-red-400/70">
                This will remove all files and embeddings from the database.
              </p>
            </div>
            
            <Button 
                variant="destructive" 
                disabled={deleting}
                onClick={() => {
                    if (window.confirm("Are you sure you want to delete ALL documents? This cannot be undone.")) {
                        handleDeleteAll();
                    }
                }}
                className="bg-red-600 hover:bg-red-700 text-white border-none shadow-lg shadow-red-600/20"
            >
              {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4 mr-2" />}
              Delete All
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-zinc-900/50 border-white/5 shadow-lg backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-zinc-200">Application Info</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-zinc-400 space-y-3">
          <div className="flex justify-between border-b border-white/5 pb-2">
            <span>Version</span>
            <span className="font-mono text-zinc-200">0.2.0 (Cyberpunk Edition)</span>
          </div>
          <div className="flex justify-between border-b border-white/5 pb-2">
            <span>Frontend</span>
            <span className="font-mono text-zinc-200">Next.js 16</span>
          </div>
          <div className="flex justify-between border-b border-white/5 pb-2">
            <span>Backend</span>
            <span className="font-mono text-zinc-200">FastAPI</span>
          </div>
          <div className="flex justify-between">
            <span>LLM Provider</span>
            <span className="font-mono text-blue-400">Ollama (Llama 3)</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
