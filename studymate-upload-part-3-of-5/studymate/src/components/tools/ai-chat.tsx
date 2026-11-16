"use client";

import { useRef, useState } from "react";
import { Bot, FileUp, Paperclip, Send, Sparkles, UserRound } from "lucide-react";
import { postJSON, uploadPDF } from "@/lib/api-client";
import { ToolHeading } from "./tool-heading";

type Message = { role: "assistant" | "user"; text: string };

const starterFor = (user: string): Message[] => [{ role: "assistant", text: `Hi ${user}! I'm your StudyMate tutor. Ask me about a topic and I'll break it into simple steps, examples, and key takeaways. What are you working on today?` }];

export function AiChat({ user }: { user: string }) {
  const starter = starterFor(user);
  const [messages, setMessages] = useState<Message[]>(starter);
  const [prompt, setPrompt] = useState("");
  const [fileName, setFileName] = useState("");
  const [documentText, setDocumentText] = useState("");
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const send = async () => {
    const value = prompt.trim();
    if (!value || busy) return;
    const previous = messages.filter((message) => message.text !== starter[0].text).slice(-10);
    setMessages((current) => [...current, { role: "user", text: value }]);
    setPrompt("");
    setBusy(true);
    try {
      const result = await postJSON<{ answer: string }>("/api/chat", {
        message: value,
        history: previous.map((message) => ({ role: message.role, content: message.text })),
        documentContext: documentText,
      });
      setMessages((current) => [...current, { role: "assistant", text: result.answer }]);
    } catch (error) {
      setMessages((current) => [...current, { role: "assistant", text: error instanceof Error ? error.message : "Unable to reach StudyMate AI." }]);
    } finally { setBusy(false); }
  };

  const attach = async (file?: File) => {
    if (!file) return;
    if (file.type !== "application/pdf") { setFileName("Please choose a PDF file."); return; }
    setFileName(`Processing ${file.name}...`);
    try {
      const document = await uploadPDF(file);
      setDocumentText(document.text);
      setFileName(`${document.name} · ${document.pages ?? "?"} pages${document.truncated ? " · text shortened" : ""}`);
    } catch (error) {
      setDocumentText("");
      setFileName(error instanceof Error ? error.message : "PDF processing failed.");
    }
  };

  return <div>
    <ToolHeading eyebrow="Your AI tutor" title="AI Study Chat" description="Ask questions, unpack difficult ideas, and turn confusion into clear next steps." />
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_280px]">
      <section className="surface flex min-h-[620px] flex-col overflow-hidden rounded-2xl">
        <div className="flex items-center justify-between border-b border-[var(--line)] px-5 py-4"><div className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--accent-soft)] accent-text"><Bot size={18} /></span><div><p className="text-sm font-semibold">StudyMate AI</p><p className="text-[11px] muted">Concept explainer · Connected tutor</p></div></div><span className="flex items-center gap-1.5 text-[10px] muted"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Ready</span></div>
        <div className="app-scrollbar flex-1 space-y-5 overflow-y-auto p-4 sm:p-6" aria-live="polite">
          {messages.map((message, index) => <div key={index} className={`flex gap-3 ${message.role === "user" ? "flex-row-reverse" : ""}`}><span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${message.role === "assistant" ? "bg-[var(--accent-soft)] accent-text" : "bg-[var(--surface-muted)]"}`}>{message.role === "assistant" ? <Bot size={16} /> : <UserRound size={16} />}</span><div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-6 ${message.role === "assistant" ? "bg-[var(--surface-soft)]" : "bg-[#dff2ee] text-[#173d39]"}`}><p className="whitespace-pre-wrap">{message.text}</p></div></div>)}
          {busy && <div className="flex items-center gap-2 text-xs muted"><span className="flex gap-1"><i className="h-1.5 w-1.5 animate-bounce rounded-full bg-[var(--accent)]" /><i className="h-1.5 w-1.5 animate-bounce rounded-full bg-[var(--accent)] [animation-delay:120ms]" /><i className="h-1.5 w-1.5 animate-bounce rounded-full bg-[var(--accent)] [animation-delay:240ms]" /></span>Preparing an explanation...</div>}
        </div>
        <div className="border-t border-[var(--line)] p-4">
          {fileName && <div className="mb-2 flex items-center justify-between rounded-lg bg-[var(--surface-soft)] px-3 py-2 text-xs"><span className="truncate">{fileName}</span><button onClick={() => { setFileName(""); setDocumentText(""); }} className="ml-3 muted">Remove</button></div>}
          <div className="flex items-end gap-2 rounded-xl border border-[var(--line)] bg-[var(--surface-soft)] p-2">
            <input ref={inputRef} type="file" accept="application/pdf" className="hidden" onChange={(event) => attach(event.target.files?.[0])} />
            <button onClick={() => inputRef.current?.click()} aria-label="Attach PDF" className="focus-ring rounded-lg p-2.5 muted hover:bg-[var(--surface-muted)]"><Paperclip size={17} /></button>
            <textarea value={prompt} onChange={(event) => setPrompt(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); send(); } }} rows={1} placeholder="Ask anything about your topic..." className="max-h-28 min-h-10 flex-1 resize-y bg-transparent px-1 py-2 text-sm outline-none placeholder:text-[var(--muted)]" />
            <button onClick={send} disabled={!prompt.trim() || busy} aria-label="Send message" className="focus-ring rounded-lg bg-[var(--accent)] p-2.5 text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"><Send size={16} /></button>
          </div>
          <p className="mt-2 text-center text-[10px] muted">AI answers are generated securely on the server. Uploaded PDF text stays in this browser session.</p>
        </div>
      </section>
      <aside className="space-y-4">
        <div className="surface rounded-2xl p-5"><div className="mb-3 flex items-center gap-2"><Sparkles size={16} className="accent-text" /><h2 className="text-sm font-semibold">Try asking</h2></div><div className="space-y-2">{["Explain process scheduling with an example", "Compare stack and queue", "Give me a 5-minute revision plan"].map((item) => <button key={item} onClick={() => setPrompt(item)} className="focus-ring w-full rounded-xl bg-[var(--surface-soft)] px-3 py-3 text-left text-xs leading-5 transition hover:bg-[var(--accent-soft)]">{item}</button>)}</div></div>
        <label onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); attach(event.dataTransfer.files?.[0]); }} className="surface flex cursor-pointer flex-col items-center rounded-2xl border-dashed p-6 text-center transition hover:border-[var(--accent)]"><span className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--accent-soft)] accent-text"><FileUp size={20} /></span><span className="text-sm font-semibold">Add a study PDF</span><span className="mt-1 text-xs leading-5 muted">Drop a file here or browse your device</span><span className="mt-4 rounded-lg border border-[var(--line)] px-3 py-2 text-xs font-medium">Choose PDF</span><input type="file" accept="application/pdf" className="sr-only" onChange={(event) => attach(event.target.files?.[0])} /></label>
        <div className="rounded-2xl bg-[var(--accent-soft)] p-5"><p className="text-xs font-semibold accent-text">Study tip</p><p className="mt-2 text-sm leading-6">Ask the tutor to explain a concept in your own course context, then request a short quiz to check your understanding.</p></div>
      </aside>
    </div>
  </div>;
}
