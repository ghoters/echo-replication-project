import type { Database } from "@/integrations/supabase/types";

export const ORDER_STAGES = ["Opłacone", "Projektowanie", "Wizualizacja", "Produkcja", "Gotowe", "Wysłane"] as const;
export const ORDER_STATUSES = [...ORDER_STAGES, "Poprawki", "Anulowane"] as const;

export type Order = Database["public"]["Tables"]["orders"]["Row"];
export type OrderEvent = Database["public"]["Tables"]["order_events"]["Row"];
export type OrderFile = Database["public"]["Tables"]["order_files"]["Row"];
export type Visualization = Database["public"]["Tables"]["order_visualizations"]["Row"];
export type VisualizationImage = Database["public"]["Tables"]["visualization_images"]["Row"];
export type RevisionRequest = Database["public"]["Tables"]["revision_requests"]["Row"];

export const statusIndex = (status: string) => status === "Poprawki" ? 2 : ORDER_STAGES.indexOf(status as typeof ORDER_STAGES[number]);
export const needsAction = (status: string) => status === "Wizualizacja";
export const isFinished = (status: string) => status === "Wysłane" || status === "Anulowane";
export const money = (amount: number) => `${Number(amount).toFixed(2).replace(".", ",")} zł`;
export const dateLabel = (value: string) => new Date(value).toLocaleDateString("pl-PL", { day: "2-digit", month: "2-digit", year: "numeric" });
export const safeFileName = (name: string) => name.replace(/[^a-zA-Z0-9._-]/g, "-");