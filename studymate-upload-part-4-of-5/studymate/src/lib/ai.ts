import { ApiError } from "@/lib/server";

type OutputFormat = "text" | "json_object";

function getConfig() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new ApiError(503, "AI service is not configured. Add OPENAI_API_KEY to your server environment.");
  return { apiKey, model: process.env.OPENAI_MODEL || "gpt-5.5" };
}

export async function generateAI(input: {
  instructions: string;
  prompt: string;
  format?: OutputFormat;
  maxOutputTokens?: number;
}) {
  const { apiKey, model } = getConfig();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 55_000);

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        instructions: input.instructions,
        input: input.prompt,
        max_output_tokens: input.maxOutputTokens ?? 1800,
        ...(input.format === "json_object" ? { text: { format: { type: "json_object" } } } : {}),
      }),
      signal: controller.signal,
      cache: "no-store",
    });

    const payload = await response.json() as {
      output_text?: string;
      output?: { type?: string; content?: { type?: string; text?: string }[] }[];
      error?: { message?: string };
    };

    if (!response.ok) {
      console.error("OpenAI request failed:", response.status, payload.error?.message || "Unknown provider error");
      if (response.status === 429) throw new ApiError(429, "AI usage is temporarily limited. Please try again shortly.");
      if (response.status === 401) throw new ApiError(503, "The server AI key is invalid. Check OPENAI_API_KEY.");
      throw new ApiError(502, "The AI provider could not complete this request.");
    }

    const text = payload.output_text || payload.output
      ?.filter((item) => item.type === "message")
      .flatMap((item) => item.content || [])
      .filter((item) => item.type === "output_text")
      .map((item) => item.text || "")
      .join("\n");
    if (!text) throw new ApiError(502, "The AI provider returned an empty response. Please try again.");
    return text;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (error instanceof Error && error.name === "AbortError") {
      throw new ApiError(504, "The AI request took too long. Please try a shorter prompt.");
    }
    throw new ApiError(502, "Unable to reach the AI provider. Please try again.");
  } finally {
    clearTimeout(timeout);
  }
}

export async function generateJSON<T>(input: {
  instructions: string;
  prompt: string;
  fallback: (value: unknown) => T;
  maxOutputTokens?: number;
}): Promise<T> {
  const raw = await generateAI({ ...input, format: "json_object" });
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new ApiError(502, "The AI returned an invalid structured response. Please retry.");
  }
  return input.fallback(parsed);
}
