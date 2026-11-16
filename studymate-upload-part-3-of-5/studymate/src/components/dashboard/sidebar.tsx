"use client";

import { X, Sparkles, GraduationCap, ChevronRight } from "lucide-react";
import { navigation, type ToolId } from "@/lib/data";

type Props = { user: string; googleId: string; onSignOut: () => void; activeTool: ToolId; onNavigate: (id: ToolId) => void; mobileOpen: boolean; onClose: () => void };

export function Sidebar({ user, googleId, onSignOut, activeTool, onNavigate, mobileOpen, onClose }: Props) {
  return (
    <>
      {mobileOpen && <button aria-label="Close navigation overlay" onClick={onClose} className="fixed inset-0 z-40 bg-black/45 lg:hidden" />}
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-[258px] flex-col bg-[var(--nav)] px-4 py-5 text-white transition-transform duration-300 lg:translate-x-0 ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="mb-9 flex items-center justify-between px-2">
          <button onClick={() => onNavigate("overview")} className="flex items-center gap-3 text-left">
            <span className="flex h-10 w-10 items-center justify-center rounded-[13px] bg-[#8ed8cb] text-[#102a2c]"><GraduationCap size={22} /></span>
            <span><span className="block text-[17px] font-semibold tracking-tight">studymate</span><span className="block text-[10px] tracking-[.16em] text-[#91aaa9]">LEARN WITH CLARITY</span></span>
          </button>
          <button onClick={onClose} aria-label="Close menu" className="rounded-lg p-2 text-white/70 hover:bg-white/10 lg:hidden"><X size={18} /></button>
        </div>
        <div className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[.17em] text-[#72888e]">Your workspace</div>
        <nav className="app-scrollbar flex-1 space-y-6 overflow-y-auto">
          {["Workspace", "Create", "Practice"].map((group) => (
            <div key={group}>
              <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[.17em] text-[#72888e]">{group}</p>
              <div className="space-y-1">
                {navigation.filter((item) => item.group === group).map((item) => {
                  const Icon = item.icon;
                  const active = activeTool === item.id;
                  return <button key={item.id} onClick={() => onNavigate(item.id)} className={`focus-ring flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[13px] transition ${active ? "bg-[#29434a] font-medium text-[#a5e4da]" : "text-[#a7b6bb] hover:bg-white/[.06] hover:text-white"}`}>
                    <Icon size={17} strokeWidth={1.8} /><span className="flex-1">{item.label}</span>{active && <ChevronRight size={14} />}
                  </button>;
                })}
              </div>
            </div>
          ))}
        </nav>
        <div className="mt-5 rounded-2xl border border-white/10 bg-white/[.045] p-4">
          <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-[#8ed8cb]/15 text-[#8ed8cb]"><Sparkles size={16} /></div>
          <p className="text-sm font-medium">Study smarter, not longer.</p>
          <p className="mt-1 text-xs leading-5 text-[#9babb1]">Your AI study space is ready whenever you are.</p>
          <div className="mt-3 h-1 overflow-hidden rounded-full bg-white/10"><div className="h-full w-[72%] rounded-full bg-[#8ed8cb]" /></div>
          <p className="mt-2 text-[10px] text-[#8da2a7]">Weekly goal · 72% complete</p>
        </div>
        <button onClick={onSignOut} className="mt-5 flex w-full items-center gap-3 border-t border-white/10 px-2 pt-4 text-left">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#d5e9e5] text-xs font-semibold text-[#23433f]">{user.slice(0, 1).toUpperCase()}</div>
          <div className="min-w-0 flex-1"><p className="truncate text-xs font-medium">{user}</p><p className="truncate text-[10px] text-[#91a4ab]">{googleId || "Personal account"}</p></div>
          <span className="h-2 w-2 rounded-full bg-[#73c9a7]" />
        </button>
      </aside>
    </>
  );
}
