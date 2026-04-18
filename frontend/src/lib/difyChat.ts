/**
 * Dify advanced-chat (e.g. Agnes) — POST {base}/chat-messages.
 * Keys are Vite-exposed (VITE_*) and ship in the client bundle; use only for public app keys.
 */

export function isDifyConfigured(): boolean {
  const key = import.meta.env.VITE_DIFY_API_KEY as string | undefined;
  const base = import.meta.env.VITE_DIFY_BASE_URL as string | undefined;
  return Boolean(key?.trim() && base?.trim());
}

function difyBaseUrl(): string {
  return String(import.meta.env.VITE_DIFY_BASE_URL ?? "").replace(/\/$/, "");
}

function difyApiKey(): string {
  return String(import.meta.env.VITE_DIFY_API_KEY ?? "").trim();
}

export type DifyChatResult = {
  answer: string;
  conversationId: string;
};

/**
 * Sends one user message. Pass the previous `conversation_id` (if any) to keep context.
 */
export async function postDifyChatMessage(
  query: string,
  conversationId: string,
): Promise<DifyChatResult> {
  const base = difyBaseUrl();
  const key = difyApiKey();
  if (!base || !key) {
    throw new Error("Dify is not configured (set VITE_DIFY_API_KEY and VITE_DIFY_BASE_URL).");
  }

  const url = `${base}/chat-messages`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      inputs: {},
      query,
      response_mode: "blocking",
      conversation_id: conversationId || "",
      user: "demo-user",
    }),
  });

  const text = await res.text();
  let data: Record<string, unknown>;
  try {
    data = text ? (JSON.parse(text) as Record<string, unknown>) : {};
  } catch {
    throw new Error(text || `Dify request failed (${res.status})`);
  }

  if (!res.ok) {
    const msg =
      typeof data.message === "string"
        ? data.message
        : typeof data.code === "string"
          ? `${data.code}: ${String(data.message ?? text)}`
          : text || `Dify error (${res.status})`;
    throw new Error(msg);
  }

  const answer = data.answer;
  if (typeof answer !== "string") {
    throw new Error("Dify response did not include a string answer.");
  }

  const cid = data.conversation_id;
  const nextId = typeof cid === "string" ? cid : conversationId;

  return { answer, conversationId: nextId };
}
