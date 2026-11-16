# StudyMate

A responsive AI-powered study companion built with Next.js App Router, React, TypeScript, Tailwind CSS, and Lucide React. This version adds server-side AI endpoints for chat, PDF extraction and Q&A, mind maps, quizzes, and model question papers.

## Requirements

- Node.js 20.9 or newer
- npm
- An OpenAI API key with API access and billing/usage configured

## Install and run

```bash
npm install
cp .env.example .env.local
```

Open `.env.local` and add your server-side key:

```env
OPENAI_API_KEY=your_real_key_here
OPENAI_MODEL=gpt-5.5
```

Never use a `NEXT_PUBLIC_` prefix for the AI key. Never commit `.env.local` to Git.

Then run:

```bash
npm run dev
```

Open http://localhost:3000.

## API routes

All routes are Next.js App Router Route Handlers and accept `POST` requests. They call the AI provider only from server-side code.

| Endpoint | Request | Response |
|---|---|---|
| `POST /api/chat` | `{ message, history?, documentContext? }` | `{ answer }` |
| `POST /api/pdf` | `multipart/form-data` with `file` | `{ document: { name, pages, text, truncated } }` |
| `POST /api/pdf/ask` | `{ question, documentText, documentName? }` | `{ answer }` |
| `POST /api/mindmap` | `{ topic, level?, detail? }` | `{ mindMap: { title, centralIdea, branches } }` |
| `POST /api/quiz` | `{ topic, count?, difficulty?, level? }` | `{ quiz: { title, questions } }` |
| `POST /api/model-paper` | `{ subject, topics, totalMarks?, durationMinutes?, sourceText?, questionTypes? }` | `{ paper }` |

### Example requests

Chat:

```bash
curl http://localhost:3000/api/chat \
  -H 'Content-Type: application/json' \
  -d '{"message":"Explain binary search with an example"}'
```

Quiz:

```bash
curl http://localhost:3000/api/quiz \
  -H 'Content-Type: application/json' \
  -d '{"topic":"Operating systems process scheduling","count":5,"difficulty":"medium"}'
```

PDF upload:

```bash
curl http://localhost:3000/api/pdf \
  -F 'file=@lecture-notes.pdf'
```

## PDF upload and Vercel limits

The direct PDF endpoint accepts PDF files up to **3.5 MB** and extracts text from up to 40 pages. It returns at most 45,000 characters to the browser. Scanned/image-only PDFs need OCR, which is not included in this starter.

Vercel Functions have a 4.5 MB request-body limit. For larger files, do not proxy the file through a Route Handler. Upload directly from the browser to private object storage (for example, a private Vercel Blob store or S3-compatible bucket) using a short-lived, server-authorized upload token. Then process the stored object asynchronously and persist extracted text/chunks in a database or vector store.

The current PDF flow keeps extracted text in the browser session and sends it back to `/api/pdf/ask`. It does not persist the source PDF or extracted text.

## Security and production checklist

This is a functional starter, not a finished multi-user production backend. Before public launch:

1. Add authentication and authorize every route against the signed-in user.
2. Replace the in-memory per-process rate limiter in `src/lib/server.ts` with a shared Redis-backed limiter (for example, Upstash). In-memory limits reset on cold starts and do not coordinate across serverless instances.
3. Add request quotas and usage metering per account to prevent unexpected AI spend.
4. Store PDFs in private object storage; encrypt data at rest and define deletion/retention controls.
5. Add database records for documents, chats, quizzes, attempts, generated maps, and model papers. Scope every query by authenticated user ID.
6. Add malware scanning and OCR for uploaded files where appropriate.
7. Add observability that never logs API keys, document contents, or student personal data.
8. Configure a restrictive Content Security Policy and deployment secrets in Vercel Project Settings.
9. Add moderation/abuse controls and clear user-facing AI limitations. Generated model papers are practice material, not predictions of actual exam questions.

The basic rate limiter in this starter is a development safeguard only. Route handlers are public endpoints unless you add authentication.

## Verification

```bash
npm test
npm run typecheck
npm run build
```

The contract tests verify that the route handlers exist, apply shared request throttling, and keep provider credentials server-side. Full integration tests require a configured AI key and should be run against a non-production environment.

## Deploy to Vercel

1. Push the project to GitHub.
2. Import the repository into Vercel.
3. Add `OPENAI_API_KEY` and optionally `OPENAI_MODEL` in Project Settings → Environment Variables.
4. Deploy and verify the API routes in a preview deployment.
5. Add authentication, shared rate limiting, storage, and persistence before opening the app to public traffic.

## Project structure

```text
src/
├── app/
│   ├── api/
│   │   ├── chat/route.ts
│   │   ├── pdf/route.ts
│   │   ├── pdf/ask/route.ts
│   │   ├── mindmap/route.ts
│   │   ├── quiz/route.ts
│   │   └── model-paper/route.ts
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── dashboard/
│   └── tools/
└── lib/
    ├── ai.ts
    ├── ai-schemas.ts
    ├── api-client.ts
    ├── server.ts
    ├── data.ts
    └── utils.ts
```
