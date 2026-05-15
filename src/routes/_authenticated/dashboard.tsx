import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  ListChecks,
  CheckCircle2,
  Clock,
  TrendingUp,
  Plus,
  ArrowRight,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { deadlineMeta, type Task } from "@/lib/tasks";
import { TaskFormDialog } from "@/components/TaskFormDialog";
import { TaskSkeleton } from "@/components/TaskStates";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: Dashboard,
});

function useNow(intervalMs = 60_000) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(t);
  }, [intervalMs]);
  return now;
}

function Dashboard() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[] | null>(null);
  const [open, setOpen] = useState(false);
  const now = useNow(1000);

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

  const stats = useMemo(() => {
    const list = tasks ?? [];
    const active = list.filter((t) => !t.completed);
    const done = list.filter((t) => t.completed);
    const upcoming = active
      .filter((t) => new Date(t.deadline) >= new Date(now.toDateString()))
      .sort((a, b) => +new Date(a.deadline) - +new Date(b.deadline));
    const next = upcoming[0];
    const total = list.length;
    const pct = total ? Math.round((done.length / total) * 100) : 0;
    return { active, done, next, pct, total };
  }, [tasks, now]);

  const countdown = stats.next ? formatCountdown(stats.next.deadline, now) : null;

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4 animate-in-up">
        <div>
          <p className="text-sm text-muted-foreground">
            {now.toLocaleDateString("id-ID", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight sm:text-4xl">
            Halo, {user?.email?.split("@")[0]} 🙌🏻
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Yuk tuntaskan tugas hari ini, satu demi satu ☘️
          </p>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-soft hover:opacity-90"
        >
          <Plus className="h-4 w-4" /> Tambah tugas
        </button>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={ListChecks}
          label="Tugas aktif"
          value={stats.active.length}
          tone="blue"
        />
        <StatCard
          icon={CheckCircle2}
          label="Tugas selesai"
          value={stats.done.length}
          tone="mint"
        />
        <StatCard
          icon={TrendingUp}
          label="Progres"
          value={`${stats.pct}%`}
          tone="lavender"
        />
        <StatCard
          icon={Clock}
          label="Deadline terdekat"
          value={countdown ?? "—"}
          tone="orange"
          small
        />
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="card-soft p-6 lg:col-span-2 animate-in-up">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Deadline terdekat</h2>
            <Link
              to="/tasks"
              className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
            >
              Semua tugas <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-4 space-y-2">
            {tasks === null ? (
              Array.from({ length: 3 }).map((_, i) => <TaskSkeleton key={i} />)
            ) : stats.active.length === 0 ? (
              <p className="rounded-xl bg-pastel-mint/40 p-6 text-center text-sm text-pastel-mint-foreground">
                🎉 Semua tugas sudah selesai. Saatnya istirahat!
              </p>
            ) : (
              stats.active.slice(0, 5).map((t) => {
                const m = deadlineMeta(t.deadline);
                return (
                  <Link
                    key={t.id}
                    to="/tasks"
                    className="flex items-center justify-between rounded-xl border border-border p-3 transition hover:bg-muted"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium">{t.title}</p>
                      <p className="truncate text-xs text-muted-foreground">{t.course}</p>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                        m.tone === "late"
                          ? "bg-pastel-red text-pastel-red-foreground"
                          : m.tone === "urgent"
                            ? "bg-pastel-orange text-pastel-orange-foreground"
                            : m.tone === "soon"
                              ? "bg-pastel-orange/70 text-pastel-orange-foreground"
                              : "bg-pastel-blue text-pastel-blue-foreground"
                      }`}
                    >
                      {m.label}
                    </span>
                  </Link>
                );
              })
            )}
          </div>
        </section>

        <section className="card-soft overflow-hidden p-6 animate-in-up">
          <h2 className="text-lg font-semibold">Produktivitas hari ini</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Selesaikan minimal 1 tugas hari ini ✨
          </p>

          <div className="mt-6">
            <div className="flex items-end justify-between text-sm">
              <span className="text-muted-foreground">Progres total</span>
              <span className="font-semibold">{stats.pct}%</span>
            </div>
            <div className="mt-2 h-3 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-gradient-to-r from-pastel-blue to-pastel-lavender transition-all duration-500"
                style={{ width: `${stats.pct}%` }}
              />
            </div>
          </div>

          <div className="mt-6 rounded-2xl bg-pastel-lavender/40 p-4 text-sm text-pastel-lavender-foreground">
            💡 Saran: kerjakan tugas dengan prioritas <b>tinggi</b> terlebih dahulu, lalu beri
            jeda 5 menit setiap 25 menit fokus.
          </div>
        </section>
      </div>

      <TaskFormDialog open={open} onClose={() => setOpen(false)} onSaved={load} />
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  tone,
  small,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  tone: "blue" | "lavender" | "mint" | "orange";
  small?: boolean;
}) {
  const toneClass = {
    blue: "bg-pastel-blue text-pastel-blue-foreground",
    lavender: "bg-pastel-lavender text-pastel-lavender-foreground",
    mint: "bg-pastel-mint text-pastel-mint-foreground",
    orange: "bg-pastel-orange text-pastel-orange-foreground",
  }[tone];
  return (
    <div className="card-soft p-5 animate-in-up">
      <div className={`grid h-10 w-10 place-items-center rounded-xl ${toneClass}`}>
        <Icon className="h-5 w-5" />
      </div>
      <p className="mt-4 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className={`mt-1 font-extrabold tracking-tight ${small ? "text-xl" : "text-3xl"}`}>
        {value}
      </p>
    </div>
  );
}

function formatCountdown(iso: string, now: Date) {
  const ms = +new Date(iso) - +now;
  if (ms < 0) return "Terlambat";
  const h = Math.floor(ms / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  const s = Math.floor((ms % 60_000) / 1000);
  if (h >= 24) return `${Math.floor(h / 24)}h ${h % 24}j`;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}
