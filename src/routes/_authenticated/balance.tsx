import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Coffee, Brain, Heart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import type { Task } from "@/lib/tasks";

export const Route = createFileRoute("/_authenticated/balance")({
  component: BalancePage,
});

const TIPS = [
  "Coba teknik Pomodoro: 25 menit fokus, 5 menit istirahat.",
  "Minum air putih dulu sebelum buka tugas berikutnya.",
  "Jalan kaki 5 menit setelah dua tugas selesai.",
  "Tutup notifikasi medsos selama mengerjakan tugas penting.",
  "Susun ulang to-do berdasarkan energi, bukan hanya deadline.",
];

function BalancePage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("tasks")
      .select("*")
      .then(({ data }) => setTasks(data ?? []));
  }, [user?.id]);

  const today = useMemo(() => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const completedToday = tasks.filter(
      (t) => t.completed_at && new Date(t.completed_at) >= start,
    ).length;
    const goal = 3;
    const pct = Math.min(100, Math.round((completedToday / goal) * 100));
    return { completedToday, goal, pct };
  }, [tasks]);

  const tip = TIPS[new Date().getDate() % TIPS.length];

  return (
    <div className="space-y-8">
      <header className="animate-in-up">
        <h1 className="text-3xl font-extrabold tracking-tight">Study Balance</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Karena kamu lebih dari sekadar tugas. Jaga ritme belajarmu.
        </p>
      </header>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="card-soft p-6 lg:col-span-2 animate-in-up">
          <h2 className="text-lg font-semibold">Produktivitas hari ini</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Targetmu menyelesaikan {today.goal} tugas hari ini.
          </p>
          <div className="mt-6">
            <div className="flex items-end justify-between text-sm">
              <span className="text-muted-foreground">
                {today.completedToday} dari {today.goal} tugas selesai
              </span>
              <span className="font-semibold">{today.pct}%</span>
            </div>
            <div className="mt-2 h-3 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-gradient-to-r from-pastel-mint to-pastel-blue transition-all duration-500"
                style={{ width: `${today.pct}%` }}
              />
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <Pill icon={Brain} label="Belajar" desc="2-4 jam aktif" tone="bg-pastel-blue text-pastel-blue-foreground" />
            <Pill icon={Coffee} label="Istirahat" desc="Setiap 25 menit" tone="bg-pastel-orange text-pastel-orange-foreground" />
            <Pill icon={Heart} label="Tidur" desc="7-8 jam malam ini" tone="bg-pastel-lavender text-pastel-lavender-foreground" />
          </div>
        </div>

        <div className="card-soft relative overflow-hidden p-6 animate-in-up bg-gradient-to-br from-pastel-lavender/50 via-pastel-blue/30 to-pastel-mint/40">
          {/* floating ambient decorations */}
          <span aria-hidden className="pointer-events-none absolute -top-3 -right-2 text-3xl opacity-70 animate-[float_6s_ease-in-out_infinite]">
            🌙
          </span>
          <span aria-hidden className="pointer-events-none absolute top-10 right-10 text-lg opacity-80 animate-[twinkle_2.8s_ease-in-out_infinite]">
            ✨
          </span>
          <span aria-hidden className="pointer-events-none absolute bottom-4 right-6 text-xl opacity-70 animate-[float_7s_ease-in-out_infinite_reverse]">
            ☁️
          </span>

          <div className="relative grid h-14 w-14 place-items-center rounded-3xl bg-white/70 text-3xl shadow-soft backdrop-blur-sm animate-[breathe_4s_ease-in-out_infinite]">
            🌷
          </div>
          <h2 className="relative mt-5 text-lg font-semibold leading-snug tracking-tight text-foreground">
            Hei, jangan terlalu keras pada diri sendiri 🌷
          </h2>
          <p className="relative mt-3 text-sm leading-relaxed text-muted-foreground">
            Tugas memang banyak, tapi kamu juga manusia yang butuh jeda. Minum air,
            istirahat sebentar, lalu lanjut lagi ya. Kamu hebat sudah sampai sejauh ini 🤍
          </p>
        </div>
      </section>

      <section className="card-soft p-6 animate-in-up">
        <h2 className="text-lg font-semibold">Saran hari ini</h2>
        <p className="mt-3 rounded-2xl bg-pastel-lavender/40 p-5 text-sm text-pastel-lavender-foreground">
          💡 {tip}
        </p>
      </section>
    </div>
  );
}

function Pill({
  icon: Icon,
  label,
  desc,
  tone,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  desc: string;
  tone: string;
}) {
  return (
    <div className="rounded-2xl border border-border p-4">
      <div className={`grid h-9 w-9 place-items-center rounded-xl ${tone}`}>
        <Icon className="h-4 w-4" />
      </div>
      <p className="mt-3 text-sm font-semibold">{label}</p>
      <p className="text-xs text-muted-foreground">{desc}</p>
    </div>
  );
}
