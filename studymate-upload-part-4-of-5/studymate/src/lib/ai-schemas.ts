import { ApiError } from "@/lib/server";

export type MindMapResult = { title: string; centralIdea: string; branches: { title: string; details: string[] }[] };
export type QuizResult = { title: string; questions: { question: string; options: string[]; answerIndex: number; explanation: string }[] };
export type ModelPaperResult = { title: string; instructions: string[]; sections: { name: string; marks: number; questions: { number: number; text: string; marks: number; type: string }[] }[]; totalMarks: number; durationMinutes: number };

function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new ApiError(502, "The AI returned data in an unexpected format.");
  return value as Record<string, unknown>;
}
function text(value: unknown, label: string, max = 500): string {
  if (typeof value !== "string" || !value.trim() || value.length > max) throw new ApiError(502, `The AI response is missing a valid ${label}.`);
  return value.trim();
}

export function validateMindMap(value: unknown): MindMapResult {
  const data = record(value);
  if (!Array.isArray(data.branches) || data.branches.length < 2 || data.branches.length > 8) throw new ApiError(502, "The generated mind map has an invalid number of branches.");
  return {
    title: text(data.title, "title", 120),
    centralIdea: text(data.centralIdea, "central idea", 240),
    branches: data.branches.map((item) => {
      const branch = record(item);
      if (!Array.isArray(branch.details) || branch.details.length > 6) throw new ApiError(502, "A mind map branch contains invalid details.");
      return { title: text(branch.title, "branch title", 120), details: branch.details.map((detail) => text(detail, "branch detail", 180)) };
    }),
  };
}

export function validateQuiz(value: unknown): QuizResult {
  const data = record(value);
  if (!Array.isArray(data.questions) || data.questions.length < 3 || data.questions.length > 15) throw new ApiError(502, "The generated quiz has an invalid question count.");
  return {
    title: text(data.title, "quiz title", 120),
    questions: data.questions.map((item) => {
      const question = record(item);
      if (!Array.isArray(question.options) || question.options.length !== 4) throw new ApiError(502, "Each quiz question must have exactly four options.");
      const answerIndex = question.answerIndex;
      if (!Number.isInteger(answerIndex) || Number(answerIndex) < 0 || Number(answerIndex) > 3) throw new ApiError(502, "A quiz answer key is invalid.");
      return { question: text(question.question, "question", 600), options: question.options.map((option) => text(option, "option", 240)), answerIndex: Number(answerIndex), explanation: text(question.explanation, "explanation", 600) };
    }),
  };
}

export function validateModelPaper(value: unknown): ModelPaperResult {
  const data = record(value);
  if (!Array.isArray(data.sections) || data.sections.length < 1 || data.sections.length > 6) throw new ApiError(502, "The generated paper has an invalid section layout.");
  const sections = data.sections.map((item) => {
    const section = record(item);
    if (!Array.isArray(section.questions) || section.questions.length < 1 || section.questions.length > 30) throw new ApiError(502, "A paper section contains an invalid question list.");
    return {
      name: text(section.name, "section name", 100),
      marks: Number(section.marks),
      questions: section.questions.map((item) => {
        const question = record(item);
        const number = Number(question.number);
        const marks = Number(question.marks);
        if (!Number.isInteger(number) || number < 1 || !Number.isInteger(marks) || marks < 1 || marks > 30) throw new ApiError(502, "A generated paper question has invalid numbering or marks.");
        return { number, text: text(question.text, "question text", 1000), marks, type: text(question.type, "question type", 60) };
      }),
    };
  });
  for (const section of sections) {
    if (!Number.isInteger(section.marks) || section.marks < 1 || section.questions.reduce((sum, question) => sum + question.marks, 0) !== section.marks) {
      throw new ApiError(502, "A generated paper section has inconsistent marks. Please retry.");
    }
  }
  const totalMarks = Number(data.totalMarks);
  const durationMinutes = Number(data.durationMinutes);
  if (!Number.isInteger(totalMarks) || totalMarks < 1 || totalMarks > 300 || !Number.isInteger(durationMinutes) || durationMinutes < 15 || durationMinutes > 360) throw new ApiError(502, "The generated paper has invalid exam settings.");
  return { title: text(data.title, "paper title", 180), instructions: Array.isArray(data.instructions) ? data.instructions.slice(0, 8).map((item) => text(item, "instruction", 300)) : [], sections, totalMarks, durationMinutes };
}
