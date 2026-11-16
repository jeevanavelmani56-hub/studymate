import { NextResponse } from "next/server";
import { generateJSON } from "@/lib/ai";
import { validateMindMap } from "@/lib/ai-schemas";
import { enforceRateLimit, jsonError, requireText } from "@/lib/server";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    enforceRateLimit(request, "mindmap");
    const body = await request.json() as { topic?: unknown; level?: unknown; detail?: unknown };
    const topic = requireText(body.topic, "Topic", 240);
    const level = typeof body.level === "string" ? body.level.slice(0, 80) : "Undergraduate";
    const detail = body.detail === "detailed" ? "detailed" : "balanced";
    const mindMap = await generateJSON({
      instructions: "Create a pedagogically useful study mind map. Output JSON only with keys title, centralIdea, branches. Each branch has title and details (array of short strings). Make relationships logical and avoid unsupported claims.",
      prompt: `Create a ${detail} mind map for: ${topic}. Student level: ${level}. Return 4 to 7 branches with 2 to 4 details each.`,
      fallback: validateMindMap,
      maxOutputTokens: 1500,
    });
    return NextResponse.json({ mindMap });
  } catch (error) { return jsonError(error); }
}
