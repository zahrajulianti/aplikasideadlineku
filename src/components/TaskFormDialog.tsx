import { useEffect, useState } from "react";
import { X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Task, Priority } from "@/lib/tasks";
import { useAuth } from "@/hooks/use-auth";

interface Props {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  task?: Task | null;
}

function toLocalInput(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}`;
}

export function TaskFormDialog({ open, onClose, onSaved, task }: Props) {
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [course, setCourse] = useState("");
  const [deadline, setDeadline] = useState("");
  const [priority, setPriority] = useState<Priority>("sedang");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setTitle(task?.title ?? "");
      setCourse(task?.course ?? "");
      setDeadline(task?.deadline ? toLocalInput(task.deadline) : "");
      setPriority(task?.priority ?? "sedang");
      setDescription(task?.description ?? "");
    }
  }, [open, task]);

  if (!open) return null;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    const payload = {
      title: title.trim(),
      course: course.trim(),
      description: description.trim(),
      priority,
      deadline: new Date(deadline).toISOString(),
    };
    const res = task
      ? await supabase.from("tasks").update(payload).eq("id", task.id)
      : await supabase.from("tasks").insert({ ...payload, user_id: user.id });
    setSaving(false);
    if (res.error) {
      toast.error("Gagal menyimpan tugas", { description: res.error.message });
      return;
    }
    toast.success(task ? "Tugas diperbarui" : "Tugas ditambahkan", {
      description: `${payload.title} • ${payload.course}`,
    });
    onSaved();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center px-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in-up"
        onClick={onClose}
      />
      <div className="glass-strong relative z-10 w-full max-w-lg rounded-3xl p-6 shadow-soft animate-in-up">
        <div className="mb-5 flex items-start justify-between">
          <div>
            <h2 className="text-lg font-bold">{task ? "Edit tugas" : "Tugas baru"}</h2>
            <p className="text-sm text-muted-foreground">
              Isi detail tugas kuliahmu di bawah ini.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 hover:bg-muted"
            aria-label="Tutup"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <Input label="Nama tugas" value={title} onChange={setTitle} required />
          <Input label="Mata kuliah" value={course} onChange={setCourse} required />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Deadline"
              type="datetime-local"
              value={deadline}
              onChange={setDeadline}
              required
            />
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Prioritas
              </span>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full rounded-xl border border-border bg-background/60 px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/40"
              >
                <option value="rendah">Rendah</option>
                <option value="sedang">Sedang</option>
                <option value="tinggi">Tinggi</option>
              </select>
            </label>
          </div>
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-muted-foreground">
              Deskripsi
            </span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full resize-none rounded-xl border border-border bg-background/60 px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/40"
            />
          </label>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2.5 text-sm font-medium hover:bg-muted"
            >
              Batal
            </button>
            <button
              disabled={saving}
              className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60"
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {task ? "Simpan perubahan" : "Tambah tugas"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  type = "text",
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-muted-foreground">{label}</span>
      <input
        type={type}
        value={value}
        required={required}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-border bg-background/60 px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/40"
      />
    </label>
  );
}
