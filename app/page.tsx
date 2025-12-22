import { Base64Module } from "@/components/modules/base64-module";
import { LoremIpsumModule } from "@/components/modules/lorem-ipsum-module";
import { UuidModule } from "@/components/modules/uuid-module";
import { WebpConverterModule } from "@/components/modules/webpConverter";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BookType, Eraser, Images, Sparkles } from "lucide-react";
import { JetBrains_Mono } from "next/font/google";
import Link from "next/link";

const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"] });

export default function Page() {
  const tools = [
    {
      title: "WebP Converter",
      description:
        "Convert PNG/JPG images to WebP format with customizable quality",
      icon: <Images className="h-8 w-8 text-primary" />,
      available: true,
      requiresApiKey: false,
    },
    {
      title: "Background Remover",
      description: "Remove image backgrounds with AI-powered precision",
      icon: <Eraser className="h-8 w-8 text-primary" />,
      available: true,
      requiresApiKey: true,
    },
    {
      title: "Translator",
      description: "Translate text with DeepL's powerful AI engine",
      icon: <BookType className="h-8 w-8 text-primary" />,
      available: true,
      requiresApiKey: true,
    },
    {
      title: "More tools coming soon...",
      description: "We're constantly adding new developer tools",
      icon: <Sparkles className="h-8 w-8 text-primary" />,
      available: false,
      requiresApiKey: false,
    },
  ];

  return (
    <div className="container mx-auto px-4 py-16">
      {/* Hero Section */}
      <div className="text-center mb-16 space-y-4">
        <div className="inline-block mb-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary rounded-full">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">
              Developer Tools Suite
            </span>
          </div>
        </div>
        <h1
          className={`${jetbrainsMono.className} text-4xl md:text-6xl
   font-bold tracking-tight`}
        >
          AdaTools
        </h1>
        <div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            A collection of practical tools for developers
          </p>
          <p className="text-xl text-primary font-semibold max-w-2xl mx-auto">
            just one click away 💫
          </p>
        </div>
        <div className="flex gap-4 justify-center pt-4">
          <Button asChild size="lg">
            <Link href="/signin">Get Started</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="#demo">Discover Tools</Link>
          </Button>
        </div>
      </div>

      {/* Features Grid */}
      <div
        id="features"
        className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-16"
      >
        {tools.map((tool) => (
          <Card
            key={tool.title}
            className={`${
              !tool.available ? "opacity-60" : ""
            } hover:border-primary/50 transition-colors`}
          >
            <CardHeader>
              <div className="flex items-start gap-4">
                <div className="mt-1">{tool.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <CardTitle className="text-lg">{tool.title}</CardTitle>
                    {tool.requiresApiKey && tool.available && (
                      <span className="text-xs px-2 py-0.5 bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border border-yellow-500/20 rounded">
                        API Key
                      </span>
                    )}
                    {!tool.available && (
                      <span className="text-xs px-2 py-0.5 bg-muted text-muted-foreground border rounded">
                        Soon
                      </span>
                    )}
                  </div>
                  <CardDescription>{tool.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>

      {/* Features Highlight */}
      <div className="max-w-4xl mx-auto mb-16">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2">Why AdaTools?</h2>
          <p className="text-muted-foreground">
            Built for developers who value simplicity and efficiency
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Fast & Secure</CardTitle>
              <CardDescription>
                All processing happens securely with encrypted API keys
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">No Installation</CardTitle>
              <CardDescription>
                Access all tools directly from your browser
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Customizable</CardTitle>
              <CardDescription>
                Pin your favorite tools for quick access
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>

      {/* webp converter demo */}
      <div id="demo" className="max-w-4xl mx-auto mb-16">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2">Try it out !</h2>
          <p className="text-muted-foreground">
            These are some examples of what you can find in your workspace
          </p>
        </div>
        <div className="columns-1 md:columns-2 gap-2 md:gap-6 space-y-2 md:space-y-6">
          <WebpConverterModule />
          <Base64Module />
          <UuidModule />
          <LoremIpsumModule />
        </div>
      </div>

      {/* CTA Section */}
      <div className="text-center py-12 border-t">
        <h2 className="text-2xl font-bold mb-4">
          Ready to boost your workflow?
        </h2>
        <p className="text-muted-foreground mb-6">
          Create a free account and access all available tools
        </p>
        <Button asChild size="lg">
          <Link href="/signup">Create Account</Link>
        </Button>
      </div>

      {/* OpenSource Section */}
      <div className="text-center py-12 border-t items-center flex flex-col">
        <h2 className="text-2xl font-bold mb-4">
          Want to add your own modules?
        </h2>
        <p className="text-muted-foreground mb-2 text-pretty max-w-2xl  flex  justify-center">
          AdaTools will soon become OpenSource so we can build together the most
          useful and customizable tool for devs!
          <br /> If you want to be notified when the project is open, send me an
          email :
        </p>
        <p className="text-primary mb-6 text-pretty max-w-2xl  flex  justify-center">
          sl.code.777@gmail.com
        </p>
      </div>
    </div>
  );
}
