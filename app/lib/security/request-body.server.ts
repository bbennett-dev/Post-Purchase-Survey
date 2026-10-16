export class RequestBodyTooLargeError extends Error {
  constructor(public readonly maxBytes: number) {
    super(`Request body exceeds ${maxBytes} bytes`);
    this.name = "RequestBodyTooLargeError";
  }
}

/**
 * Reads the request body up to maxBytes (streaming-safe when Content-Length is absent).
 */
export async function readRequestTextWithLimit(
  request: Request,
  maxBytes: number,
): Promise<string> {
  const contentLength = request.headers.get("content-length");
  if (contentLength) {
    const length = Number(contentLength);
    if (!Number.isNaN(length) && length > maxBytes) {
      throw new RequestBodyTooLargeError(maxBytes);
    }
  }

  const body = request.body;
  if (!body) {
    return "";
  }

  const reader = body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;

  for (;;) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }
    if (!value?.length) {
      continue;
    }
    total += value.length;
    if (total > maxBytes) {
      await reader.cancel();
      throw new RequestBodyTooLargeError(maxBytes);
    }
    chunks.push(value);
  }

  const merged = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    merged.set(chunk, offset);
    offset += chunk.length;
  }

  return new TextDecoder().decode(merged);
}

export async function readJsonBodyWithLimit<T>(
  request: Request,
  maxBytes: number,
): Promise<T> {
  const text = await readRequestTextWithLimit(request, maxBytes);
  if (!text.trim()) {
    throw new SyntaxError("Empty JSON body");
  }
  return JSON.parse(text) as T;
}
