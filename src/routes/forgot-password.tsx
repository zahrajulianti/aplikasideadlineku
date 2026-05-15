import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Loader2, Mail } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AuthShell, Field } from "./login";

export const Route = createFileRoute("/forgot-password")({
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + "/reset-password",
    });
    setLoading(false);
    if (error) {
      toast.error("Gagal mengirim link reset", { description: error.message });
      return;
    }
    setSent(true);
    toast.success("Link reset password terkirim!", {
      description: "Cek email kamu untuk melanjutkan.",
    });
  };

  return (
    <AuthShell
      title="Lupa password"
      subtitle="Masukkan email akunmu, kami akan mengirim link reset."
    >
      {sent ? (
        <div className="space-y-4 text-center">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-pastel-mint text-pastel-mint-foreground">
            <Mail className="h-6 w-6" />
          </div>
          <p className="text-sm text-muted-foreground">
            Email berisi link reset sudah dikirim ke <b>{email}</b>. Periksa
            inbox atau folder spam.
          </p>
          <Link
            to="/login"
            className="inline-block text-sm font-semibold text-primary hover:underline"
          >
            Kembali ke login
          </Link>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          <Field label="Email" type="email" value={email} onChange={setEmail} required />
          <button
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-60"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Kirim link reset
          </button>
          <p className="text-center text-sm text-muted-foreground">
            Ingat passwordmu?{" "}
            <Link to="/login" className="font-semibold text-primary hover:underline">
              Masuk
            </Link>
          </p>
        </form>
      )}
    </AuthShell>
  );
}
