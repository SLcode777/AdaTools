"use client";

import { Copy, TextInitial } from "lucide-react";
import { useState } from "react";
import { Module } from "../dashboard/module";
import { Button } from "../ui/button";

const LOREM_IPSUM =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.";

interface LoremIpsumModuleProps {
  isPinned?: boolean;
  onTogglePin?: () => void;
}

export function LoremIpsumModule({
  isPinned,
  onTogglePin,
}: LoremIpsumModuleProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(LOREM_IPSUM);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Module
      title="Lorem Ipsum"
      description="Placeholder text generator"
      icon={<TextInitial className="h-5 w-5" color="#00B5D4" />}
      isPinned={isPinned}
      onTogglePin={onTogglePin}
    >
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-3">
          {LOREM_IPSUM}
        </p>
        <Button onClick={handleCopy} className="w-full" variant="outline">
          <Copy className="h-4 w-4 mr-2" />
          {copied ? "Copied!" : "Copy"}
        </Button>
      </div>
    </Module>
  );
}
