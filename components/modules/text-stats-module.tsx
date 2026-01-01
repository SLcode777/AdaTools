"use client";

import { BarChart3 } from "lucide-react";
import { useState } from "react";
import { Module } from "../dashboard/module";
import { Textarea } from "../ui/textarea";

interface TextStatsModuleProps {
  isPinned?: boolean;
  onTogglePin?: () => void;
  isAuthenticated?: boolean;
  onAuthRequired?: () => void;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

export function TextStatsModule({
  isPinned,
  onTogglePin,
  isAuthenticated = true,
}: TextStatsModuleProps) {
  const [text, setText] = useState("");

  // Calculate statistics
  const characterCount = text.length;
  const wordCount = text.trim().split(/\s+/).filter(w => w.length > 0).length;
  const lineCount = text.length === 0 ? 0 : text.split('\n').length;
  const byteSize = new TextEncoder().encode(text).length;

  return (
    <Module
      title="Text Statistics"
      description="Real-time text analysis and statistics"
      icon={<BarChart3 className="h-5 w-5 text-primary" />}
      isPinned={isPinned}
      onTogglePin={onTogglePin}
      isAuthenticated={isAuthenticated}
    >
      <div className="space-y-4">
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste or type text to analyze..."
          className="font-sans text-sm min-h-32 max-h-64 overflow-y-auto [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-primary/50 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-primary"
        />

        {/* Statistics Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">Character count</div>
            <div className="text-sm font-medium">{characterCount}</div>
          </div>
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">Word count</div>
            <div className="text-sm font-medium">{wordCount}</div>
          </div>
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">Line count</div>
            <div className="text-sm font-medium">{lineCount}</div>
          </div>
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">Byte size</div>
            <div className="text-sm font-medium">{formatBytes(byteSize)}</div>
          </div>
        </div>
      </div>
    </Module>
  );
}
