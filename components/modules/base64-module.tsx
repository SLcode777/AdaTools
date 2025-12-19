"use client";

import { ArrowDownUp, MessageSquareLock } from "lucide-react";
import { useState } from "react";
import { Module } from "../dashboard/module";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";

interface Base64ModuleProps {
  isPinned?: boolean;
  onTogglePin?: () => void;
}

export function Base64Module({ isPinned, onTogglePin }: Base64ModuleProps) {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState<"encode" | "decode">("encode");

  const handleConvert = () => {
    try {
      if (mode === "encode") {
        setOutput(btoa(input));
      } else {
        setOutput(atob(input));
      }
    } catch (error) {
      setOutput("Error: invalid format");
    }
  };

  const toggleMode = () => {
    setMode(mode === "encode" ? "decode" : "encode");
    setInput(output);
    setOutput(input);
  };

  return (
    <Module
      title="Base64"
      description="Encode or decode Base64"
      icon={<MessageSquareLock className="h-5 w-5" color="#00B5D4" />}
      isPinned={isPinned}
      onTogglePin={onTogglePin}
    >
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">
            {mode === "encode" ? "Text" : "Base64"}
          </label>
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              mode === "encode" ? "Enter text..." : "Enter Base64..."
            }
            rows={3}
          />
        </div>

        <div className="flex gap-2">
          <Button onClick={handleConvert} className="flex-1">
            {mode === "encode" ? "Encode" : "Decode"}
          </Button>
          <Button onClick={toggleMode} variant="outline" size="icon">
            <ArrowDownUp className="h-4 w-4" />
          </Button>
        </div>

        {output && (
          <div>
            <label className="text-sm font-medium mb-2 block">Result</label>
            <Textarea
              value={output}
              readOnly
              rows={3}
              className="font-mono text-sm"
            />
          </div>
        )}
      </div>
    </Module>
  );
}
