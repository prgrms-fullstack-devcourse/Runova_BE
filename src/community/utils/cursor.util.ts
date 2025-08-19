type CursorPayload = { createdAt: string; id: number };

// Base64url helpers
const b64e = (s: string) => Buffer.from(s).toString("base64url");
const b64d = (s: string) => Buffer.from(s, "base64url").toString("utf8");

export function encodeCursor(createdAt: Date, id: number): string {
  const payload: CursorPayload = { createdAt: createdAt.toISOString(), id };
  return b64e(JSON.stringify(payload));
}

export function decodeCursor(cursor?: string): CursorPayload | null {
  if (!cursor) return null;
  try {
    const obj = JSON.parse(b64d(cursor)) as CursorPayload;
    if (!obj?.createdAt || typeof obj.id !== "number") return null;
    return obj;
  } catch {
    return null;
  }
}
