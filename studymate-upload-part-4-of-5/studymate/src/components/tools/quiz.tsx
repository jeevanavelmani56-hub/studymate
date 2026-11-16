"use client";

import { useState } from "react";
import { CheckCircle2, RotateCcw, XCircle } from "lucide-react";
import { quizQuestions } from "@/lib/data";
import { postJSON } from "@/lib/api-client";
import { ToolHeading } from "./tool-heading";

export function Quiz() {
  const [questions, setQuestions] = useState(quizQuestions);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [finished, setFinished] = useState(false);
  const [topic, setTopic] = useState("Operating Systems");
  const [difficulty, setDifficulty] = useState("medium");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const question = questions[index];
  const score = questions.reduce((total, item, i) => total + (answers[i] === item.answer ? 1 : 0), 0);
  const selected = answers[index];
  const choose = (option: number) => { if (selected !== undefined) return; setAnswers((current) => ({ ...current, [index]: option })); };
  const reset = () => { setIndex(0); setAnswers({}); setFinished(false); };
  const generate = async () => {
    setBusy(true); setError("");
    try {
      const result = await postJSON<{ quiz: { title: string; questions: { question: string; options: string[]; answerIndex: number; explanation: string }[] } }>("/api/quiz", { topic, difficulty, count: 5 });
      setQuestions(result.quiz.questions.map((item) => ({ question: item.question, options: item.options, answer: item.answerIndex, explanation: item.explanation })));
      setIndex(0); setAnswers({}); setFinished(false);
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Quiz generation failed."); }
    finally { setBusy(false); }
  };

  return <div>
    <ToolHeading eyebrow="Active recall" title="Quiz Generator" description="Create short practice rounds and get immediate feedback to reinforce what you have learned." />
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
      <section className="surface rounded-2xl p-5 sm:p-7">
        {!finished ? <>
          <div className="flex items-center justify-between gap-3"><span className="rounded-lg bg-[var(--accent-soft)] px-3 py-1.5 text-[11px] font-semibold accent-text">{topic}</span><span className="text-xs muted">Question {index + 1} of {questions.length}</span></div>
          <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-[var(--surface-muted)]"><div className="h-full rounded-full bg-[var(--accent)] transition-all" style={{ width: `${((index + 1) / questions.length) * 100}%` }} /></div>
          <h2 className="mt-8 max-w-2xl text-xl font-semibold leading-8 tracking-tight">{question.question}</h2>
          <div className="mt-6 space-y-3">{question.options.map((option, i) => {
            const isCorrect = selected !== undefined && i === question.answer;
            const isWrong = selected === i && selected !== question.answer;
            return <button key={option} onClick={() => choose(i)} disabled={selected !== undefined} className={`focus-ring flex w-full items-center gap-3 rounded-xl border p-4 text-left text-sm transition ${isCorrect ? "border-emerald-500 bg-emerald-500/10" : isWrong ? "border-rose-500 bg-rose-500/10" : "border-[var(--line)] hover:border-[var(--accent)] hover:bg-[var(--surface-soft)]"}`}><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[var(--surface-muted)] text-xs font-semibold">{String.fromCharCode(65 + i)}</span><span className="flex-1">{option}</span>{isCorrect && <CheckCircle2 size={17} className="text-emerald-600" />}{isWrong && <XCircle size={17} className="text-rose-500" />}</button>;
          })}</div>
          {selected !== undefined && <div className="mt-5 rounded-xl bg-[var(--surface-soft)] p-4"><p className="text-xs font-semibold">{selected === question.answer ? "That's correct." : "Not quite — here's why."}</p><p className="mt-1 text-xs leading-5 muted">{question.explanation}</p><button onClick={() => index === questions.length - 1 ? setFinished(true) : setIndex(index + 1)} className="mt-3 rounded-lg bg-[var(--accent)] px-4 py-2.5 text-xs font-semibold text-white">{index === questions.length - 1 ? "See results" : "Next question"}</button></div>}
        </> : <div className="flex min-h-[420px] flex-col items-center justify-center text-center"><span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--accent-soft)] accent-text"><CheckCircle2 size={30} /></span><h2 className="mt-5 text-2xl font-semibold">Round complete</h2><p className="mt-2 text-sm muted">You scored {score} out of {questions.length}.</p><p className="mt-5 text-4xl font-semibold tracking-tight accent-text">{Math.round((score / questions.length) * 100)}%</p><button onClick={reset} className="mt-7 inline-flex items-center gap-2 rounded-xl bg-[var(--accent)] px-4 py-3 text-xs font-semibold text-white"><RotateCcw size={15} /> Try again</button></div>}
      </section>
      <aside className="space-y-4">
        <div className="surface rounded-2xl p-5"><h3 className="text-sm font-semibold">Quiz settings</h3><label className="mt-4 block text-xs font-medium" htmlFor="quiz-topic">Topic</label><select id="quiz-topic" value={topic} onChange={(e) => setTopic(e.target.value)} className="mt-2 w-full rounded-xl border border-[var(--line)] bg-[var(--surface-soft)] px-3 py-3 text-xs outline-none"><option>Operating Systems</option><option>Database Management</option><option>Engineering Mathematics</option><option>Computer Networks</option></select><p className="mt-4 text-xs muted">Difficulty</p><select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="mt-2 w-full rounded-xl border border-[var(--line)] bg-[var(--surface-soft)] px-3 py-3 text-xs"><option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option></select><button onClick={generate} disabled={busy || !topic.trim()} className="mt-4 w-full rounded-xl bg-[var(--accent)] px-4 py-3 text-xs font-semibold text-white disabled:opacity-50">{busy ? "Generating..." : "Generate new quiz"}</button>{error && <p role="alert" className="mt-3 text-xs text-rose-500">{error}</p>}<p className="mt-4 text-[10px] leading-5 muted">Questions are generated on the server and validated before being returned.</p></div>
        <div className="surface rounded-2xl p-5"><h3 className="text-sm font-semibold">Your progress</h3><div className="mt-4 flex items-end justify-between"><span className="text-2xl font-semibold">{Object.keys(answers).length}/{questions.length}</span><span className="text-xs muted">Answered</span></div><div className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--surface-muted)]"><div className="h-full rounded-full bg-[var(--accent)]" style={{ width: `${Object.keys(answers).length / questions.length * 100}%` }} /></div><p className="mt-3 text-xs muted">Correct answers: {score}</p></div>
      </aside>
    </div>
  </div>;
}
