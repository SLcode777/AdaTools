"use client";

import { Copy, TextInitial } from "lucide-react";
import { useState } from "react";
import { Module } from "../dashboard/module";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

const LOREM_WORDS = [
  "lorem",
  "ipsum",
  "dolor",
  "sit",
  "amet",
  "consectetur",
  "adipiscing",
  "elit",
  "sed",
  "do",
  "eiusmod",
  "tempor",
  "incididunt",
  "ut",
  "labore",
  "et",
  "dolore",
  "magna",
  "aliqua",
  "enim",
  "ad",
  "minim",
  "veniam",
  "quis",
  "nostrud",
  "exercitation",
  "ullamco",
  "laboris",
  "nisi",
  "aliquip",
  "ex",
  "ea",
  "commodo",
  "consequat",
  "duis",
  "aute",
  "irure",
  "in",
  "reprehenderit",
  "voluptate",
  "velit",
  "esse",
  "cillum",
  "fugiat",
  "nulla",
  "pariatur",
  "excepteur",
  "sint",
  "occaecat",
  "cupidatat",
  "non",
  "proident",
  "sunt",
  "culpa",
  "qui",
  "officia",
  "deserunt",
  "mollit",
  "anim",
  "id",
  "est",
  "laborum",
];

interface LoremIpsumModuleProps {
  isPinned?: boolean;
  onTogglePin?: () => void;
}

type GenerationType = "words" | "characters";

export function LoremIpsumModule({
  isPinned,
  onTogglePin,
}: LoremIpsumModuleProps) {
  const [copied, setCopied] = useState(false);
  const [amount, setAmount] = useState(50);
  const [type, setType] = useState<GenerationType>("words");
  const [paragraphs, setParagraphs] = useState(3);
  const [generatedText, setGeneratedText] = useState("");

  const generateLoremIpsum = () => {
    const paragraphsArray: string[] = [];

    if (type === "words") {
      // Distribute total words across paragraphs
      const wordsPerParagraph = Math.floor(amount / paragraphs);
      const remainingWords = amount % paragraphs;

      let wordIndex = 0;

      for (let p = 0; p < paragraphs; p++) {
        const wordsInThisParagraph =
          wordsPerParagraph + (p < remainingWords ? 1 : 0);
        const wordsArray: string[] = [];

        for (let i = 0; i < wordsInThisParagraph; i++) {
          wordsArray.push(LOREM_WORDS[wordIndex % LOREM_WORDS.length]);
          wordIndex++;
        }

        let paragraph = wordsArray.join(" ");
        // Capitalize first letter
        paragraph = paragraph.charAt(0).toUpperCase() + paragraph.slice(1);
        // Add period at the end
        paragraph += ".";

        paragraphsArray.push(paragraph);
      }
    } else {
      // Distribute total characters across paragraphs
      const charsPerParagraph = Math.floor(amount / paragraphs);
      const remainingChars = amount % paragraphs;

      let wordIndex = 0;

      for (let p = 0; p < paragraphs; p++) {
        const charsInThisParagraph =
          charsPerParagraph + (p < remainingChars ? 1 : 0);
        const wordsArray: string[] = [];
        let currentChars = 0;

        while (currentChars < charsInThisParagraph) {
          const word = LOREM_WORDS[wordIndex % LOREM_WORDS.length];
          wordsArray.push(word);
          currentChars += word.length + 1; // +1 for space
          wordIndex++;
        }

        let paragraph = wordsArray.join(" ").substring(0, charsInThisParagraph);
        // Capitalize first letter
        paragraph = paragraph.charAt(0).toUpperCase() + paragraph.slice(1);
        // Add period at the end if not already present
        if (!paragraph.endsWith(".")) {
          paragraph += ".";
        }

        paragraphsArray.push(paragraph);
      }
    }

    return paragraphsArray.join("\n\n");
  };

  const handleGenerate = () => {
    const text = generateLoremIpsum();
    setGeneratedText(text);
  };

  const handleCopy = async () => {
    const textToCopy = generatedText || generateLoremIpsum();
    await navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Module
      title="Lorem Ipsum"
      description="Placeholder text generator"
      icon={<TextInitial className="h-5 w-5 text-primary" />}
      isPinned={isPinned}
      onTogglePin={onTogglePin}
    >
      <div className="space-y-4">
        {/* Type selector */}
        <div className="space-y-2">
          <Label className="text-xs">Type</Label>
          <div className="flex gap-2">
            <Button
              variant={type === "words" ? "muted" : "outline"}
              size="sm"
              onClick={() => setType("words")}
              className="flex-1"
            >
              Words
            </Button>
            <Button
              variant={type === "characters" ? "muted" : "outline"}
              size="sm"
              onClick={() => setType("characters")}
              className="flex-1"
            >
              Characters
            </Button>
          </div>
        </div>

        {/* Amount input */}
        <div className="space-y-2">
          <Label htmlFor="amount" className="text-xs">
            {type === "words" ? "Number of words" : "Number of characters"}
          </Label>
          <Input
            id="amount"
            type="number"
            min="1"
            max={type === "words" ? "500" : "5000"}
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value) || 1)}
            onFocus={(e) => e.target.select()}
            autoFocus
          />
        </div>

        {/* Paragraphs input */}
        <div className="space-y-2">
          <Label htmlFor="paragraphs" className="text-xs">
            Number of paragraphs
          </Label>
          <Input
            id="paragraphs"
            type="number"
            min="1"
            max="10"
            value={paragraphs}
            onChange={(e) => setParagraphs(Number(e.target.value) || 1)}
            onFocus={(e) => e.target.select()}
          />
        </div>

        {/* Generate button */}
        <Button onClick={handleGenerate} className="w-full">
          Generate
        </Button>

        {/* Generated text display */}
        {generatedText && (
          <div className="space-y-2">
            <div className="p-3 bg-muted rounded-md max-h-40 overflow-y-auto">
              <p className="text-xs text-muted-foreground whitespace-pre-wrap">
                {generatedText}
              </p>
            </div>
            <Button onClick={handleCopy} className="w-full" variant="outline">
              <Copy className="h-4 w-4 mr-2" />
              {copied ? "Copied!" : "Copy"}
            </Button>
          </div>
        )}
      </div>
    </Module>
  );
}
