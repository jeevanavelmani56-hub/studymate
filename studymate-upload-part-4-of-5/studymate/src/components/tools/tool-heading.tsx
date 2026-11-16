import type { ReactNode } from "react";

export function ToolHeading({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: ReactNode }) {
  return <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><p className="mb-2 text-[10px] font-semibold uppercase tracking-[.18em] accent-text">{eyebrow}</p><h1 className="text-2xl font-semibold tracking-[-.035em] sm:text-[30px]">{title}</h1><p className="mt-2 max-w-2xl text-sm leading-6 muted">{description}</p></div>{action}</div>;
}
