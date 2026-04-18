"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/src/lib/utils";
import { X } from "lucide-react";
import * as React from "react";

interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  suggestions?: string[];
  placeholder?: string;
}

export function TagInput({
  value,
  onChange,
  suggestions = [],
  placeholder = "Add a tag...",
}: TagInputProps) {
  const [input, setInput] = React.useState("");
  const [isFocused, setIsFocused] = React.useState(false);
  const [highlightIndex, setHighlightIndex] = React.useState(0);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const query = input.trim().toLowerCase();
  const filteredSuggestions = suggestions
    .filter((t) => !value.includes(t))
    .filter((t) => (query ? t.toLowerCase().includes(query) : true))
    .slice(0, 8);

  const showDropdown = isFocused && filteredSuggestions.length > 0;

  React.useEffect(() => {
    setHighlightIndex(0);
  }, [input, isFocused]);

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const addTag = (tag: string) => {
    const trimmed = tag.trim();
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed]);
    }
    setInput("");
  };

  const removeTag = (tag: string) => {
    onChange(value.filter((t) => t !== tag));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (showDropdown && filteredSuggestions[highlightIndex]) {
        addTag(filteredSuggestions[highlightIndex]);
      } else {
        addTag(input);
      }
    } else if (e.key === "ArrowDown" && showDropdown) {
      e.preventDefault();
      setHighlightIndex((i) => Math.min(i + 1, filteredSuggestions.length - 1));
    } else if (e.key === "ArrowUp" && showDropdown) {
      e.preventDefault();
      setHighlightIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Escape") {
      setIsFocused(false);
    } else if (e.key === "Backspace" && !input && value.length > 0) {
      removeTag(value[value.length - 1]);
    }
  };

  return (
    <div className="space-y-2">
      <div ref={containerRef} className="relative">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            placeholder={placeholder}
          />
          <Button type="button" variant="outline" onClick={() => addTag(input)}>
            Add
          </Button>
        </div>
        {showDropdown && (
          <ul
            className="absolute z-50 left-0 right-0 mt-1 max-h-48 overflow-y-auto border bg-popover text-popover-foreground shadow-md [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-primary/50"
            role="listbox"
          >
            {filteredSuggestions.map((tag, index) => (
              <li
                key={tag}
                role="option"
                aria-selected={index === highlightIndex}
                onMouseDown={(e) => {
                  e.preventDefault();
                  addTag(tag);
                }}
                onMouseEnter={() => setHighlightIndex(index)}
                className={cn(
                  "px-3 py-1.5 text-xs cursor-pointer",
                  index === highlightIndex && "bg-accent text-accent-foreground"
                )}
              >
                {tag}
              </li>
            ))}
          </ul>
        )}
      </div>
      {value.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {value.map((tag) => (
            <Badge key={tag} variant="secondary">
              {tag}
              <button type="button" onClick={() => removeTag(tag)} className="ml-1">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
