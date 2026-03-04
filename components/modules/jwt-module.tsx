"use client";

import { Copy, MessageSquareLock } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Module } from "../dashboard/module";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { toast } from "sonner";

interface JWTModuleProps {
  isPinned?: boolean;
  onTogglePin?: () => void;
  isAuthenticated?: boolean;
}

type OutputField = "header" | "payload" | "signature";
type CopyField = "jwt" | OutputField;

interface ResultSectionProps {
  title: string;
  value: string;
  rows: number;
  textareaClassName?: string;
  isCopied: boolean;
  onCopy: () => void;
  onChange: (value: string) => void;
}

function ResultSection({
  title,
  value,
  rows,
  textareaClassName,
  isCopied,
  onCopy,
  onChange,
}: ResultSectionProps) {
  return (
    <details className="relative rounded-md border" open>
      <summary className="cursor-pointer px-3 py-2 pr-24 text-sm font-medium">{title}</summary>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="absolute right-2 top-1"
        aria-label={`Copy ${title}`}
        disabled={!value}
        onClick={onCopy}
      >
        <Copy className="mr-2 h-4 w-4" />
        {isCopied ? "Copied!" : "Copy"}
      </Button>
      <div className="px-3 pb-3">
        <Textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          rows={rows}
          spellCheck={false}
          className={textareaClassName}
        />
      </div>
    </details>
  );
}

export function JWTModule({
  isPinned,
  onTogglePin,
  isAuthenticated = true,
}: JWTModuleProps) {
  const [input, setInput] = useState("");
  const [resultError, setResultError] = useState("");
  const [copiedField, setCopiedField] = useState<CopyField | null>(null);
  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [output, setOutput] = useState<{ header: string; payload: string; signature: string }>({
    header: "",
    payload: "",
    signature: "",
  });

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }
    };
  }, []);

  const encodeBase64Url = (value: string) => {
    const bytes = new TextEncoder().encode(value);
    let binary = "";

    for (const byte of bytes) {
      binary += String.fromCharCode(byte);
    }

    return btoa(binary)
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/g, "");
  };

  const decodeBase64Url = (value: string) => {
    const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
    const binary = atob(padded);
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  };

  const decodePart = (part: string) => {
    const decoded = decodeBase64Url(part);
    return JSON.stringify(JSON.parse(decoded), null, 2);
  };

  const updateEncodedInput = (nextOutput: { header: string; payload: string; signature: string }) => {
    const isSignatureValid =
      nextOutput.signature === "" || /^[A-Za-z0-9_-]+$/.test(nextOutput.signature);

    if (!isSignatureValid) {
      setResultError("Invalid signature: only base64url characters are allowed (A-Z, a-z, 0-9, -, _)");
      return false;
    }

    try {
      const headerSource = nextOutput.header.trim() === "" ? "{}" : nextOutput.header;
      const payloadSource = nextOutput.payload.trim() === "" ? "{}" : nextOutput.payload;
      const parsedHeader = JSON.parse(headerSource);
      const parsedPayload = JSON.parse(payloadSource);
      const encodedHeader = encodeBase64Url(JSON.stringify(parsedHeader));
      const encodedPayload = encodeBase64Url(JSON.stringify(parsedPayload));
      setInput(`${encodedHeader}.${encodedPayload}.${nextOutput.signature}`);
      setResultError("");
      return true;
    } catch {
      setResultError("Header/Payload must be valid JSON to encode the JWT");
      return false;
    }
  };

  const handleOutputChange = (field: OutputField, value: string) => {
    const nextOutput = {
      ...output,
      [field]: value,
    };

    setOutput(nextOutput);
    updateEncodedInput(nextOutput);
  };

  function inputConvert(value: string): void {
    const trimmedValue = value.trim();
    setInput(value);

    if (!trimmedValue) {
      setResultError("");
      setOutput({ header: "", payload: "", signature: "" });
      return;
    }

    const parts = trimmedValue.split(".");

    if (parts.length < 3 || parts.some((part) => part === "")) {
      setResultError("");
      setOutput({ header: "", payload: "", signature: "" });
      return;
    }

    if (parts.length > 3) {
      setResultError("Invalid JWT: expected format header.payload.signature");
      setOutput({ header: "", payload: "", signature: "" });
      return;
    }

    const hasOnlyBase64UrlParts = parts.every((part) => /^[A-Za-z0-9_-]+$/.test(part));
    if (!hasOnlyBase64UrlParts) {
      setResultError("Invalid JWT: only base64url characters are allowed");
      setOutput({ header: "", payload: "", signature: "" });
      return;
    }

    try {
      setResultError("");
      setOutput({
        header: decodePart(parts[0]),
        payload: decodePart(parts[1]),
        signature: parts[2],
      });
    } catch {
      setResultError("Invalid JWT: unreadable header/payload");
      setOutput({ header: "", payload: "", signature: "" });
    }
  };

  function handleCopy(
    value: string,
    label: string,
    field: CopyField
  ): void {
    navigator.clipboard
      .writeText(value)
      .then(() => {
        setResultError("");
        setCopiedField(field);

        if (copyTimeoutRef.current) {
          clearTimeout(copyTimeoutRef.current);
        }

        copyTimeoutRef.current = setTimeout(() => {
          setCopiedField((currentField) => (currentField === field ? null : currentField));
          copyTimeoutRef.current = null;
        }, 2000);

        toast.success(`${label} copied to clipboard`);
      })
      .catch(() => {
        setResultError("Failed to copy to clipboard");
        toast.error("Failed to copy to clipboard");
      });
  }

  return (
    <Module
      title="JWT"
      description="Encode or decode JSON Web Tokens"
      icon={<MessageSquareLock className="h-5 w-5 text-primary" />}
      isPinned={isPinned}
      onTogglePin={onTogglePin}
      isAuthenticated={isAuthenticated}
    >
      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">

          <label className="text-sm font-medium block">
            JWT
          </label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            aria-label="Copy JWT"
            disabled={!input}
            onClick={() => handleCopy(input, "JWT", "jwt")}
          >
              <Copy className="h-4 w-4 mr-2" />
              {copiedField === "jwt" ? "Copied!" : "Copy"}
            </Button>
          </div>
          <Textarea
            value={input}
            onChange={(e) => inputConvert(e.target.value)}
            placeholder={"Enter JWT..."}
            rows={3}
            spellCheck={false}
            className="font-mono text-xs md:text-xs"
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Result</label>
          {resultError ? (
            <p className="mb-2 text-sm text-destructive" role="status" aria-live="polite">
              {resultError}
            </p>
          ) : null}

          <div className="space-y-2">
            <ResultSection
              title="Header"
              value={output.header}
              rows={5}
              textareaClassName="font-mono text-sm text-green-600 dark:text-green-400"
              isCopied={copiedField === "header"}
              onCopy={() => handleCopy(output.header, "Header", "header")}
              onChange={(value) => handleOutputChange("header", value)}
            />

            <ResultSection
              title="Payload"
              value={output.payload}
              rows={8}
              textareaClassName="font-mono text-sm"
              isCopied={copiedField === "payload"}
              onCopy={() => handleCopy(output.payload, "Payload", "payload")}
              onChange={(value) => handleOutputChange("payload", value)}
            />

            <ResultSection
              title="Signature"
              value={output.signature}
              rows={3}
              textareaClassName="font-mono text-sm text-blue-600 dark:text-blue-400"
              isCopied={copiedField === "signature"}
              onCopy={() => handleCopy(output.signature, "Signature", "signature")}
              onChange={(value) => handleOutputChange("signature", value)}
            />
          </div>
        </div>
        
      </div>
    </Module>
  );
}
