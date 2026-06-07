type RateLimitBucket = {
  id: string;
  limit: number;
  windowMs: number;
};

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const rateLimitStore = new Map<string, RateLimitEntry>();

export class RequestGuardError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "RequestGuardError";
    this.status = status;
  }
}

export function guardedJsonError(error: unknown, fallbackMessage: string, fallbackStatus = 500) {
  if (error instanceof RequestGuardError) {
    return {
      status: error.status,
      body: { error: error.message }
    };
  }

  return {
    status: fallbackStatus,
    body: { error: fallbackMessage }
  };
}

export async function readLimitedJson<T = unknown>(request: Request, maxBytes: number): Promise<T> {
  const contentType = request.headers.get("content-type") || "";
  if (contentType.toLowerCase().split(";")[0].trim() !== "application/json") {
    throw new RequestGuardError(415, "Expected application/json request body.");
  }

  const contentLength = Number(request.headers.get("content-length") || "0");
  if (Number.isFinite(contentLength) && contentLength > maxBytes) {
    throw new RequestGuardError(413, "Request body is too large.");
  }

  const body = request.body;
  if (!body) {
    return parseJsonText(await request.text(), maxBytes) as T;
  }

  const reader = body.getReader();
  const chunks: Uint8Array[] = [];
  let received = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    received += value.byteLength;
    if (received > maxBytes) {
      throw new RequestGuardError(413, "Request body is too large.");
    }
    chunks.push(value);
  }

  const buffer = new Uint8Array(received);
  let offset = 0;
  chunks.forEach((chunk) => {
    buffer.set(chunk, offset);
    offset += chunk.byteLength;
  });

  return parseJsonText(new TextDecoder().decode(buffer), maxBytes) as T;
}

function parseJsonText(text: string, maxBytes: number) {
  if (new TextEncoder().encode(text).byteLength > maxBytes) {
    throw new RequestGuardError(413, "Request body is too large.");
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    throw new RequestGuardError(400, "Request body must be valid JSON.");
  }
}

function clientKey(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const realIp = request.headers.get("x-real-ip")?.trim();
  return forwarded || realIp || "anonymous";
}

export function rateLimit(request: Request, bucket: RateLimitBucket, now = Date.now()) {
  const key = `${bucket.id}:${clientKey(request)}`;
  const current = rateLimitStore.get(key);

  if (!current || current.resetAt <= now) {
    rateLimitStore.set(key, {
      count: 1,
      resetAt: now + bucket.windowMs
    });
    return { ok: true, retryAfter: 0, remaining: bucket.limit - 1 };
  }

  if (current.count >= bucket.limit) {
    return {
      ok: false,
      retryAfter: Math.max(1, Math.ceil((current.resetAt - now) / 1000)),
      remaining: 0
    };
  }

  current.count += 1;
  return {
    ok: true,
    retryAfter: 0,
    remaining: bucket.limit - current.count
  };
}

export function rateLimitHeaders(result: ReturnType<typeof rateLimit>) {
  const headers: Record<string, string> = {
    "X-RateLimit-Remaining": String(result.remaining)
  };
  if (!result.ok) {
    headers["Retry-After"] = String(result.retryAfter);
  }
  return headers;
}

export function resetRateLimits() {
  rateLimitStore.clear();
}
