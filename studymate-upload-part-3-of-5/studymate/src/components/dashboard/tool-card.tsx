import { ArrowUpRight, BookOpen, BrainCircuit, FileQuestion, FileText, Headphones, PenLine, Sparkles, type LucideIcon } from "lucide-react";

const icons: Record<string, LucideIcon> = { chat: Sparkles, pdf: FileText, mind: BrainCircuit, quiz: BookOpen, board: PenLine, audio: Headphones, exam: FileQuestion };
const accents: Record<string, string> = { chat: "bg-[#e1f3f0] text-[#087f78]", pdf: "bg-[#e9eef9] text-[#5475ae]", mind: "bg-[#f2eafa] text-[#8765a8]", quiz: "bg-[#fbf1df] text-[#ad7c32]", board: "bg-[#e7f0f5] text-[#4c7c96]", audio: "bg-[#f8e9ec] text-[#ad687a]", exam: "bg-[#e9edf0] text-[#596c78]" };

type Props = { title: string; description: string; icon: string; onClick: () => void };

export function ToolCard({ title, description, icon, onClick }: Props) {
  const Icon = icons[icon];
  return <button onClick={onClick} className="surface group focus-ring flex min-h-[154px] flex-col items-start rounded-2xl p-5 text-left transition duration-300 hover:-translate-y-1 hover:border-[color-mix(in_srgb,var(--accent)_40%,var(--line))]">
    <div className="flex w-full items-center justify-between"><span className={`flex h-10 w-10 items-center justify-center rounded-xl ${accents[icon]}`}><Icon size={19} /></span><ArrowUpRight size={16} className="muted transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[var(--accent)]" /></div>
    <span className="mt-4 text-sm font-semibold">{title}</span><span className="mt-1 text-xs leading-5 muted">{description}</span>
  </button>;
}
