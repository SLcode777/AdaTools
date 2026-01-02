import { Base64Module } from "@/components/modules/base64-module";
import { ColorConverterModule } from "@/components/modules/color-converter-module";
import { ColorPaletteModule } from "@/components/modules/color-palette-module";
import { DomainNamesModule } from "@/components/modules/domain-names-module";
import { ImageResizeModule } from "@/components/modules/image-resize-module";
import { LoremIpsumModule } from "@/components/modules/lorem-ipsum-module";
import { PomodoroTimerModule } from "@/components/modules/pomodoro-timer-module";
import { RemoveBgModule } from "@/components/modules/removeBg-module";
import { SnippetManagerModule } from "@/components/modules/snippet-manager-module";
import { StickyNoteModule } from "@/components/modules/stickynote-module";
import { TextStatsModule } from "@/components/modules/text-stats-module";
import { TranslationModule } from "@/components/modules/translation-module";
import { UuidModule } from "@/components/modules/uuid-module";
import { WebpConverterModule } from "@/components/modules/webpConverter";
import { YouTubeEmbedModule } from "@/components/modules/youtube-embed-module";
import {
  BarChart3,
  BookType,
  Clock,
  Code2,
  FileText,
  Globe,
  ImageIcon,
  Images,
  KeyRound,
  Palette,
  Settings,
  StickyNote,
  SwatchBook,
  Video,
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
    isAuthenticated?: boolean;
    onAuthRequired?: () => void;
  }) => JSX.Element;
  category: string;
  requiresAuth: boolean;
}

export const AVAILABLE_MODULES: ModuleConfig[] = [
  {
    id: "lorem-ipsum",
    name: "Lorem Ipsum",
    description: "Placeholder text generator",
    icon: <FileText className="h-5 w-5" />,
    component: LoremIpsumModule,
    category: "Generators",
    requiresAuth: false,
  },
  {
    id: "uuid",
    name: "UUID",
    description: "Unique identifier generator",
    icon: <KeyRound className="h-5 w-5" />,
    component: UuidModule,
    category: "Generators",
    requiresAuth: false,
  },
  {
    id: "base64",
    name: "Base64",
    description: "Base64 encoder/decoder",
    icon: <Settings className="h-5 w-5" />,
    component: Base64Module,
    category: "Encoding",
    requiresAuth: false,
  },
  {
    id: "removebg",
    name: "Remove Background",
    description: "Remove background from a file image",
    icon: <Wallpaper className="h-5 w-5" />,
    component: RemoveBgModule,
    category: "Image processing",
    requiresAuth: true,
  },
  {
    id: "webpConverter",
    name: "Webp Converter",
    description: "Convert a jpg/png image to webp format",
    icon: <Images className="h-5 w-5" />,
    component: WebpConverterModule,
    category: "Image processing",
    requiresAuth: false,
  },
  {
    id: "image-resize",
    name: "Image Resize",
    description: "Resize images with presets and custom dimensions",
    icon: <ImageIcon className="h-5 w-5" />,
    component: ImageResizeModule,
    category: "Image processing",
    requiresAuth: false,
  },
  {
    id: "translation",
    name: "Translator",
    description: "Translation powered by deepL",
    icon: <BookType className="h-5 w-5" />,
    component: TranslationModule,
    category: "Translation",
    requiresAuth: true,
  },
  {
    id: "color-palette",
    name: "Color Palettes",
    description: "Handle your color palettes",
    icon: <SwatchBook className="h-5 w-5" />,
    component: ColorPaletteModule,
    category: "Design Tools",
    requiresAuth: true,
  },
  {
    id: "color-converter",
    name: "Color Converter",
    description: "Convert between color formats (HEX, RGB, HSL, etc.)",
    icon: <Palette className="h-5 w-5" />,
    component: ColorConverterModule,
    category: "Design Tools",
    requiresAuth: false,
  },
  {
    id: "domain-names-reminder",
    name: "Domain Names Reminder",
    description: "List your domain names and receive reminders",
    icon: <Globe className="h-5 w-5" />,
    component: DomainNamesModule,
    category: "Management",
    requiresAuth: true,
  },
  {
    id: "snippet-manager",
    name: "Snippet Manager",
    description: "Store and manage your code snippets",
    icon: <Code2 className="h-5 w-5" />,
    component: SnippetManagerModule,
    category: "Development",
    requiresAuth: true,
  },
  {
    id: "youtube-embed",
    name: "YouTube Embed",
    description: "Easily launch your favorite focus videos",
    icon: <Video className="h-5 w-5" />,
    component: YouTubeEmbedModule,
    category: "Productivity",
    requiresAuth: true,
  },
  {
    id: "pomodoro-timer",
    name: "Pomodoro Timer",
    description: "Stay focused with the Pomodoro Technique",
    icon: <Clock className="h-5 w-5" />,
    component: PomodoroTimerModule,
    category: "Productivity",
    requiresAuth: false,
  },
  {
    id: "stick-note",
    name: "Sticky Note",
    description: "Use this space as a stick note !",
    icon: <StickyNote className="h-5 w-5" />,
    component: StickyNoteModule,
    category: "Productivity",
    requiresAuth: false,
  },
  {
    id: "text-stats",
    name: "Text Statistics",
    description: "Real-time text analysis and statistics",
    icon: <BarChart3 className="h-5 w-5" />,
    component: TextStatsModule,
    category: "Productivity",
    requiresAuth: false,
  },
];

export function getModuleById(id: string): ModuleConfig | undefined {
  return AVAILABLE_MODULES.find((m) => m.id === id);
}
