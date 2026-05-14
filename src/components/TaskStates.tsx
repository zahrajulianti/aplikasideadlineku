export function TaskSkeleton() {
  return (
    <div className="card-soft animate-pulse p-5">
      <div className="flex items-start gap-3">
        <div className="mt-1 h-6 w-6 rounded-lg bg-muted" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-2/3 rounded bg-muted" />
          <div className="h-3 w-1/3 rounded bg-muted" />
          <div className="h-3 w-full rounded bg-muted" />
        </div>
        <div className="h-6 w-16 rounded-full bg-muted" />
      </div>
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="card-soft grid place-items-center gap-3 p-12 text-center animate-in-up">
      <div className="grid h-16 w-16 place-items-center rounded-3xl bg-pastel-lavender text-3xl">
        ✨
      </div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
      {action}
    </div>
  );
}
