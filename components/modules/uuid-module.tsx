"use client";

import { Copy, KeyRound, RefreshCw } from "lucide-react";
import { useState } from "react";
import { Module } from "../dashboard/module";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

function generateUUID() {
  return crypto.randomUUID();
}

interface UuidModuleProps {
  isPinned?: boolean;
  onTogglePin?: () => void;
  isAuthenticated?: boolean;
  onAuthRequired?: () => void;
}

export function UuidModule({
  isPinned,
  onTogglePin,
  isAuthenticated = true,
}: UuidModuleProps) {
  const [uuid, setUuid] = useState(generateUUID());
  const [copied, setCopied] = useState(false);

  const handleGenerate = () => {
    setUuid(generateUUID());
    setCopied(false);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(uuid);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Module
      title="UUID Generator"
      description="Generate unique identifiers"
      icon={<KeyRound className="h-5 w-5 text-primary" />}
      isPinned={isPinned}
      onTogglePin={onTogglePin}
      isAuthenticated={isAuthenticated}
    >
      <div className="space-y-4">
        <Input value={uuid} readOnly className="font-sans text-sm" />
        <div className="flex gap-2">
          <Button onClick={handleGenerate} variant="outline" className="flex-1">
            <RefreshCw className="h-4 w-4 mr-2" />
            Generate
          </Button>
          <Button onClick={handleCopy} variant="outline" className="flex-1">
            <Copy className="h-4 w-4 mr-2" />
            {copied ? "Copied!" : "Copy"}
          </Button>
        </div>
      </div>
    </Module>
  );
}
