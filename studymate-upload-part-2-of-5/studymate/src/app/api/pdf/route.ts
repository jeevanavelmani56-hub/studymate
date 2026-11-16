import { NextResponse } from "next/server";
import pdf from "pdf-parse";
import { enforceRateLimit, jsonError, ApiError } from "@/lib/server";

export const runtime = "nodejs";
export const maxDuration = 30;
const MAX_PDF_BYTES = 3.5 * 1024 * 1024;
const MAX_TEXT_CHARS = 45_000;

export async function POST(request: Request) {
  try {
    enforceRateLimit(request, "pdf");
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) throw new ApiError(400, "Choose a PDF file to upload.");
    if (file.type !== "application/pdf" || !file.name.toLowerCase().endsWith(".pdf")) throw new ApiError(415, "Only PDF documents are supported.");
    if (file.size < 8 || file.size > MAX_PDF_BYTES) throw new ApiError(413, "PDF must be smaller than 3.5 MB for direct upload. Use private object storage for larger files.");

    const bytes = Buffer.from(await file.arrayBuffer());
    if (bytes.subarray(0, 5).toString("ascii") !== "%PDF-") throw new ApiError(400, "The uploaded file does not appear to be a valid PDF.");
    let parsed: { text?: string; numpages?: number };
    try { parsed = await pdf(bytes, { max: 40 }); }
    catch { throw new ApiError(422, "The PDF could not be read. Try exporting it again or use a text-based PDF."); }
    const extractedText = (parsed.text || "").replace(/\u0000/g, " ").replace(/[ \t]+\n/g, "\n").trim().slice(0, MAX_TEXT_CHARS);
    if (extractedText.length < 40) throw new ApiError(422, "No readable text was found. Scanned PDFs need OCR before they can be studied.");

    return NextResponse.json({ document: { name: file.name.slice(0, 180), pages: parsed.numpages || null, text: extractedText, truncated: (parsed.text || "").length > MAX_TEXT_CHARS } });
  } catch (error) { return jsonError(error); }
}
