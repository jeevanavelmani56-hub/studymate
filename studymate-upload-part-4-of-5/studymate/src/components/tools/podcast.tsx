"use client";

import { useEffect, useState } from "react";
import { Headphones, Pause, Play, SkipBack, SkipForward, FileText } from "lucide-react";
import { formatDuration } from "@/lib/utils";
import { ToolHeading } from "./tool-heading";

const transcript = [
  ["00:00", "Welcome back. In this episode, we're making process scheduling easier to understand."],
  ["00:34", "Think of the CPU as a shared resource. Scheduling decides which ready process gets to use it next."],
  ["01:12", "First Come First Served is simple: processes run in arrival order. It is easy to implement, but a long task can make others wait."],
  ["02:04", "Round Robin gives each process a small time slice, then moves to the next. This makes interactive systems feel more responsive."],
  ["03:02", "The key takeaway: compare algorithms using waiting time, turnaround time, and response time."],
];

export function Podcast() {
  const duration = 218;
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [tab, setTab] = useState<"transcript" | "notes">("transcript");

  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => setTime((value) => value >= duration ? 0 : value + 1), 1000);
    return () => window.clearInterval(timer);
  }, [playing]);

  return <div>
    <ToolHeading eyebrow="Listen and learn" title="Voice Tutor" description="Turn a topic into a focused audio lesson, then follow along with the transcript and key takeaways." />
    <div className="grid gap-4 lg:grid-cols-[.9fr_1.1fr]">
      <section className="surface rounded-2xl p-5 sm:p-7">
        <div className="flex aspect-[16/9] items-center justify-center overflow-hidden rounded-2xl bg-[#18353a]"><div className="relative flex h-40 w-40 items-center justify-center rounded-full border border-[#8ed8cb]/25 bg-[#8ed8cb]/10"><div className="absolute h-32 w-32 rounded-full border border-[#8ed8cb]/20" /><div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#8ed8cb] text-[#163a38]"><Headphones size={34} /></div></div></div>
        <div className="mt-6"><p className="text-[10px] font-semibold uppercase tracking-[.17em] accent-text">StudyMate audio lesson</p><h2 className="mt-2 text-xl font-semibold tracking-tight">Understanding CPU Scheduling</h2><p className="mt-2 text-xs muted">Operating Systems · 4 min · Beginner friendly</p></div>
        <div className="mt-6 flex items-center gap-1.5">{Array.from({ length: 44 }).map((_, i) => <span key={i} className={`wave-bar flex-1 rounded-full ${i < time / duration * 44 ? "bg-[var(--accent)]" : "bg-[var(--surface-muted)]"}`} style={{ height: `${12 + ((i * 17) % 29)}px`, animationDelay: `${i * 23}ms` }} />)}</div>
        <input aria-label="Audio progress" type="range" min={0} max={duration} value={time} onChange={(e) => setTime(Number(e.target.value))} className="mt-4 w-full accent-[var(--accent)]" />
        <div className="flex justify-between text-[10px] muted"><span>{formatDuration(time)}</span><span>{formatDuration(duration)}</span></div>
        <div className="mt-5 flex items-center justify-center gap-7"><button onClick={() => setTime(Math.max(0, time - 15))} aria-label="Back 15 seconds" className="muted"><SkipBack size={20} /></button><button onClick={() => setPlaying(!playing)} aria-label={playing ? "Pause audio" : "Play audio"} className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--accent)] text-white transition hover:scale-105">{playing ? <Pause size={22} /> : <Play size={22} className="ml-1" />}</button><button onClick={() => setTime(Math.min(duration, time + 15))} aria-label="Forward 15 seconds" className="muted"><SkipForward size={20} /></button></div>
        <p className="mt-4 text-center text-[10px] muted">Playback is a UI demo. Connect generated audio or text-to-speech for real lessons.</p>
      </section>
      <section className="surface rounded-2xl p-5 sm:p-6">
        <div className="flex gap-2 border-b border-[var(--line)] pb-3"><button onClick={() => setTab("transcript")} className={`rounded-lg px-3 py-2 text-xs font-medium ${tab === "transcript" ? "bg-[var(--accent-soft)] accent-text" : "muted"}`}>Transcript</button><button onClick={() => setTab("notes")} className={`rounded-lg px-3 py-2 text-xs font-medium ${tab === "notes" ? "bg-[var(--accent-soft)] accent-text" : "muted"}`}>Key takeaways</button></div>
        {tab === "transcript" ? <div className="app-scrollbar mt-4 max-h-[440px] space-y-5 overflow-y-auto">{transcript.map(([stamp, text]) => <div key={stamp} className="flex gap-3"><span className="shrink-0 rounded-md bg-[var(--surface-soft)] px-2 py-1 font-mono text-[10px] muted">{stamp}</span><p className="text-sm leading-6">{text}</p></div>)}</div> : <div className="mt-5 space-y-3">{["FCFS runs processes in order of arrival.", "Round Robin uses a fixed time quantum.", "Compare scheduling with waiting, turnaround and response time.", "A context switch changes the CPU from one process to another."].map((item, i) => <div key={item} className="flex gap-3 rounded-xl bg-[var(--surface-soft)] p-3"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-[var(--accent-soft)] text-[10px] font-semibold accent-text">{i + 1}</span><p className="text-xs leading-5">{item}</p></div>)}</div>}
        <button onClick={() => setTab("notes")} className="mt-5 inline-flex items-center gap-2 text-xs font-semibold accent-text"><FileText size={15} /> Review lesson notes</button>
      </section>
    </div>
  </div>;
}
