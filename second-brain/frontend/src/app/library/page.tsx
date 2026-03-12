"use client";

import { useState, useEffect } from "react";
import { FileUpload } from "@/components/FileUpload";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trash2, Loader2, FileText, Link as LinkIcon, Upload, RefreshCw, CheckCircle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Document {
  id: number;
  title: string;
  source_type: string;
  created_at: string;
}

export default function LibraryPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchDocuments = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/documents`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setDocuments(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this document?")) return;
    
    setDeletingId(id);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/documents/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setDocuments(prev => prev.filter(doc => doc.id !== id));
      }
    } catch (error) {
      console.error("Failed to delete", error);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="p-8 space-y-8 max-w-6xl mx-auto text-zinc-100">
      <div className="flex justify-between items-center">
        <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">Library</h1>
            <p className="text-zinc-500 mt-1">Manage your knowledge base</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchDocuments} className="gap-2 border-white/10 bg-white/5 hover:bg-white/10 hover:text-white text-zinc-300">
            <RefreshCw className="h-4 w-4" />
            Refresh
        </Button>
      </div>
      
      <section className="bg-zinc-900/50 p-6 rounded-2xl border border-white/5 shadow-xl backdrop-blur-sm">
        <h2 className="text-xl font-semibold mb-6 text-zinc-200 flex items-center gap-2">
            <span className="w-1 h-6 bg-blue-500 rounded-full"></span>
            Add Knowledge
        </h2>
        
        <Tabs defaultValue="file" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8 bg-black/40 p-1 rounded-xl border border-white/5">
            <TabsTrigger value="file" className="gap-2 data-[state=active]:bg-zinc-800 data-[state=active]:text-white rounded-lg transition-all"><Upload className="h-4 w-4" /> Upload File</TabsTrigger>
            <TabsTrigger value="url" className="gap-2 data-[state=active]:bg-zinc-800 data-[state=active]:text-white rounded-lg transition-all"><LinkIcon className="h-4 w-4" /> Add URL</TabsTrigger>
            <TabsTrigger value="text" className="gap-2 data-[state=active]:bg-zinc-800 data-[state=active]:text-white rounded-lg transition-all"><FileText className="h-4 w-4" /> Paste Text</TabsTrigger>
          </TabsList>
          
          <TabsContent value="file" className="mt-0">
            <FileUpload onUploadSuccess={fetchDocuments} />
          </TabsContent>
          
          <TabsContent value="url" className="mt-0">
            <UrlUpload onUploadSuccess={fetchDocuments} />
          </TabsContent>
          
          <TabsContent value="text" className="mt-0">
            <TextUpload onUploadSuccess={fetchDocuments} />
          </TabsContent>
        </Tabs>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-6 flex items-center gap-3 text-zinc-200">
            Your Documents
            <span className="text-xs font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-full">
                {documents.length}
            </span>
        </h2>
        
        {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1,2,3].map(i => (
                    <div key={i} className="h-32 bg-zinc-900/50 animate-pulse rounded-xl border border-white/5"></div>
                ))}
            </div>
        ) : documents.length === 0 ? (
            <div className="text-center py-16 bg-zinc-900/30 rounded-2xl border border-dashed border-zinc-800">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-zinc-900 mb-4">
                    <FileText className="h-6 w-6 text-zinc-600" />
                </div>
                <p className="text-zinc-500 font-medium">No documents found</p>
                <p className="text-zinc-600 text-sm mt-1">Add content above to get started</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {documents.map((doc) => (
                <Card key={doc.id} className="bg-zinc-900/40 border-white/5 hover:border-blue-500/30 hover:bg-zinc-900/60 transition-all duration-300 shadow-lg group backdrop-blur-sm">
                <CardHeader className="pb-2">
                    <CardTitle className="truncate text-zinc-200 text-base flex justify-between items-start gap-2 group-hover:text-blue-200 transition-colors">
                        <span title={doc.title} className="truncate">{doc.title}</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex justify-between items-center mt-3">
                        <div className="flex items-center gap-2">
                            <span className={cn(
                                "text-[10px] px-2 py-0.5 rounded-md uppercase font-bold tracking-wider border",
                                doc.source_type === 'pdf' ? "bg-red-500/10 text-red-400 border-red-500/20" :
                                doc.source_type === 'url' ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                                "bg-zinc-800 text-zinc-400 border-zinc-700"
                            )}>
                                {doc.source_type}
                            </span>
                            <span className="text-[10px] text-zinc-500">
                                {new Date(doc.created_at).toLocaleDateString()}
                            </span>
                        </div>
                        
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-7 w-7 text-zinc-600 hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all rounded-lg"
                            onClick={() => handleDelete(doc.id)}
                            disabled={deletingId === doc.id}
                        >
                            {deletingId === doc.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
                        </Button>
                    </div>
                </CardContent>
                </Card>
            ))}
            </div>
        )}
      </section>
    </div>
  );
}

function UrlUpload({ onUploadSuccess }: { onUploadSuccess: () => void }) {
    const [url, setUrl] = useState("");
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!url) return;
        
        setLoading(true);
        setStatus("idle");
        
        try {
            const formData = new FormData();
            formData.append("url", url);
            
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/ingest/url`, {
                method: "POST",
                body: formData,
            });
            
            if (!res.ok) throw new Error("Failed");
            
            setStatus("success");
            setUrl("");
            onUploadSuccess();
            setTimeout(() => setStatus("idle"), 3000);
        } catch (e) {
            setStatus("error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto py-4">
            <div className="flex gap-2">
                <Input 
                    placeholder="https://example.com/article" 
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="bg-black/20 border-white/10 text-zinc-200 focus-visible:ring-blue-500/50 focus-visible:border-blue-500/50"
                />
                <Button type="submit" disabled={loading || !url} className="bg-blue-600 hover:bg-blue-500 text-white border-none">
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Fetch"}
                </Button>
            </div>
            {status === "success" && <p className="text-xs text-green-400 text-center flex items-center justify-center gap-1"><CheckCircle className="h-3 w-3" /> Successfully added URL!</p>}
            {status === "error" && <p className="text-xs text-red-400 text-center flex items-center justify-center gap-1"><AlertCircle className="h-3 w-3" /> Failed to fetch URL.</p>}
        </form>
    );
}

function TextUpload({ onUploadSuccess }: { onUploadSuccess: () => void }) {
    const [text, setText] = useState("");
    const [title, setTitle] = useState("");
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!text || !title) return;
        
        setLoading(true);
        setStatus("idle");
        
        try {
            const formData = new FormData();
            formData.append("text", text);
            formData.append("title", title);
            
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/ingest/text`, {
                method: "POST",
                body: formData,
            });
            
            if (!res.ok) throw new Error("Failed");
            
            setStatus("success");
            setText("");
            setTitle("");
            onUploadSuccess();
            setTimeout(() => setStatus("idle"), 3000);
        } catch (e) {
            setStatus("error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
            <Input 
                placeholder="Title for this note..." 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="bg-black/20 border-white/10 text-zinc-200 focus-visible:ring-blue-500/50 focus-visible:border-blue-500/50"
                required
            />
            <Textarea 
                placeholder="Paste your text content here..." 
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="min-h-[200px] bg-black/20 border-white/10 text-zinc-200 focus-visible:ring-blue-500/50 focus-visible:border-blue-500/50"
                required
            />
            <div className="flex justify-end gap-4 items-center">
                {status === "success" && <p className="text-xs text-green-400">Saved!</p>}
                {status === "error" && <p className="text-xs text-red-400">Failed to save.</p>}
                <Button type="submit" disabled={loading || !text || !title} className="bg-blue-600 hover:bg-blue-500 text-white border-none">
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Note"}
                </Button>
            </div>
        </form>
    );
}
