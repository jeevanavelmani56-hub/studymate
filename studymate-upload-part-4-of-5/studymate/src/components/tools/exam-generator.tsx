"use client";

import { useState } from "react";
import { Download, FileQuestion, Sparkles } from "lucide-react";
import { ToolHeading } from "./tool-heading";
import { downloadText } from "@/lib/utils";
import { postJSON, uploadPDF } from "@/lib/api-client";

export function ExamGenerator() {
  const [source, setSource] = useState("");
  const [sourceFile, setSourceFile] = useState("");
  const [subject, setSubject] = useState("Engineering Mathematics");
  const [marks, setMarks] = useState("75");
  const [duration, setDuration] = useState("3 hours");
  const [format, setFormat] = useState("University pattern");
  const [generated, setGenerated] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [sourceText, setSourceText] = useState("");
  const [paperText, setPaperText] = useState("");

  const generate = async () => {
    setBusy(true); setError(""); setGenerated(false);
    try {
      const durationMinutes = duration === "2 hours" ? 120 : duration === "2.5 hours" ? 150 : 180;
      const result = await postJSON<{ paper: { title: string; instructions: string[]; totalMarks: number; durationMinutes: number; sections: { name: string; marks: number; questions: { number: number; text: string; marks: number; type: string }[] }[] } }>("/api/model-paper", {
        subject, topics: source || "Create a balanced paper covering the core units of this subject.", totalMarks: Number(marks), durationMinutes, sourceText,
        questionTypes: format === "Unit-wise practice" ? ["unit-wise", "short answer", "long answer"] : format === "Mixed difficulty" ? ["easy", "moderate", "challenging"] : ["short answer", "descriptive", "application-based"],
      });
      const generatedText = `${result.paper.title}\n${result.paper.totalMarks} marks | ${result.paper.durationMinutes} minutes\n\n${result.paper.instructions.map((item) => `• ${item}`).join("\n")}\n\n${result.paper.sections.map((section) => `${section.name} (${section.marks} marks)\n${section.questions.map((q) => `${q.number}. [${q.marks} marks] ${q.text}`).join("\n")}`).join("\n\n")}\n\nPractice paper only — not a prediction of the actual examination.`;
      setPaperText(generatedText); setGenerated(true);
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Paper generation failed."); }
    finally { setBusy(false); }
  };

  return <div>
    <ToolHeading eyebrow="Exam preparation" title="Model Question Papers" description="Configure a practice paper using your subject, exam pattern and source material. Use it to structure revision, not as a guarantee of exam questions." />
    <div className="grid gap-4 lg:grid-cols-[.9fr_1.1fr]">
      <section className="surface rounded-2xl p-5 sm:p-6">
        <div className="flex items-center gap-2"><FileQuestion size={18} className="accent-text" /><h2 className="text-sm font-semibold">Paper configuration</h2></div>
        <label className="mt-5 block text-xs font-medium" htmlFor="subject">Subject</label><input id="subject" value={subject} onChange={(e) => setSubject(e.target.value)} className="mt-2 w-full rounded-xl border border-[var(--line)] bg-[var(--surface-soft)] px-3 py-3 text-sm outline-none focus:border-[var(--accent)]" />
        <div className="mt-4 grid grid-cols-2 gap-3"><div><label className="block text-xs font-medium" htmlFor="marks">Total marks</label><select id="marks" value={marks} onChange={(e) => setMarks(e.target.value)} className="mt-2 w-full rounded-xl border border-[var(--line)] bg-[var(--surface-soft)] px-3 py-3 text-xs"><option>50</option><option>75</option><option>100</option></select></div><div><label className="block text-xs font-medium" htmlFor="duration">Duration</label><select id="duration" value={duration} onChange={(e) => setDuration(e.target.value)} className="mt-2 w-full rounded-xl border border-[var(--line)] bg-[var(--surface-soft)] px-3 py-3 text-xs"><option>2 hours</option><option>2.5 hours</option><option>3 hours</option></select></div></div>
        <label className="mt-4 block text-xs font-medium" htmlFor="format">Question paper format</label><select id="format" value={format} onChange={(e) => setFormat(e.target.value)} className="mt-2 w-full rounded-xl border border-[var(--line)] bg-[var(--surface-soft)] px-3 py-3 text-xs"><option>University pattern</option><option>Unit-wise practice</option><option>Mixed difficulty</option></select>
        <label className="mt-4 block text-xs font-medium" htmlFor="previous-paper">Previous-year paper PDF or text file (optional)</label><input id="previous-paper" type="file" accept="application/pdf,.txt,text/plain" onChange={async (event) => { const selected = event.target.files?.[0]; setSourceFile(selected?.name ?? ""); if (!selected) return; if (selected.type === "application/pdf") { try { const doc = await uploadPDF(selected); setSourceText(doc.text); } catch (caught) { setError(caught instanceof Error ? caught.message : "Could not read PDF."); } } else if (selected.name.toLowerCase().endsWith(".txt")) { setSourceText(await selected.text()); } else { setError("Choose a PDF or text file."); } }} className="mt-2 block w-full text-xs file:mr-3 file:rounded-lg file:border-0 file:bg-[var(--accent-soft)] file:px-3 file:py-2 file:text-xs file:font-semibold file:text-[var(--accent)]" />{sourceFile && <p className="mt-2 text-[11px] accent-text">Selected: {sourceFile} · text extracted for pattern analysis.</p>}<label className="mt-4 block text-xs font-medium" htmlFor="source">Or paste syllabus / question pattern</label><textarea id="source" value={source} onChange={(e) => setSource(e.target.value)} rows={5} placeholder="Paste syllabus units, question patterns, or text extracted from a previous paper..." className="mt-2 w-full resize-y rounded-xl border border-[var(--line)] bg-[var(--surface-soft)] p-3 text-xs leading-5 outline-none focus:border-[var(--accent)]" />
        <button onClick={generate} disabled={!subject.trim()} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-4 py-3 text-xs font-semibold text-white disabled:opacity-40"><Sparkles size={15} /> {busy ? "Generating..." : "Generate practice paper"}</button>
        <p className="mt-3 text-[10px] leading-5 muted">Generated papers are for practice, not predictions of actual exam questions.</p>{error && <p role="alert" className="mt-2 text-xs text-rose-500">{error}</p>}
      </section>
      <section className="surface min-h-[560px] rounded-2xl p-5 sm:p-7">
        <div className="flex items-center justify-between border-b border-[var(--line)] pb-4"><div><p className="text-[10px] font-semibold uppercase tracking-[.16em] accent-text">Preview</p><h2 className="mt-1 text-sm font-semibold">Your model paper</h2></div>{generated && <button onClick={() => downloadText("studymate-model-paper.txt", paperText)} className="inline-flex items-center gap-2 rounded-lg border border-[var(--line)] px-3 py-2 text-xs font-semibold"><Download size={14} /> Export</button>}</div>
        {generated ? <div className="mt-5 whitespace-pre-wrap font-mono text-xs leading-7">{paperText}</div> : <div className="flex min-h-[430px] flex-col items-center justify-center text-center"><span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--accent-soft)] accent-text"><FileQuestion size={25} /></span><h3 className="mt-4 text-sm font-semibold">Your paper will appear here</h3><p className="mt-2 max-w-xs text-xs leading-5 muted">Choose your subject and exam settings, then generate a practice paper preview.</p></div>}
      </section>
    </div>
  </div>;
}
