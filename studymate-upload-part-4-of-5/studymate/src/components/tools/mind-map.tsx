"use client";

import { useState } from "react";
import { Plus, Sparkles } from "lucide-react";
import { ToolHeading } from "./tool-heading";
import { postJSON } from "@/lib/api-client";

const nodes = [
  { x: 50, y: 50, w: 160, h: 54, title: "Process scheduling", sub: "CPU management", type: "root" },
  { x: 330, y: 10, w: 150, h: 54, title: "Algorithms", sub: "FCFS · SJF · RR", type: "blue" },
  { x: 330, y: 92, w: 150, h: 54, title: "Process states", sub: "Ready · Running", type: "teal" },
  { x: 330, y: 174, w: 150, h: 54, title: "Metrics", sub: "Waiting · Turnaround", type: "amber" },
  { x: 590, y: 10, w: 150, h: 54, title: "Time quantum", sub: "Round Robin", type: "purple" },
  { x: 590, y: 92, w: 150, h: 54, title: "Context switch", sub: "State transition", type: "teal" },
];

export function MindMap() {
  const [topic, setTopic] = useState("CPU Process Scheduling");
  const [generated, setGenerated] = useState(false);
  const [selected, setSelected] = useState("Process scheduling");
  const [result, setResult] = useState<{ title: string; centralIdea: string; branches: { title: string; details: string[] }[] } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const generate = async () => {
    setBusy(true); setError("");
    try { const data = await postJSON<{ mindMap: typeof result }>("/api/mindmap", { topic, level: "Undergraduate", detail: "balanced" }); setResult(data.mindMap); setGenerated(true); }
    catch (caught) { setError(caught instanceof Error ? caught.message : "Mind map generation failed."); }
    finally { setBusy(false); }
  };
  return <div>
    <ToolHeading eyebrow="Visual learning" title="Mind Map & Flowchart" description="See how complex concepts connect. Explore this sample node map or enter a topic to preview a new generation request." action={<button onClick={generate} className="inline-flex items-center gap-2 rounded-xl bg-[var(--accent)] px-4 py-2.5 text-xs font-semibold text-white"><Sparkles size={15} /> {busy ? "Generating..." : "Generate map"}</button>} />
    <div className="surface rounded-2xl p-4 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row"><input value={topic} onChange={(e) => setTopic(e.target.value)} aria-label="Mind map topic" className="min-h-11 flex-1 rounded-xl border border-[var(--line)] bg-[var(--surface-soft)] px-3 text-sm outline-none focus:border-[var(--accent)]" /><button onClick={generate} className="rounded-xl border border-[var(--line)] px-4 py-2.5 text-xs font-semibold hover:bg-[var(--surface-soft)]">Update topic</button></div>
      {error && <p role="alert" className="mt-3 text-xs text-rose-500">{error}</p>}{generated && result && <div className="mt-4 rounded-xl bg-[var(--accent-soft)] p-4"><p className="text-sm font-semibold accent-text">{result.title}</p><p className="mt-1 text-xs">{result.centralIdea}</p><div className="mt-3 grid gap-2 sm:grid-cols-2">{result.branches.map((branch) => <div key={branch.title} className="rounded-lg border border-[var(--line)] bg-[var(--surface)] p-3"><p className="text-xs font-semibold">{branch.title}</p><ul className="mt-2 list-disc space-y-1 pl-4 text-[11px] muted">{branch.details.map((detail) => <li key={detail}>{detail}</li>)}</ul></div>)}</div></div>}
      <div className="app-scrollbar mt-5 overflow-x-auto rounded-xl bg-[var(--surface-soft)] p-4">
        <div className="relative h-[300px] min-w-[780px]">
          <svg className="absolute inset-0 h-full w-full" viewBox="0 0 780 270" fill="none" aria-hidden="true"><path d="M210 77 C270 77 270 37 330 37 M210 77 C270 77 270 119 330 119 M210 77 C270 77 270 201 330 201 M480 37 C535 37 535 37 590 37 M480 119 C535 119 535 119 590 119" stroke="var(--muted)" strokeOpacity=".5" strokeWidth="2" strokeDasharray="4 5" /></svg>
          {nodes.map((node) => <button key={node.title} onClick={() => setSelected(node.title)} style={{ left: node.x, top: node.y, width: node.w, height: node.h }} className={`absolute z-10 rounded-xl border px-3 text-left transition ${selected === node.title ? "border-[var(--accent)] bg-[var(--accent-soft)] shadow-md" : "border-[var(--line)] bg-[var(--surface)] hover:border-[var(--accent)]"}`}><span className="block text-xs font-semibold">{node.title}</span><span className="mt-1 block text-[10px] muted">{node.sub}</span></button>)}
        </div>
      </div>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-xs font-semibold">Selected node: {selected}</p><p className="mt-1 text-[11px] muted">Choose a node to inspect its connection.</p></div><button onClick={() => setSelected("Process scheduling")} className="inline-flex items-center gap-2 self-start rounded-lg border border-[var(--line)] px-3 py-2 text-xs font-medium"><Plus size={14} /> Reset view</button></div>
    </div>
    <div className="mt-4 grid gap-3 sm:grid-cols-3">{[["Core concept","How the CPU chooses a process"],["Key branches","Algorithms, states and metrics"],["Study prompt","Compare Round Robin and SJF"]].map(([title, desc]) => <div key={title} className="surface rounded-xl p-4"><p className="text-xs font-semibold">{title}</p><p className="mt-1 text-xs leading-5 muted">{desc}</p></div>)}</div>
  </div>;
}
