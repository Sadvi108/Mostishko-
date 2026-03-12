"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, File, CheckCircle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export function FileUpload({ onUploadSuccess }: { onUploadSuccess?: () => void }) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setUploading(true);
    setProgress(0);
    setStatus("idle");

    const file = acceptedFiles[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    // Simulate progress
    const interval = setInterval(() => {
        setProgress((prev) => {
            if (prev >= 90) {
                return 90;
            }
            return prev + 10;
        });
    }, 200);

    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/ingest/file`, {
            method: "POST",
            body: formData,
        });

        clearInterval(interval);
        
        if (!response.ok) throw new Error("Upload failed");
        
        setProgress(100);
        setStatus("success");
        if (onUploadSuccess) onUploadSuccess();
    } catch (e) {
        clearInterval(interval);
        setStatus("error");
    } finally {
        setUploading(false);
        setTimeout(() => {
            setStatus("idle");
            setProgress(0);
        }, 3000);
    }
  }, [onUploadSuccess]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <div
      {...getRootProps()}
      className={cn(
        "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300",
        isDragActive 
            ? "border-blue-500 bg-blue-500/10" 
            : "border-zinc-700 hover:border-blue-500/50 hover:bg-zinc-800/50 bg-black/20",
        status === "success" && "border-green-500 bg-green-500/10",
        status === "error" && "border-red-500 bg-red-500/10"
      )}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center gap-3">
        {status === "success" ? (
          <CheckCircle className="h-10 w-10 text-green-500 animate-in zoom-in" />
        ) : status === "error" ? (
          <AlertCircle className="h-10 w-10 text-red-500 animate-in zoom-in" />
        ) : (
          <div className="h-12 w-12 rounded-full bg-zinc-800 flex items-center justify-center border border-zinc-700">
            <Upload className="h-6 w-6 text-zinc-400" />
          </div>
        )}
        
        <div className="space-y-1">
            <p className="text-sm font-medium text-zinc-200">
            {isDragActive ? "Drop file here" : "Click to upload or drag and drop"}
            </p>
            <p className="text-xs text-zinc-500">PDF, TXT, MD, DOCX (Max 10MB)</p>
        </div>
        
        {uploading && (
          <div className="w-full max-w-xs mt-4 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
             <div 
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-200"
                style={{ width: `${progress}%` }}
             />
          </div>
        )}
      </div>
    </div>
  );
}
