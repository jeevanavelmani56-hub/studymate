export async function postJSON<T>(url: string, body: unknown): Promise<T> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const payload = await response.json().catch(() => ({})) as { error?: string } & T;
  if (!response.ok) throw new Error(payload.error || `Request failed (${response.status}).`);
  return payload;
}

export async function uploadPDF(file: File) {
  const form = new FormData();
  form.append("file", file);
  const response = await fetch("/api/pdf", { method: "POST", body: form });
  const payload = await response.json() as { error?: string; document?: { name: string; pages: number | null; text: string; truncated: boolean } };
  if (!response.ok || !payload.document) throw new Error(payload.error || "PDF processing failed.");
  return payload.document;
}
