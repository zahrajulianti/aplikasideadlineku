import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { deadlineMeta, type Task } from "@/lib/tasks";
import { TaskCard } from "@/components/TaskCard";
import { TaskFormDialog } from "@/components/TaskFormDialog";
import { EmptyState, TaskSkeleton } from "@/components/TaskStates";

export const Route = createFileRoute("/_authenticated/tasks")({
  component: TasksPage,
});

type Filter = "all" | "active" | "done" | "soon";

const filters: { id: Filter; label: string }[] = [
  { id: "all", label: "Semua" },
  { id: "active", label: "Belum selesai" },
  { id: "done", label: "Selesai" },
  { id: "soon", label: "Deadline dekat" },
];

function TasksPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[] | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);

  const load = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("tasks")
      .select("*")
      .order("deadline", { ascending: true });
    setTasks(data ?? []);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const filtered = useMemo(() => {
    const list = tasks ?? [];
    return list.filter((t) => {
      if (filter === "active" && t.completed) return false;
      if (filter === "done" && !t.completed) return false;
      if (filter === "soon") {
        const m = deadlineMeta(t.deadline, t.completed);
        if (!(m.tone === "soon" || m.tone === "urgent" || m.tone === "late")) return false;
        if (t.completed) return false;
      }
      if (q.trim()) {
        const s = q.toLowerCase();
        if (!t.title.toLowerCase().includes(s) && !t.course.toLowerCase().includes(s))
          return false;
      }
      return true;
    });
  }, [tasks, filter, q]);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4 animate-in-up">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Daftar tugas</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Kelola, urutkan, dan filter semua tugas kuliahmu di satu tempat.
          </p>
        </div>
        <button
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
          className="inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-soft hover:opacity-90"
        >
          <Plus className="h-4 w-4" /> Tambah tugas
        </button>
      </header>

      <div className="glass flex flex-wrap items-center gap-3 rounded-2xl p-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cari tugas atau mata kuliah…"
            className="w-full rounded-xl border border-border bg-background/60 py-2 pl-9 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/40"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {filters.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`rounded-xl px-3.5 py-2 text-xs font-semibold transition ${
                filter === f.id
                  ? "bg-pastel-lavender text-pastel-lavender-foreground"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {tasks === null ? (
          Array.from({ length: 4 }).map((_, i) => <TaskSkeleton key={i} />)
        ) : filtered.length === 0 ? (
          <EmptyState
            title="Belum ada tugas di sini"
            description="Tambahkan tugas baru atau coba filter lain untuk melihat tugasmu."
            action={
              <button
                onClick={() => {
                  setEditing(null);
                  setOpen(true);
                }}
                className="mt-2 inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
              >
                <Plus className="h-4 w-4" /> Tambah tugas
              </button>
            }
          />
        ) : (
          filtered.map((t) => (
            <TaskCard
              key={t.id}
              task={t}
              onChanged={load}
              onEdit={(task) => {
                setEditing(task);
                setOpen(true);
              }}
            />
          ))
        )}
      </div>

      <TaskFormDialog
        open={open}
        onClose={() => setOpen(false)}
        onSaved={load}
        task={editing}
      />
    </div>
  );
}
