import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AuthShell, Field } from "./login";

export const Route = createFileRoute("/reset-password")({
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const nav = useNavigate();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Supabase parses recovery token from URL hash automatically.
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") {
        setReady(true);
      }
    });
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error("Password minimal 6 karakter");
      return;
    }
    if (password !== confirm) {
      toast.error("Konfirmasi password tidak cocok");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      toast.error("Gagal mengubah password", { description: error.message });
      return;
    }
    toast.success("Password berhasil diubah!");
    nav({ to: "/dashboard" });
  };

  return (
    <AuthShell title="Reset password" subtitle="Buat password baru untuk akunmu.">
      {!ready ? (
        <p className="text-sm text-muted-foreground">
          Memvalidasi link reset… Buka halaman ini dari link yang dikirim ke
          emailmu.
        </p>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          <Field
            label="Password baru"
            type="password"
            value={password}
            onChange={setPassword}
            required
          />
          <Field
            label="Konfirmasi password"
            type="password"
            value={confirm}
            onChange={setConfirm}
            required
          />
          <button
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-60"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Simpan password baru
          </button>
        </form>
      )}
    </AuthShell>
  );
}
