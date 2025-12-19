import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";

export default function Page() {
  const tools = [
    {
      title: "Snippet Manager",
      description: "Organize and reuse your favorite code snippets",
      icon: "📝",
    },
    {
      title: "Color Palettes",
      description: "Create and manage your color palettes",
      icon: "🎨",
    },
    {
      title: "Image Converter",
      description: "Convert your PNG/JPG images to WebP",
      icon: "🖼️",
    },
    {
      title: "Lorem Ipsum Generator",
      description: "Generate placeholder text quickly",
      icon: "📄",
    },
    {
      title: "UUID Generator",
      description: "Create unique identifiers",
      icon: "🔑",
    },
    {
      title: "JSON Formatter",
      description: "Format and validate your JSON data",
      icon: "⚙️",
    },
  ];

  return (
    <div className="container mx-auto px-4 py-16">
      {/* Hero Section */}
      <div className="text-center mb-16 space-y-4">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
          AdaTools
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Une collection d'outils pratiques pour développeurs, accessible en un
          clic
        </p>
        <div className="flex gap-4 justify-center pt-4">
          <Button asChild size="lg">
            <Link href="/signin">Commencer</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="#features">Découvrir</Link>
          </Button>
        </div>
      </div>

      {/* Features Grid */}
      <div
        id="features"
        className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto"
      >
        {tools.map((tool) => (
          <Card key={tool.title}>
            <CardHeader>
              <div className="text-4xl mb-2">{tool.icon}</div>
              <CardTitle>{tool.title}</CardTitle>
              <CardDescription>{tool.description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>

      {/* CTA Section */}
      <div className="text-center mt-16 py-12 border-t">
        <h2 className="text-2xl font-bold mb-4">
          Prêt à améliorer votre workflow ?
        </h2>
        <p className="text-muted-foreground mb-6">
          Créez un compte gratuit et accédez à tous les outils
        </p>
        <Button asChild size="lg">
          <Link href="/signup">Créer un compte</Link>
        </Button>
      </div>
    </div>
  );
}
