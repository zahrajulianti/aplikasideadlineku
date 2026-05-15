import { Check, Pencil, Trash2, Calendar, BookOpen } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  deadlineMeta,
  priorityClass,
  priorityLabel,
  type Task,
} from "@/lib/tasks";

interface Props {
  task: Task;
  onChanged: () => void;
  onEdit: (t: Task) => void;
}

const toneRing: Record<string, string> = {
  ok: "ring-1 ring-pastel-blue/50 bg-pastel-blue/10",
  soon: "ring-1 ring-pastel-orange/70 bg-pastel-orange/15",
  urgent:
    "ring-2 ring-pastel-red/70 bg-gradient-to-br from-pastel-orange/30 to-pastel-red/25 shadow-glow",
  late: "ring-1 ring-pastel-red/60 bg-pastel-red/15",
};

const toneBadge: Record<string, string> = {
  ok: "bg-pastel-blue text-pastel-blue-foreground",
  soon: "bg-pastel-orange text-pastel-orange-foreground",
  urgent:
    "bg-gradient-to-r from-pastel-orange to-pastel-red text-pastel-red-foreground shadow-soft animate-pulse",
  late: "bg-pastel-red/80 text-pastel-red-foreground",
};

const toneDot: Record<string, string> = {
  ok: "bg-pastel-blue-foreground/60",
  soon: "bg-pastel-orange-foreground",
  urgent: "bg-pastel-red-foreground",
  late: "bg-pastel-red-foreground/80",
};

export function TaskCard({ task, onChanged, onEdit }: Props) {
  const meta = deadlineMeta(task.deadline, task.completed);

  const toggle = async () => {
    const { error } = await supabase
      .from("tasks")
      .update({
        completed: !task.completed,
        completed_at: !task.completed ? new Date().toISOString() : null,
      })
      .eq("id", task.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(task.completed ? "Ditandai belum selesai" : "Tugas selesai!");
    onChanged();
  };

  const remove = async () => {
    if (!confirm(`Hapus tugas "${task.title}"?`)) return;
    const { error } = await supabase.from("tasks").delete().eq("id", task.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Tugas dihapus");
    onChanged();
  };

  const deadlineDate = new Date(task.deadline);

  return (
    <article
      className={`card-soft group relative p-5 transition-all duration-500 ease-out hover:-translate-y-0.5 hover:shadow-glow animate-in-up ${
        task.completed ? "opacity-60" : toneRing[meta.tone]
      }`}
    >
      <div className="flex items-start gap-3">
        <button
          onClick={toggle}
          aria-label="Toggle selesai"
          className={`mt-1 grid h-6 w-6 shrink-0 place-items-center rounded-lg border transition ${
            task.completed
              ? "border-pastel-mint bg-pastel-mint text-pastel-mint-foreground"
              : "border-border hover:border-primary"
          }`}
        >
          {task.completed && <Check className="h-3.5 w-3.5" />}
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3
              className={`min-w-0 truncate font-semibold ${
                task.completed ? "line-through" : ""
              }`}
            >
              {task.title}
            </h3>
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                priorityClass[task.priority]
              }`}
            >
              {priorityLabel[task.priority]}
            </span>
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <BookOpen className="h-3.5 w-3.5" /> {task.course}
            </span>
            <span className="inline-flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {deadlineDate.toLocaleDateString("id-ID", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}{" "}
              •{" "}
              {deadlineDate.toLocaleTimeString("id-ID", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
          {task.description && (
            <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
              {task.description}
            </p>
          )}
        </div>

        <div className="flex flex-col items-end gap-2">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors duration-300 ${toneBadge[meta.tone]}`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${toneDot[meta.tone]}`} />
            {meta.label}
          </span>
          <div className="flex gap-1 opacity-0 transition group-hover:opacity-100">
            <button
              onClick={() => onEdit(task)}
              className="rounded-lg p-1.5 hover:bg-muted"
              aria-label="Edit"
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              onClick={remove}
              className="rounded-lg p-1.5 text-pastel-red-foreground hover:bg-pastel-red/30"
              aria-label="Hapus"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
