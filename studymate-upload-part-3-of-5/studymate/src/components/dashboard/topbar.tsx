"use client";

import { Bell, Menu, Moon, Search, Sun } from "lucide-react";

type Props = { title: string; user: string; onMenu: () => void; onThemeToggle: () => void; dark: boolean };

export function Topbar({ title, user, onMenu, onThemeToggle, dark }: Props) {
  return (
    <header className="sticky top-0 z-30 border-b border-[var(--line)] bg-[color-mix(in_srgb,var(--bg)_88%,transparent)] backdrop-blur-xl">
      <div className="mx-auto flex h-[70px] max-w-[1440px] items-center justify-between gap-3 px-4 sm:px-6 lg:px-9">
        <div className="flex min-w-0 items-center gap-3">
          <button onClick={onMenu} aria-label="Open navigation" className="focus-ring rounded-lg p-2 hover:bg-[var(--surface-muted)] lg:hidden"><Menu size={20} /></button>
          <div className="min-w-0"><p className="truncate text-sm font-semibold tracking-tight">{title}</p><p className="hidden text-[11px] muted sm:block">Welcome back. Ready for a focused session?</p></div>
        </div>
        <div className="flex items-center gap-2">
          <label className="hidden h-9 w-52 items-center gap-2 rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3 md:flex">
            <Search size={15} className="muted" /><input aria-label="Search your workspace" placeholder="Search anything..." className="w-full bg-transparent text-xs outline-none placeholder:text-[var(--muted)]" /><kbd className="rounded border border-[var(--line)] px-1.5 py-0.5 text-[9px] muted">⌘ K</kbd>
          </label>
          <button onClick={onThemeToggle} aria-label={`Switch to ${dark ? "light" : "dark"} mode`} className="focus-ring rounded-xl border border-[var(--line)] bg-[var(--surface)] p-2.5 transition hover:-translate-y-0.5">{dark ? <Sun size={17} /> : <Moon size={17} />}</button>
          <button aria-label="Notifications" className="focus-ring relative rounded-xl border border-[var(--line)] bg-[var(--surface)] p-2.5"><Bell size={17} /><span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-[var(--accent)]" /></button>
          <div className="ml-1 hidden h-9 w-9 items-center justify-center rounded-full bg-[#dcece8] text-xs font-semibold text-[#24443f] sm:flex">{user.slice(0, 1).toUpperCase()}</div>
        </div>
      </div>
    </header>
  );
}
