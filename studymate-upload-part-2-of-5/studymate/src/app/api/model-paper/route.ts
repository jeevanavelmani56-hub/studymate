import { NextResponse } from "next/server";
import { generateJSON } from "@/lib/ai";
import { validateModelPaper } from "@/lib/ai-schemas";
import { enforceRateLimit, jsonError, optionalText, requireInteger, requireText, ApiError } from "@/lib/server";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    enforceRateLimit(request, "model-paper");
    const body = await request.json() as { subject?: unknown; topics?: unknown; totalMarks?: unknown; durationMinutes?: unknown; sourceText?: unknown; questionTypes?: unknown };
    const subject = requireText(body.subject, "Subject", 180);
    const topics = requireText(body.topics, "Topics", 2500);
    const totalMarks = requireInteger(body.totalMarks ?? 75, "Total marks", 20, 300);
    const durationMinutes = requireInteger(body.durationMinutes ?? 180, "Duration", 15, 360);
    const sourceText = optionalText(body.sourceText, "Previous paper text", 30_000);
    const questionTypes = Array.isArray(body.questionTypes) ? body.questionTypes.filter((item): item is string => typeof item === "string").slice(0, 6) : ["short answer", "long answer", "application-based"];
    const paper = await generateJSON({
      instructions: "You are an academic assessment-paper designer. Generate a practice/model paper, not a prediction or guarantee of future exam questions. Output JSON only with title, instructions, totalMarks, durationMinutes, sections. Each section has name, marks, questions. Each question has number, text, marks, type. Ensure marks across all questions add up exactly to totalMarks. Use clear, syllabus-aligned wording and do not copy long passages from any source paper.",
      prompt: `Create a model question paper for subject: ${subject}. Topics/syllabus: ${topics}. Total marks: ${totalMarks}. Duration: ${durationMinutes} minutes. Question types: ${questionTypes.join(", ")}. ${sourceText ? `Use this previous-paper text only to understand format, recurring themes and difficulty; do not reproduce questions verbatim:\n${sourceText}` : "No previous paper supplied; use a balanced standard format."}`,
      fallback: (value) => {
        const parsed = validateModelPaper(value);
        const awarded = parsed.sections.reduce((sum, section) => sum + section.questions.reduce((subtotal, question) => subtotal + question.marks, 0), 0);
        if (awarded !== totalMarks) throw new ApiError(502, "The generated question marks do not add up to the requested total. Please retry.");
        return { ...parsed, totalMarks, durationMinutes };
      },
      maxOutputTokens: 3500,
    });
    return NextResponse.json({ paper });
  } catch (error) { return jsonError(error); }
}
