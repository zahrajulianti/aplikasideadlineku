import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { BarChart3, Trophy, BookMarked } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import type { Task } from "@/lib/tasks";

export const Route = createFileRoute("/_authenticated/stats")({
  component: StatsPage,
});

function StatsPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("tasks")
      .select("*")
      .then(({ data }) => setTasks(data ?? []));
  }, [user?.id]);

  const data = useMemo(() => {
    const total = tasks.length;
    const done = tasks.filter((t) => t.completed);
    const pct = total ? Math.round((done.length / total) * 100) : 0;

    // tasks completed this week
    const now = new Date();
    const start = new Date(now);
    start.setDate(now.getDate() - now.getDay());
    start.setHours(0, 0, 0, 0);
    const weekDone = done.filter(
      (t) => t.completed_at && new Date(t.completed_at) >= start,
    ).length;

    const courseMap: Record<string, number> = {};
    for (const t of tasks) {
      courseMap[t.course] = (courseMap[t.course] ?? 0) + 1;
    }
    const courses = Object.entries(courseMap).sort((a, b) => b[1] - a[1]);
    const max = courses[0]?.[1] ?? 0;

    return { total, done: done.length, pct, weekDone, courses, topCourse: courses[0], max };
  }, [tasks]);

  return (
    <div className="space-y-8">
      <header className="animate-in-up">
        <h1 className="text-3xl font-extrabold tracking-tight">Statistik</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Ringkasan produktivitas dan distribusi tugas kamu.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-3">
        <div className="card-soft p-6 animate-in-up">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-pastel-mint text-pastel-mint-foreground">
            <Trophy className="h-5 w-5" />
          </div>
          <p className="mt-4 text-xs uppercase tracking-wide text-muted-foreground">
            Selesai minggu ini
          </p>
          <p className="text-3xl font-extrabold">{data.weekDone}</p>
        </div>
        <div className="card-soft p-6 animate-in-up">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-pastel-lavender text-pastel-lavender-foreground">
            <BarChart3 className="h-5 w-5" />
          </div>
          <p className="mt-4 text-xs uppercase tracking-wide text-muted-foreground">
            Persentase selesai
          </p>
          <p className="text-3xl font-extrabold">{data.pct}%</p>
        </div>
        <div className="card-soft p-6 animate-in-up">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-pastel-blue text-pastel-blue-foreground">
            <BookMarked className="h-5 w-5" />
          </div>
          <p className="mt-4 text-xs uppercase tracking-wide text-muted-foreground">
            Mata kuliah terbanyak
          </p>
          <p className="truncate text-2xl font-extrabold">
            {data.topCourse?.[0] ?? "—"}
          </p>
          <p className="text-xs text-muted-foreground">
            {data.topCourse?.[1] ?? 0} tugas
          </p>
        </div>
      </section>

      <section className="card-soft p-6 animate-in-up">
        <h2 className="text-lg font-semibold">Distribusi per mata kuliah</h2>
        {data.courses.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">Belum ada data.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {data.courses.map(([name, count]) => (
              <div key={name}>
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{name}</span>
                  <span className="text-muted-foreground">{count}</span>
                </div>
                <div className="mt-1 h-2.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-pastel-blue to-pastel-lavender"
                    style={{ width: `${(count / data.max) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
