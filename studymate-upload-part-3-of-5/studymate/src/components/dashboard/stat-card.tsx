import { BookOpen, Clock3, Target } from "lucide-react";

const icons = { clock: Clock3, book: BookOpen, target: Target };
type Props = { label: string; value: string; note: string; icon: keyof typeof icons };

export function StatCard({ label, value, note, icon }: Props) {
  const Icon = icons[icon];
  return <div className="surface rounded-2xl p-4 sm:p-5"><div className="flex items-center justify-between"><span className="text-xs muted">{label}</span><span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--accent-soft)] accent-text"><Icon size={16} /></span></div><p className="mt-3 text-2xl font-semibold tracking-tight">{value}</p><p className="mt-1 text-[11px] muted">{note}</p></div>;
}
