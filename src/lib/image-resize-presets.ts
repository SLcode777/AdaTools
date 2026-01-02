export interface ImagePreset {
  id: string;
  name: string;
  width: number;
  height: number;
  category: PresetCategory;
}

export type PresetCategory = "social" | "common" | "custom";

const STORAGE_KEY = "image-resize-custom-presets";

export const SOCIAL_MEDIA_PRESETS: ImagePreset[] = [
  {
    id: "instagram-post",
    name: "Instagram Post",
    width: 1080,
    height: 1080,
    category: "social",
  },
  {
    id: "instagram-story",
    name: "Instagram Story",
    width: 1080,
    height: 1920,
    category: "social",
  },
  {
    id: "facebook-post",
    name: "Facebook Post",
    width: 1200,
    height: 630,
    category: "social",
  },
  {
    id: "twitter-post",
    name: "Twitter/X Post",
    width: 1600,
    height: 900,
    category: "social",
  },
  {
    id: "linkedin-post",
    name: "LinkedIn Post",
    width: 1200,
    height: 627,
    category: "social",
  },
  {
    id: "youtube-thumbnail",
    name: "YouTube Thumbnail",
    width: 1280,
    height: 720,
    category: "social",
  },
];

export const COMMON_PRESETS: ImagePreset[] = [
  {
    id: "thumbnail-small",
    name: "Thumbnail Small",
    width: 150,
    height: 150,
    category: "common",
  },
  {
    id: "thumbnail-medium",
    name: "Thumbnail Medium",
    width: 300,
    height: 300,
    category: "common",
  },
  {
    id: "hd",
    name: "HD",
    width: 1280,
    height: 720,
    category: "common",
  },
  {
    id: "full-hd",
    name: "Full HD",
    width: 1920,
    height: 1080,
    category: "common",
  },
  {
    id: "4k",
    name: "4K",
    width: 3840,
    height: 2160,
    category: "common",
  },
  {
    id: "icon",
    name: "Icon",
    width: 64,
    height: 64,
    category: "common",
  },
  {
    id: "favicon",
    name: "Favicon",
    width: 32,
    height: 32,
    category: "common",
  },
];

export const ALL_PRESETS: ImagePreset[] = [
  ...SOCIAL_MEDIA_PRESETS,
  ...COMMON_PRESETS,
];

export function saveCustomPreset(
  preset: Omit<ImagePreset, "id" | "category">,
): ImagePreset {
  const newPreset: ImagePreset = {
    ...preset,
    id: `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    category: "custom",
  };

  const existingPresets = loadCustomPresets();
  const updatedPresets = [...existingPresets, newPreset];

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedPresets));
  } catch (error) {
    console.error("Failed to save custom preset:", error);
  }

  return newPreset;
}

export function loadCustomPresets(): ImagePreset[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return [];
    }
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Failed to load custom presets:", error);
    return [];
  }
}

export function deleteCustomPreset(presetId: string): void {
  const existingPresets = loadCustomPresets();
  const updatedPresets = existingPresets.filter(
    (preset) => preset.id !== presetId,
  );

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedPresets));
  } catch (error) {
    console.error("Failed to delete custom preset:", error);
  }
}

export function getPresetById(presetId: string): ImagePreset | undefined {
  const allPresets = [...ALL_PRESETS, ...loadCustomPresets()];
  return allPresets.find((preset) => preset.id === presetId);
}
