import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { CheckCircle2, Sparkles, Clock, BarChart3 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/")({
  component: Landing,
});

function Landing() {
  const { user, loading } = useAuth();
  if (!loading && user) return <Navigate to="/dashboard" />;

  return (
    <div className="min-h-screen px-6 py-10">
      <header className="mx-auto flex max-w-6xl items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-2xl bg-pastel-lavender text-pastel-lavender-foreground">
            <Sparkles className="h-5 w-5" />
          </div>
          <span className="text-lg font-bold tracking-tight">DeadlineKu</span>
        </div>
        <nav className="flex items-center gap-2">
          <Link
            to="/login"
            className="rounded-xl px-4 py-2 text-sm font-medium hover:bg-muted"
          >
            Masuk
          </Link>
          <Link
            to="/register"
            className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90"
          >
            Daftar
          </Link>
        </nav>
      </header>

      <main className="mx-auto mt-20 max-w-4xl text-center animate-in-up">
        <span className="inline-flex items-center gap-2 rounded-full bg-pastel-blue px-4 py-1.5 text-xs font-medium text-pastel-blue-foreground">
          <Sparkles className="h-3.5 w-3.5" /> Khusus mahasiswa Indonesia
        </span>
        <h1 className="mt-6 text-4xl font-extrabold tracking-tight sm:text-6xl">
          Kelola tugas kuliahmu,
          <br />
          <span className="bg-gradient-to-r from-[oklch(0.6_0.12_260)] via-[oklch(0.65_0.12_295)] to-[oklch(0.7_0.1_245)] bg-clip-text text-transparent">
            tanpa lupa deadline.
          </span>
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-base text-muted-foreground sm:text-lg">
          Semua tugas, deadline, dan progress belajarmu tersusun rapi dalam
          satu tempat yang nyaman dilihat 📚
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link
            to="/register"
            className="rounded-2xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-soft transition hover:opacity-90"
          >
            Mulai gratis
          </Link>
          <Link
            to="/login"
            className="glass rounded-2xl px-6 py-3 text-sm font-semibold transition hover:bg-muted"
          >
            Sudah punya akun
          </Link>
        </div>

        <div className="mt-20 grid gap-4 sm:grid-cols-3">
          {[
            { icon: CheckCircle2, t: "CRUD tugas", d: "Tambah, edit, tandai selesai dengan cepat." },
            { icon: Clock, t: "Reminder visual", d: "Warna pastel bantu lihat deadline dekat." },
            { icon: BarChart3, t: "Statistik", d: "Pantau progres mingguan & mata kuliah." },
          ].map((f) => (
            <div key={f.t} className="card-soft p-6 text-left">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-pastel-lavender text-pastel-lavender-foreground">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-semibold">{f.t}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.d}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
