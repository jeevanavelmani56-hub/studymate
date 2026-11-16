import { NextResponse } from "next/server";
import { generateJSON } from "@/lib/ai";
import { validateQuiz } from "@/lib/ai-schemas";
import { ApiError, enforceRateLimit, jsonError, requireEnum, requireInteger, requireText } from "@/lib/server";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    enforceRateLimit(request, "quiz");
    const body = await request.json() as { topic?: unknown; count?: unknown; difficulty?: unknown; level?: unknown };
    const topic = requireText(body.topic, "Topic", 240);
    const count = requireInteger(body.count ?? 5, "Question count", 3, 15);
    const difficulty = requireEnum(body.difficulty ?? "medium", "Difficulty", ["easy", "medium", "hard"] as const);
    const level = typeof body.level === "string" ? body.level.slice(0, 80) : "Undergraduate";
    const quiz = await generateJSON({
      instructions: "You are an assessment designer. Generate fair, unambiguous multiple-choice questions. Output JSON only with title and questions. Every question must have exactly four options, answerIndex from 0 to 3, and a concise explanation. Exactly one option must be correct.",
      prompt: `Create exactly ${count} ${difficulty}-difficulty MCQs about ${topic} for ${level} students. Avoid trick questions.`,
      fallback: (value) => {
        const parsed = validateQuiz(value);
        if (parsed.questions.length !== count) throw new ApiError(502, "The generated question count did not match the request. Please retry.");
        return parsed;
      },
      maxOutputTokens: 2400,
    });
    return NextResponse.json({ quiz });
  } catch (error) { return jsonError(error); }
}
