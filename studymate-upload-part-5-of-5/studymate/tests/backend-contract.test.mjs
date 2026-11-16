import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { access } from "node:fs/promises";

const routes = [
  "src/app/api/chat/route.ts",
  "src/app/api/pdf/route.ts",
  "src/app/api/pdf/ask/route.ts",
  "src/app/api/mindmap/route.ts",
  "src/app/api/quiz/route.ts",
  "src/app/api/model-paper/route.ts",
];

test("all StudyMate API route handlers exist and expose POST", async () => {
  for (const route of routes) {
    await access(new URL(`../${route}`, import.meta.url));
    const source = await readFile(new URL(`../${route}`, import.meta.url), "utf8");
    assert.match(source, /export async function POST\(/, `${route} should export POST`);
    assert.match(source, /enforceRateLimit\(request/, `${route} should apply request throttling`);
    assert.match(source, /jsonError\(error\)/, `${route} should return normalized API errors`);
  }
});

test("AI provider credentials are read only by server-side code", async () => {
  const aiSource = await readFile(new URL("../src/lib/ai.ts", import.meta.url), "utf8");
  const envExample = await readFile(new URL("../.env.example", import.meta.url), "utf8");
  assert.match(aiSource, /process\.env\.OPENAI_API_KEY/);
  assert.match(envExample, /^OPENAI_API_KEY=/m);
  assert.doesNotMatch(envExample, /NEXT_PUBLIC_OPENAI_API_KEY/);
});

test("PDF route enforces a conservative direct-upload cap and PDF signature", async () => {
  const source = await readFile(new URL("../src/app/api/pdf/route.ts", import.meta.url), "utf8");
  assert.match(source, /3\.5 \* 1024 \* 1024/);
  assert.match(source, /%PDF-/);
  assert.match(source, /application\/pdf/);
});

test("first-run onboarding requests a display name and optional Google account email without a password field", async () => {
  const source = await readFile(new URL("../src/components/WelcomeGate.tsx", import.meta.url), "utf8");
  assert.match(source, /What should we call you\?/);
  assert.match(source, /Google ID \/ account email/);
  assert.match(source, /type="email"/);
  assert.doesNotMatch(source, /type="password"/);
  assert.match(source, /localStorage\.setItem\([\'\"]studymate-profile[\'\"]/);
});

test("AI endpoints do not expose provider credentials through public environment variables", async () => {
  const sources = await Promise.all([
    "src/lib/ai.ts", "src/app/api/chat/route.ts", "src/app/api/pdf/ask/route.ts",
    "src/app/api/mindmap/route.ts", "src/app/api/quiz/route.ts", "src/app/api/model-paper/route.ts",
  ].map((path) => readFile(new URL(`../${path}`, import.meta.url), "utf8")));
  assert.match(sources[0], /process\.env\.OPENAI_API_KEY/);
  for (const source of sources) assert.doesNotMatch(source, /NEXT_PUBLIC_OPENAI_API_KEY/);
});
