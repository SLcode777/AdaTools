import { Base64Module } from "@/components/modules/base64-module";
import { LoremIpsumModule } from "@/components/modules/lorem-ipsum-module";
import { UuidModule } from "@/components/modules/uuid-module";

export interface ModuleConfig {
  id: string;
  name: string;
  description: string;
  icon: string;
  component: () => JSX.Element;
  category: string;
}

export const AVAILABLE_MODULES: ModuleConfig[] = [
  {
    id: "lorem-ipsum",
    name: "Lorem Ipsum",
    description: "Placeholder text generator",
    icon: "📄",
    component: LoremIpsumModule,
    category: "Generators",
  },
  {
    id: "uuid",
    name: "UUID",
    description: "Unique identifier generator",
    icon: "🔑",
    component: UuidModule,
    category: "Generators",
  },
  {
    id: "base64",
    name: "Base64",
    description: "Base64 encoder/decoder",
    icon: "⚙️",
    component: Base64Module,
    category: "Encoding",
  },
];

export function getModuleById(id: string): ModuleConfig | undefined {
  return AVAILABLE_MODULES.find((m) => m.id === id);
}
