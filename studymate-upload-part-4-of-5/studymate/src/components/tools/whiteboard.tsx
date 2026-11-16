"use client";

import { useRef, useState } from "react";
import type { PointerEvent } from "react";
import { Eraser, PenLine, RotateCcw, Sparkles } from "lucide-react";
import { ToolHeading } from "./tool-heading";

export function Whiteboard() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [drawing, setDrawing] = useState(false);
  const [tool, setTool] = useState<"pen" | "eraser">("pen");
  const [message, setMessage] = useState("Try sketching a flow or writing out a problem.");
  const point = (event: PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return { x: (event.clientX - rect.left) * (canvas.width / rect.width), y: (event.clientY - rect.top) * (canvas.height / rect.height) };
  };
  const start = (event: PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    canvas.setPointerCapture(event.pointerId);
    const ctx = canvas.getContext("2d")!;
    const p = point(event);
    ctx.beginPath(); ctx.moveTo(p.x, p.y); setDrawing(true);
  };
  const move = (event: PointerEvent<HTMLCanvasElement>) => {
    if (!drawing) return;
    const ctx = canvasRef.current!.getContext("2d")!;
    const p = point(event);
    ctx.lineWidth = tool === "eraser" ? 22 : 3;
    ctx.lineCap = "round"; ctx.lineJoin = "round";
    ctx.strokeStyle = tool === "eraser" ? (document.documentElement.classList.contains("dark") ? "#172329" : "#ffffff") : "#087f78";
    ctx.lineTo(p.x, p.y); ctx.stroke();
  };
  const clear = () => { const canvas = canvasRef.current; if (canvas) canvas.getContext("2d")?.clearRect(0, 0, canvas.width, canvas.height); };
  return <div>
    <ToolHeading eyebrow="Think visually" title="AI Whiteboard" description="Sketch a diagram, map out a process, or work through a problem step by step. Drawing works locally in your browser." action={<button onClick={() => setMessage("AI drawing is a future integration. Connect a multimodal model to turn prompts into diagram instructions.")} className="inline-flex items-center gap-2 rounded-xl bg-[var(--accent)] px-4 py-2.5 text-xs font-semibold text-white"><Sparkles size={15} /> Ask AI to sketch</button>} />
    <div className="surface overflow-hidden rounded-2xl">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--line)] px-4 py-3"><div className="flex items-center gap-2"><button onClick={() => setTool("pen")} aria-pressed={tool === "pen"} className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs ${tool === "pen" ? "bg-[var(--accent-soft)] accent-text" : "hover:bg-[var(--surface-soft)]"}`}><PenLine size={15} /> Pen</button><button onClick={() => setTool("eraser")} aria-pressed={tool === "eraser"} className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs ${tool === "eraser" ? "bg-[var(--accent-soft)] accent-text" : "hover:bg-[var(--surface-soft)]"}`}><Eraser size={15} /> Eraser</button></div><button onClick={clear} className="inline-flex items-center gap-2 rounded-lg border border-[var(--line)] px-3 py-2 text-xs"><RotateCcw size={14} /> Clear board</button></div>
      <div className="bg-[var(--surface)] p-2 sm:p-4"><canvas ref={canvasRef} width={1200} height={620} onPointerDown={start} onPointerMove={move} onPointerUp={() => setDrawing(false)} onPointerCancel={() => setDrawing(false)} className="h-[420px] w-full touch-none rounded-xl border border-[var(--line)] bg-white [background-image:radial-gradient(#d7e0e2_1px,transparent_1px)] [background-size:22px_22px]" aria-label="Interactive drawing canvas" /></div>
      <div className="border-t border-[var(--line)] px-4 py-3 text-xs muted" role="status">{message}</div>
    </div>
  </div>;
}
