import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Sparkles, Loader2, Mail } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

type Mode = "password" | "magic";

function LoginPage() {
  const nav = useNavigate();
  const { user } = useAuth();
  const [mode, setMode] = useState<Mode>("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    if (user) nav({ to: "/dashboard" });
  }, [user, nav]);

  const onPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast.error("Login gagal", { description: error.message });
      return;
    }
    toast.success("Selamat datang kembali!");
    nav({ to: "/dashboard" });
  };

  const onMagicSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin + "/dashboard" },
    });
    setLoading(false);
    if (error) {
      toast.error("Gagal mengirim magic link", { description: error.message });
      return;
    }
    toast.success("Magic link terkirim!", {
      description: "Cek inbox emailmu untuk melanjutkan login.",
    });
  };

  const onGoogle = async () => {
    setGoogleLoading(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin + "/dashboard",
    });
    if (result.error) {
      setGoogleLoading(false);
      toast.error("Login Google gagal", { description: result.error.message });
      return;
    }
    if (result.redirected) return;
    toast.success("Selamat datang!");
    nav({ to: "/dashboard" });
  };

  return (
    <AuthShell title="Masuk ke DeadlineKu" subtitle="Lanjutkan kelola tugas kuliahmu.">
      <button
        onClick={onGoogle}
        disabled={googleLoading}
        type="button"
        className="flex w-full items-center justify-center gap-3 rounded-2xl border border-border bg-background/60 py-3 text-sm font-semibold transition hover:bg-accent disabled:opacity-60"
      >
        {googleLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <GoogleIcon />
        )}
        Masuk dengan Google
      </button>

      <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
        <div className="h-px flex-1 bg-border" />
        atau
        <div className="h-px flex-1 bg-border" />
      </div>

      <div className="mb-4 flex rounded-xl bg-muted/60 p-1 text-xs font-medium">
        <button
          type="button"
          onClick={() => setMode("password")}
          className={`flex-1 rounded-lg px-3 py-2 transition ${
            mode === "password"
              ? "bg-background shadow-sm text-foreground"
              : "text-muted-foreground"
          }`}
        >
          Password
        </button>
        <button
          type="button"
          onClick={() => setMode("magic")}
          className={`flex-1 rounded-lg px-3 py-2 transition ${
            mode === "magic"
              ? "bg-background shadow-sm text-foreground"
              : "text-muted-foreground"
          }`}
        >
          Magic Link
        </button>
      </div>

      {mode === "password" ? (
        <form onSubmit={onPasswordSubmit} className="space-y-4">
          <Field label="Email" type="email" value={email} onChange={setEmail} required />
          <div>
            <Field
              label="Password"
              type="password"
              value={password}
              onChange={setPassword}
              required
            />
            <div className="mt-1.5 text-right">
              <Link
                to="/forgot-password"
                className="text-xs font-medium text-primary hover:underline"
              >
                Lupa password?
              </Link>
            </div>
          </div>
          <button
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-60"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Masuk
          </button>
        </form>
      ) : (
        <form onSubmit={onMagicSubmit} className="space-y-4">
          <Field label="Email" type="email" value={email} onChange={setEmail} required />
          <p className="text-xs text-muted-foreground">
            Kami akan mengirim link login satu kali ke email kamu. Tidak perlu
            password.
          </p>
          <button
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-60"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Mail className="h-4 w-4" />
            )}
            Kirim magic link
          </button>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Belum punya akun?{" "}
        <Link to="/register" className="font-semibold text-primary hover:underline">
          Daftar di sini
        </Link>
      </p>
    </AuthShell>
  );
}

export function GoogleIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3C33.7 32.4 29.3 35.5 24 35.5c-6.4 0-11.5-5.1-11.5-11.5S17.6 12.5 24 12.5c2.9 0 5.6 1.1 7.6 2.9l5.7-5.7C33.6 6.3 29 4.5 24 4.5 13.2 4.5 4.5 13.2 4.5 24S13.2 43.5 24 43.5 43.5 34.8 43.5 24c0-1.2-.1-2.4-.4-3.5z"
      />
      <path
        fill="#FF3D00"
        d="M6.3 14.7l6.6 4.8C14.6 15.7 18.9 12.5 24 12.5c2.9 0 5.6 1.1 7.6 2.9l5.7-5.7C33.6 6.3 29 4.5 24 4.5 16.3 4.5 9.7 9 6.3 14.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 43.5c5 0 9.5-1.7 12.9-4.6l-6-5.1c-2 1.4-4.4 2.2-6.9 2.2-5.3 0-9.7-3.1-11.3-7.4l-6.5 5C9.5 39 16.2 43.5 24 43.5z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4 5.4l6 5.1c-.4.4 6.5-4.7 6.5-14.5 0-1.2-.1-2.4-.4-3.5z"
      />
    </svg>
  );
}

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-screen place-items-center px-4 py-10">
      <div className="w-full max-w-md animate-in-up">
        <Link to="/" className="mb-8 flex items-center justify-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-2xl bg-pastel-lavender text-pastel-lavender-foreground">
            <Sparkles className="h-5 w-5" />
          </div>
          <span className="text-lg font-bold">DeadlineKu</span>
        </Link>
        <div className="glass-strong rounded-3xl p-8 shadow-soft">
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
          <div className="mt-6">{children}</div>
        </div>
      </div>
    </div>
  );
}

export function Field({
  label,
  type = "text",
  value,
  onChange,
  required,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-muted-foreground">{label}</span>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-border bg-background/60 px-4 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/40"
      />
    </label>
  );
}
