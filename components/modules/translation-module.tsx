"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/src/lib/trpc/client";
import {
  ArrowLeftRight,
  BookType,
  Eye,
  EyeOff,
  Languages,
  Settings,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Module } from "../dashboard/module";

interface TranslationModuleProps {
  isPinned?: boolean;
  onTogglePin?: () => void;
  isAuthenticated?: boolean;
  onAuthRequired?: () => void;
}

export function TranslationModule({
  isPinned,
  onTogglePin,
  isAuthenticated = true,
  onAuthRequired,
}: TranslationModuleProps) {
  const [showSettings, setShowSettings] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [textToTranslate, setTextToTranslate] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [sourceLang, setSourceLang] = useState<string>("auto");
  const [targetLang, setTargetLang] = useState<string>("");

  const { data: apiKeyData, refetch: refetchApiKey } =
    api.translator.getApiKey.useQuery(undefined, {
      enabled: isAuthenticated,
    });
  const { data: sourceLanguages } =
    api.translator.getSupportedSourceLanguages.useQuery(undefined, {
      enabled: isAuthenticated && !!apiKeyData?.hasApiKey,
    });
  const { data: targetLanguages } =
    api.translator.getSupportedTargetLanguages.useQuery(undefined, {
      enabled: isAuthenticated && !!apiKeyData?.hasApiKey,
    });
  const saveApiKeyMutation = api.translator.saveApiKey.useMutation();
  const translateMutation = api.translator.translate.useMutation();

  useEffect(() => {
    if (apiKeyData?.apiKey) {
      setApiKey(apiKeyData.apiKey);
    }
  }, [apiKeyData?.apiKey]); // Dépend seulement de la valeur string, pas de l'objet entier

  // Set default target language once languages are loaded
  useEffect(() => {
    if (targetLanguages && targetLanguages.length > 0 && !targetLang) {
      const defaultLang = targetLanguages.find(
        (lang: any) => lang.language === "EN-US" || lang.language === "en-US"
      );
      if (defaultLang) {
        setTargetLang(defaultLang.language);
      } else {
        // Fallback to first English variant or first language
        const englishLang = targetLanguages.find(
          (lang: any) =>
            lang.language.startsWith("EN") || lang.language.startsWith("en")
        );
        setTargetLang(englishLang?.language || targetLanguages[0].language);
      }
    }
  }, [targetLanguages, targetLang]);

  const handleSaveApiKey = async () => {
    if (!isAuthenticated) {
      onAuthRequired?.();
      return;
    }
    try {
      await saveApiKeyMutation.mutateAsync({ apiKey });
      await refetchApiKey();
      setShowSettings(false);
      alert("API key saved successfully!");
    } catch (error) {
      console.error("Error saving API key:", error);
      alert("Failed to save API key. Please try again.");
    }
  };

  const handleTranslate = async () => {
    if (!isAuthenticated) {
      onAuthRequired?.();
      return;
    }
    if (!textToTranslate.trim()) return;

    try {
      const result = await translateMutation.mutateAsync({
        textToTranslate,
        translateFrom: sourceLang === "auto" ? "" : sourceLang,
        translateTo: targetLang,
      });
      setTranslatedText(result.text);
    } catch (error) {
      console.error("Translation error:", error);
      alert("Failed to translate. Please try again.");
    }
  };

  const handleSwapLanguages = () => {
    // Swap languages
    const tempLang = sourceLang;
    setSourceLang(targetLang);
    setTargetLang(tempLang === "auto" ? "EN-US" : tempLang);

    // Swap texts
    setTextToTranslate(translatedText);
    setTranslatedText(textToTranslate);
  };

  return (
    <Module
      title="Translator"
      description="Translation powered by deepL"
      icon={<BookType className="h-5 w-5 text-primary" />}
      isPinned={isPinned}
      onTogglePin={onTogglePin}
      isAuthenticated={isAuthenticated}
    >
      <div className="space-y-4">
        {/* API Key Settings */}
        {!apiKeyData?.hasApiKey && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800  p-3">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              Please configure your Deepl API key to use this module.
            </p>
          </div>
        )}

        <div className="space-y-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSettings(!showSettings)}
            className="w-full"
          >
            <Settings className="h-4 w-4 mr-2" />
            {showSettings ? "Hide" : "Show"} API Key Settings
          </Button>

          {showSettings && (
            <div className="space-y-2 p-3 border bg-background/20">
              <Label htmlFor="apiKey">Deepl API Key</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    id="apiKey"
                    type={showApiKey ? "text" : "password"}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Enter your API key"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowApiKey(!showApiKey)}
                  >
                    {showApiKey ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <Button
                  onClick={handleSaveApiKey}
                  disabled={!apiKey || saveApiKeyMutation.isPending}
                >
                  {saveApiKeyMutation.isPending ? "Saving..." : "Save"}
                </Button>
              </div>
              <div className="text-xs text-muted-foreground flex flex-row gap-1">
                Get your API key from{" "}
                <a
                  href="https://www.deepl.com/fr/pro-api#api-pricing"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-foreground"
                >
                  Deepl.
                </a>{" "}
                <p className="text-primary">
                  Your first 500&apos;000 characters/month are free.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Translator Zone */}
        <div className="space-y-4">
          {/* Language Selection */}
          <div className="flex items-end gap-2">
            <div className="flex-1 space-y-2">
              <Label htmlFor="sourceLang">Source Language</Label>
              <Select value={sourceLang} onValueChange={setSourceLang}>
                <SelectTrigger id="sourceLang">
                  <SelectValue placeholder="Select source language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">Auto-detect</SelectItem>
                  {sourceLanguages?.map((lang: any) => (
                    <SelectItem key={lang.language} value={lang.language}>
                      {lang.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={handleSwapLanguages}
              disabled={sourceLang === "auto"}
              className="mb-0"
            >
              <ArrowLeftRight className="h-4 w-4" />
            </Button>

            <div className="flex-1 space-y-2">
              <Label htmlFor="targetLang">Target Language</Label>
              <Select value={targetLang} onValueChange={setTargetLang}>
                <SelectTrigger id="targetLang">
                  <SelectValue placeholder="Select target language" />
                </SelectTrigger>
                <SelectContent>
                  {targetLanguages?.map((lang: any) => (
                    <SelectItem key={lang.language} value={lang.language}>
                      {lang.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Input Text */}
          <div className="space-y-2">
            <Label htmlFor="inputText">Text to Translate</Label>
            <Textarea
              id="inputText"
              value={textToTranslate}
              onChange={(e) => setTextToTranslate(e.target.value)}
              placeholder="Enter text to translate..."
              rows={4}
            />
          </div>

          {/* Translate Button */}
          <Button
            onClick={handleTranslate}
            disabled={!textToTranslate.trim() || translateMutation.isPending}
            className="w-full"
          >
            <Languages className="h-4 w-4 mr-2" />
            {translateMutation.isPending ? "Translating..." : "Translate"}
          </Button>

          {/* Output Text */}
          {translatedText && (
            <div className="space-y-2">
              <Label>Translation</Label>
              <Textarea
                value={translatedText}
                readOnly
                rows={4}
                className="font-mono text-sm bg-muted"
              />
            </div>
          )}
        </div>
      </div>
    </Module>
  );
}
