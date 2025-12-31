"use client";

import { api } from "@/src/lib/trpc/client";
import { Check, Copy, Loader2, StickyNote } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Module } from "../dashboard/module";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";

const VISITOR_MAX_LENGTH = 5000;
const USER_MAX_LENGTH = 20000;
const LOCALSTORAGE_KEY = "sticky-note-content";

interface StickyNoteModuleProps {
  isPinned?: boolean;
  onTogglePin?: () => void;
  isAuthenticated?: boolean;
  onAuthRequired?: () => void;
}

export function StickyNoteModule({
  isPinned,
  onTogglePin,
  isAuthenticated = true,
}: StickyNoteModuleProps) {
  const [note, setNote] = useState("");
  const [copied, setCopied] = useState(false);
  const [hasLoadedFromDb, setHasLoadedFromDb] = useState(false);

  const maxLength = isAuthenticated ? USER_MAX_LENGTH : VISITOR_MAX_LENGTH;

  const { data: stickyNoteData, isLoading } = api.stickyNote.get.useQuery(
    undefined,
    {
      enabled: isAuthenticated,
    }
  );

  const utils = api.useUtils();
  const upsertMutation = api.stickyNote.upsert.useMutation({
    onSuccess: () => {
      utils.stickyNote.get.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to save note");
    },
  });

  useEffect(() => {
    if (!isAuthenticated && typeof window !== "undefined") {
      const savedNote = localStorage.getItem(LOCALSTORAGE_KEY);
      if (savedNote) {
        setNote(savedNote);
      }
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated && !isLoading && !hasLoadedFromDb) {
      if (stickyNoteData) {
        setNote(stickyNoteData.content);
      }
      setHasLoadedFromDb(true);
    }
  }, [isAuthenticated, stickyNoteData, hasLoadedFromDb, isLoading]);

  useEffect(() => {
    if (!isAuthenticated && typeof window !== "undefined") {
      const timeoutId = setTimeout(() => {
        localStorage.setItem(LOCALSTORAGE_KEY, note);
      }, 500);

      return () => clearTimeout(timeoutId);
    }
  }, [note, isAuthenticated]);

  useEffect(() => {
    if (
      isAuthenticated &&
      hasLoadedFromDb &&
      note !== stickyNoteData?.content
    ) {
      const timeoutId = setTimeout(() => {
        upsertMutation.mutate({ content: note });
      }, 1000);

      return () => clearTimeout(timeoutId);
    }
  }, [
    note,
    isAuthenticated,
    hasLoadedFromDb,
    stickyNoteData?.content,
    upsertMutation,
  ]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(note);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    if (newValue.length <= maxLength) {
      setNote(newValue);
    }
  };

  const remainingChars = maxLength - note.length;
  const isNearLimit = remainingChars < 100;

  return (
    <Module
      title="Sticky Note"
      description="Use this space as a stick note !"
      icon={<StickyNote className="h-5 w-5 text-primary" />}
      isPinned={isPinned}
      onTogglePin={onTogglePin}
      isAuthenticated={isAuthenticated}
    >
      <div className="space-y-1">
        <div className="flex items-center justify-between gap-2">
          <Button
            onClick={handleCopy}
            variant="outline"
            size={"icon"}
            className="hover:bg-accent/50 flex-1 mb-2"
          >
            {copied ? (
              <div className="flex flex-row gap-2 text-primary">
                <Check className="h-3.5 w-3.5" />
                <p>Copied !</p>
              </div>
            ) : (
              <div className="flex flex-row gap-2">
                <Copy className="h-3.5 w-3.5" />
                <p>Copy</p>
              </div>
            )}
          </Button>
        </div>
        <Textarea
          value={note}
          onChange={handleChange}
          placeholder={
            isAuthenticated
              ? `Start typing... (up to ${USER_MAX_LENGTH.toLocaleString()} characters)`
              : `Start typing... (up to ${VISITOR_MAX_LENGTH.toLocaleString()} characters)`
          }
          className="font-sans text-sm min-h-32 max-h-64 overflow-y-auto [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-primary/50 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-primary"
        />
        <div className="flex items-center justify-between">
          <div
            className={`text-xs ${
              isNearLimit
                ? "text-destructive font-medium"
                : "text-muted-foreground"
            }`}
          >
            {note.length} / {maxLength}
          </div>
          {isAuthenticated && upsertMutation.isPending && (
            <div className="flex items-center gap-1 text-xs text-primary">
              <Loader2 className="h-3 w-3 animate-spin" />
              <span>Saving...</span>
            </div>
          )}
        </div>
      </div>
    </Module>
  );
}
