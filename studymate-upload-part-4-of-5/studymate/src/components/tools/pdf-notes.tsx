"use client";

import { useRef, useState } from "react";
import { Download, FileText, FileUp, Search, BookOpen } from "lucide-react";
import { ToolHeading } from "./tool-heading";
import { postJSON, uploadPDF } from "@/lib/api-client";

export function PdfNotes() {
  const input = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [dragging, setDragging] = useState(false);
  const [documentText, setDocumentText] = useState("");
  const [busy, setBusy] = useState(false);

  const choose = async (candidate?: File) => {
    if (!candidate) return;
    if (candidate.type !== "application/pdf") { setAnswer("That file is not a PDF. Please choose a PDF document."); return; }
    setFile(candidate); setAnswer("Extracting text from your PDF..."); setBusy(true);
    try {
      const document = await uploadPDF(candidate);
      setDocumentText(document.text);
      setAnswer(`Ready: ${document.name} (${document.pages ?? "?"} pages). You can now ask questions.`);
    } catch (error) {
      setDocumentText("");
      setAnswer(error instanceof Error ? error.message : "PDF processing failed.");
    } finally { setBusy(false); }
  };

  const askDocument = async () => {
    if (!documentText || !question.trim() || busy) return;
    setBusy(true); setAnswer("StudyMate is reading your document...");
    try {
      const result = await postJSON<{ answer: string }>("/api/pdf/ask", { question, documentText, documentName: file?.name });
      setAnswer(result.answer);
    } catch (error) { setAnswer(error instanceof Error ? error.message : "Unable to answer from this PDF."); }
    finally { setBusy(false); }
  };

  return <div>
    <ToolHeading eyebrow="Document workspace" title="PDF Notes" description="Upload lecture notes and ask questions grounded in the extracted document text." />
    <div className="grid gap-4 lg:grid-cols-[.9fr_1.1fr]">
      <section className="surface rounded-2xl p-5 sm:p-6">
        <h2 className="text-sm font-semibold">Your document</h2>
        <p className="mt-1 text-xs muted">PDF files up to the size limit you configure on your server.</p>
        <button onClick={() => input.current?.click()} onDragOver={(e) => { e.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={(e) => { e.preventDefault(); setDragging(false); choose(e.dataTransfer.files?.[0]); }} className={`focus-ring mt-5 flex min-h-56 w-full flex-col items-center justify-center rounded-2xl border border-dashed p-6 text-center transition ${dragging ? "border-[var(--accent)] bg-[var(--accent-soft)]" : "border-[var(--line)] bg-[var(--surface-soft)] hover:border-[var(--accent)]"}`}>
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--accent-soft)] accent-text"><FileUp size={22} /></span><span className="mt-4 text-sm font-semibold">{file ? file.name : "Drop your PDF here"}</span><span className="mt-1 text-xs muted">{file ? `${(file.size / 1024 / 1024).toFixed(2)} MB · Selected` : "or browse files from your device"}</span><span className="mt-4 rounded-lg bg-[var(--accent)] px-4 py-2.5 text-xs font-semibold text-white">Browse files</span>
        </button>
        <input ref={input} type="file" accept="application/pdf" className="hidden" onChange={(e) => choose(e.target.files?.[0])} />
        {file && <div className="mt-4 flex items-center justify-between rounded-xl border border-[var(--line)] p-3"><div className="flex min-w-0 items-center gap-3"><FileText className="shrink-0 accent-text" size={19} /><div className="min-w-0"><p className="truncate text-xs font-medium">{file.name}</p><p className="text-[10px] muted">Ready for document processing</p></div></div><button onClick={() => { setFile(null); setDocumentText(""); setAnswer(""); }} className="text-xs muted">Remove</button></div>}
        {answer && <p role="status" className="mt-3 text-xs accent-text">{answer}</p>}
      </section>
      <section className="surface rounded-2xl p-5 sm:p-6">
        <div className="flex items-center gap-2"><Search size={17} className="accent-text" /><h2 className="text-sm font-semibold">Ask your document</h2></div>
        <p className="mt-1 text-xs muted">Ask for a summary, key definitions, or explanations from the selected PDF.</p>
        <label className="mt-5 block text-xs font-medium" htmlFor="pdf-question">Your question</label>
        <textarea id="pdf-question" value={question} onChange={(e) => setQuestion(e.target.value)} rows={4} placeholder="Summarise chapter 2 and list the important definitions..." className="mt-2 w-full resize-y rounded-xl border border-[var(--line)] bg-[var(--surface-soft)] p-3 text-sm outline-none focus:border-[var(--accent)]" />
        <button disabled={!file || !documentText || !question.trim() || busy} onClick={askDocument} className="mt-3 inline-flex items-center gap-2 rounded-xl bg-[var(--accent)] px-4 py-3 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"><BookOpen size={15} /> {busy ? "Working..." : "Ask about this PDF"}</button>
        {answer && <div className="mt-4 rounded-xl bg-[var(--surface-soft)] p-4 text-xs leading-6 muted">{answer}</div>}
      </section>
    </div>
    <div className="surface mt-4 rounded-2xl p-5"><div className="flex items-center gap-3"><Download size={18} className="accent-text" /><div><h3 className="text-sm font-semibold">Document processing integration</h3><p className="mt-1 text-xs leading-5 muted">Recommended flow: upload to a private storage bucket → extract text server-side → chunk and index → retrieve relevant passages → generate cited answers.</p></div></div></div>
  </div>;
}
