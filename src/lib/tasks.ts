import type { Tables, TablesInsert } from "@/integrations/supabase/types";

export type Task = Tables<"tasks">;
export type TaskInsert = TablesInsert<"tasks">;
export type Priority = Task["priority"];

export interface DeadlineMeta {
  label: string;
  tone: "ok" | "soon" | "urgent" | "late";
  days: number;
}

export function deadlineMeta(deadlineISO: string, completed = false): DeadlineMeta {
  const now = new Date();
  const d = new Date(deadlineISO);
  const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startDeadline = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const days = Math.round((startDeadline.getTime() - startToday.getTime()) / 86400000);

  if (completed) return { label: "Selesai", tone: "ok", days };
  if (days < 0) return { label: "Terlambat", tone: "late", days };
  if (days === 0) return { label: "Hari ini", tone: "urgent", days };
  if (days === 1) return { label: "Besok", tone: "urgent", days };
  if (days <= 3) return { label: `${days} hari lagi`, tone: "soon", days };
  return { label: `${days} hari lagi`, tone: "ok", days };
}

export const priorityLabel: Record<Priority, string> = {
  rendah: "Rendah",
  sedang: "Sedang",
  tinggi: "Tinggi",
};

export const priorityClass: Record<Priority, string> = {
  rendah: "bg-pastel-mint text-pastel-mint-foreground",
  sedang: "bg-pastel-blue text-pastel-blue-foreground",
  tinggi: "bg-pastel-red text-pastel-red-foreground",
};
