export type FigurineConfig = {
  subjects: string[];
  personCount: number;
  animalCount: number;
  customText: string;
  customCommitted: boolean;
  size: string | null;
  finish: string | null;
  base: string | null;
  pack: string | null;
  photoCount: number;
  color: "white" | "beige" | "other";
  colorText: string;
  colorCommitted: boolean;
  graverText: string;
  graverCommitted: boolean;
};

export const CONFIG_STORAGE_KEY = "prezent3d-figurine-config";

export function saveFigurineConfig(config: FigurineConfig) {
  window.sessionStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(config));
}

export function readFigurineConfig(): FigurineConfig | null {
  const stored = window.sessionStorage.getItem(CONFIG_STORAGE_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored) as FigurineConfig;
  } catch {
    return null;
  }
}
