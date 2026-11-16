"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { navigation, type ToolId } from "@/lib/data";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import { StatCard } from "./stat-card";
import { ToolCard } from "./tool-card";
import { AiChat } from "@/components/tools/ai-chat";
import { PdfNotes } from "@/components/tools/pdf-notes";
import { MindMap } from "@/components/tools/mind-map";
import { Quiz } from "@/components/tools/quiz";
import { Whiteboard } from "@/components/tools/whiteboard";
import { Podcast } from "@/components/tools/podcast";
import { ExamGenerator } from "@/components/tools/exam-generator";

type DashboardProps = { user: string; googleId: string; onSignOut: () => void };

export function Dashboard({ user, googleId, onSignOut }: DashboardProps) {
  const [activeTool, setActiveTool] = useState<ToolId>("overview");
  const [dark, setDark] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const pageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = window.localStorage.getItem("studymate-theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const shouldUseDark = saved ? saved === "dark" : prefersDark;
    setDark(shouldUseDark);
    document.documentElement.classList.toggle("dark", shouldUseDark);
  }, []);

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    window.localStorage.setItem("studymate-theme", next ? "dark" : "light");
  };

  useGSAP(() => {
    gsap.fromTo(".dashboard-reveal", { y: 12, opacity: 0 }, {
      y: 0, opacity: 1, duration: 0.55, stagger: 0.07, ease: "power2.out", clearProps: "all",
    });
  }, { scope: pageRef, dependencies: [activeTool] });

  const current = navigation.find((item) => item.id === activeTool);

  return (
    <div className="min-h-dvh">
      <Sidebar user={user} googleId={googleId} onSignOut={onSignOut} activeTool={activeTool} onNavigate={(id) => { setActiveTool(id); setMobileNavOpen(false); }} mobileOpen={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />
      <main className="min-h-dvh lg:pl-[258px]">
        <Topbar
          title={activeTool === "overview" ? "Your study space" : current?.label ?? "StudyMate"}
          onMenu={() => setMobileNavOpen(true)}
          onThemeToggle={toggleTheme}
          dark={dark}
          user={user}
        />
        <div ref={pageRef} className="mx-auto w-full max-w-[1440px] px-4 pb-10 pt-6 sm:px-6 lg:px-9">
          {activeTool === "overview" ? (
            <div className="space-y-7">
              <section className="dashboard-reveal relative overflow-hidden rounded-[26px] bg-[#142c32] px-6 py-7 text-white sm:px-9 sm:py-9">
                <div className="pointer-events-none absolute -right-12 -top-24 h-72 w-72 rounded-full border border-white/10" />
                <div className="pointer-events-none absolute -right-1 top-4 h-52 w-52 rounded-full border border-white/10" />
                <div className="relative max-w-2xl">
                  <p className="mb-3 text-sm font-medium tracking-wide text-[#8ed8cb]">YOUR STUDY SPACE</p>
                  <h1 className="max-w-xl text-3xl font-semibold leading-tight tracking-[-0.04em] sm:text-[38px]">Good to see you, {user.split(" ")[0]}. <span className="text-[#8ed8cb]">Let’s learn.</span></h1>
                  <p className="mt-3 max-w-lg text-sm leading-6 text-white/70">Your ideas, notes and practice — all in one focused space. Pick up where you left off.</p>
                  <button onClick={() => setActiveTool("chat")} className="focus-ring mt-6 inline-flex items-center gap-2 rounded-xl bg-[#8ed8cb] px-4 py-3 text-sm font-semibold text-[#102a2c] transition hover:-translate-y-0.5 hover:bg-[#a4e6dc] active:scale-[.98]">
                    Start studying <span aria-hidden="true">→</span>
                  </button>
                </div>
                <div className="absolute bottom-0 right-8 hidden h-44 w-44 items-center justify-center rounded-t-full border border-white/10 bg-white/[.035] sm:flex">
                  <div className="flex h-28 w-28 items-center justify-center rounded-full border border-[#8ed8cb]/30 bg-[#8ed8cb]/10">
                    <span className="text-5xl font-light text-[#8ed8cb]">S</span>
                  </div>
                </div>
              </section>

              <section className="dashboard-reveal grid grid-cols-1 gap-3 sm:grid-cols-3">
                <StatCard label="Study time" value="12.5 hrs" note="+2.4 hrs this week" icon="clock" />
                <StatCard label="Topics completed" value="18" note="4 more than last week" icon="book" />
                <StatCard label="Quiz accuracy" value="86%" note="Keep your momentum" icon="target" />
              </section>

              <section className="dashboard-reveal">
                <div className="mb-4 flex items-end justify-between gap-3">
                  <div><h2 className="text-lg font-semibold tracking-tight">Your study tools</h2><p className="mt-1 text-sm muted">Everything you need to learn with clarity.</p></div>
                  <span className="hidden text-xs muted sm:block">8 tools available</span>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  <ToolCard title="AI Study Chat" description="Break down difficult concepts and ask follow-up questions." icon="chat" onClick={() => setActiveTool("chat")} />
                  <ToolCard title="PDF Notes" description="Bring your class notes and textbooks into your study flow." icon="pdf" onClick={() => setActiveTool("pdf")} />
                  <ToolCard title="Mind Map" description="Turn complex topics into clear visual connections." icon="mind" onClick={() => setActiveTool("mindmap")} />
                  <ToolCard title="Quiz Generator" description="Test your understanding with quick practice rounds." icon="quiz" onClick={() => setActiveTool("quiz")} />
                  <ToolCard title="AI Whiteboard" description="Work through ideas and visual problem-solving." icon="board" onClick={() => setActiveTool("whiteboard")} />
                  <ToolCard title="Voice Tutor" description="Listen to a topic explained in podcast style." icon="audio" onClick={() => setActiveTool("podcast")} />
                  <ToolCard title="Model Papers" description="Create structured practice papers for revision." icon="exam" onClick={() => setActiveTool("exam")} />
                  <button onClick={() => setActiveTool("chat")} className="focus-ring flex min-h-[154px] flex-col items-start justify-center rounded-2xl border border-dashed border-[var(--line)] px-5 text-left transition hover:border-[var(--accent)] hover:bg-[var(--surface)]">
                    <span className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--accent-soft)] text-lg accent-text">+</span>
                    <span className="text-sm font-semibold">Explore your next topic</span><span className="mt-1 text-xs muted">Open the AI study assistant</span>
                  </button>
                </div>
              </section>

              <section className="dashboard-reveal grid gap-4 lg:grid-cols-[1.25fr_.75fr]">
                <div className="surface rounded-2xl p-5">
                  <div className="mb-4 flex items-center justify-between"><div><h2 className="font-semibold">Continue learning</h2><p className="mt-1 text-xs muted">Recently opened study sessions</p></div><button onClick={() => setActiveTool("chat")} className="text-xs font-semibold accent-text">View all</button></div>
                  <div className="space-y-1">
                    {[
                      ["Operating Systems", "Process scheduling · AI Chat", "68%", "bg-[#087f78]"],
                      ["Engineering Mathematics II", "Matrices · Mind Map", "42%", "bg-[#5485b7]"],
                      ["Database Management", "Normalization · Quiz", "90%", "bg-[#bd8b42]"],
                    ].map(([name, detail, progress, color]) => (
                      <button key={name} onClick={() => setActiveTool("chat")} className="focus-ring flex w-full items-center gap-3 rounded-xl p-3 text-left transition hover:bg-[var(--surface-soft)]">
                        <span className={`h-9 w-9 shrink-0 rounded-xl ${color} opacity-90`} />
                        <span className="min-w-0 flex-1"><span className="block truncate text-sm font-medium">{name}</span><span className="mt-1 block truncate text-xs muted">{detail}</span><span className="mt-2 block h-1.5 overflow-hidden rounded-full bg-[var(--surface-muted)]"><span className="block h-full rounded-full bg-[var(--accent)]" style={{ width: progress }} /></span></span>
                        <span className="text-xs muted">{progress}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="surface rounded-2xl p-5">
                  <div className="mb-4"><h2 className="font-semibold">Your weekly rhythm</h2><p className="mt-1 text-xs muted">Study time across the week</p></div>
                  <div className="flex h-32 items-end justify-between gap-2 px-1">
                    {[35, 62, 48, 84, 55, 72, 28].map((height, index) => <div key={index} className="flex h-full flex-1 flex-col items-center justify-end gap-2"><div className="flex w-full flex-1 items-end"><div className={`w-full rounded-t-md ${index === 3 ? "bg-[var(--accent)]" : "bg-[var(--accent-soft)]"}`} style={{ height: `${height}%` }} /></div><span className="text-[10px] muted">{["M","T","W","T","F","S","S"][index]}</span></div>)}
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-[var(--line)] pt-3"><span className="text-xs muted">Total this week</span><strong className="text-sm">12h 30m</strong></div>
                </div>
              </section>
            </div>
          ) : (
            <div className="tool-enter">
              {activeTool === "chat" && <AiChat user={user} />}
              {activeTool === "pdf" && <PdfNotes />}
              {activeTool === "mindmap" && <MindMap />}
              {activeTool === "quiz" && <Quiz />}
              {activeTool === "whiteboard" && <Whiteboard />}
              {activeTool === "podcast" && <Podcast />}
              {activeTool === "exam" && <ExamGenerator />}
            </div>
          )}
          <footer className="mt-10 flex flex-col gap-2 border-t border-[var(--line)] pt-5 text-xs muted sm:flex-row sm:items-center sm:justify-between">
            <span>StudyMate · A calmer way to study.</span><span>Frontend starter · Demo workspace</span>
          </footer>
        </div>
      </main>
    </div>
  );
}
