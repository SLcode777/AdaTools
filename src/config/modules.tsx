import { Base64Module } from "@/components/modules/base64-module";
import { ColorPaletteModule } from "@/components/modules/color-palette-module";
import { DomainNamesModule } from "@/components/modules/domain-names-module";
import { LoremIpsumModule } from "@/components/modules/lorem-ipsum-module";
import { RemoveBgModule } from "@/components/modules/removeBg-module";
import { TranslationModule } from "@/components/modules/translation-module";
import { UuidModule } from "@/components/modules/uuid-module";
import { WebpConverterModule } from "@/components/modules/webpConverter";
import {
  BookType,
  FileText,
  Globe,
  Images,
  KeyRound,
  Settings,
  SwatchBook,
  Wallpaper,
} from "lucide-react";
import { JSX, ReactNode } from "react";

export interface ModuleConfig {
  id: string;
  name: string;
  description: string;
  icon: ReactNode;
  component: (props: {
    isPinned?: boolean;
    onTogglePin?: () => void;
  }) => JSX.Element;
  category: string;
}

export const AVAILABLE_MODULES: ModuleConfig[] = [
  {
    id: "lorem-ipsum",
    name: "Lorem Ipsum",
    description: "Placeholder text generator",
    icon: <FileText className="h-5 w-5" />,
    component: LoremIpsumModule,
    category: "Generators",
  },
  {
    id: "uuid",
    name: "UUID",
    description: "Unique identifier generator",
    icon: <KeyRound className="h-5 w-5" />,
    component: UuidModule,
    category: "Generators",
  },
  {
    id: "base64",
    name: "Base64",
    description: "Base64 encoder/decoder",
    icon: <Settings className="h-5 w-5" />,
    component: Base64Module,
    category: "Encoding",
  },
  {
    id: "removebg",
    name: "Remove Background",
    description: "Remove background from a file image",
    icon: <Wallpaper className="h-5 w-5" />,
    component: RemoveBgModule,
    category: "Image processing",
  },
  {
    id: "webpConverter",
    name: "Webp Converter",
    description: "Convert a jpg/png image to webp format",
    icon: <Images className="h-5 w-5" />,
    component: WebpConverterModule,
    category: "Image processing",
  },
  {
    id: "translation",
    name: "Translator",
    description: "Translation powered by deepL",
    icon: <BookType className="h-5 w-5" />,
    component: TranslationModule,
    category: "Translation",
  },
  {
    id: "color-palette",
    name: "Color Palettes",
    description: "Handle your color palettes",
    icon: <SwatchBook className="h-5 w-5" />,
    component: ColorPaletteModule,
    category: "Design Tools",
  },
  {
    id: "domain-names-reminder",
    name: "Domain Names Reminder",
    description: "List your domain names and receive reminders",
    icon: <Globe className="h-5 w-5" />,
    component: DomainNamesModule,
    category: "Management",
  },
];

export function getModuleById(id: string): ModuleConfig | undefined {
  return AVAILABLE_MODULES.find((m) => m.id === id);
}
