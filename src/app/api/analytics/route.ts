const ALLOWED_EVENTS = new Set([
  "page_view",
  "correction_start",
  "correction_success",
  "retry_start",
  "retry_success",
  "followup_question",
  "image_input",
]);

const ALLOWED_PARAMS = new Set([
  "app_id",
  "difficulty",
  "input_method",
  "max_score",
  "attempt_number",
  "input_type",
]);

const MAX_BODY_BYTES = 4096;
const MAX_STRING_LENGTH = 100;
const DEFAULT_MEASUREMENT_ID = "G-CR7H15LZZ8";

function corsHeaders(request: Request): HeadersInit {
  const origin = request.headers.get("origin");
  const headers: HeadersInit = { Vary: "Origin" };

  if (
    origin &&
    ((/^https:\/\/([a-z0-9-]+\.)*scf\.usercontent\.goog$/i.test(origin)) ||
      origin === "https://passpica.vercel.app" ||
      /^https?:\/\/localhost(?::\d+)?$/i.test(origin))
  ) {
    headers["Access-Control-Allow-Origin"] = origin;
    headers["Access-Control-Allow-Methods"] = "POST, OPTIONS";
    headers["Access-Control-Allow-Headers"] = "Content-Type";
    headers["Access-Control-Max-Age"] = "86400";
  }

  return headers;
}

function jsonResponse(body: Record<string, unknown>, status: number, request: Request) {
  return Response.json(body, { status, headers: corsHeaders(request) });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isSafeString(value: unknown): value is string {
  return typeof value === "string" && value.length > 0 && value.length <= MAX_STRING_LENGTH;
}

function isSafeNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && Number.isSafeInteger(value) && value >= 0;
}

export async function OPTIONS(request: Request) {
  return new Response(null, { status: 204, headers: corsHeaders(request) });
}

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type")?.split(";", 1)[0].trim().toLowerCase();
  const contentLength = Number(request.headers.get("content-length"));
  if (contentType !== "application/json") return jsonResponse({ ok: false, error: "invalid_content_type" }, 415, request);
  if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
    return jsonResponse({ ok: false, error: "payload_too_large" }, 413, request);
  }

  let rawBody: string;
  try {
    rawBody = await request.text();
  } catch {
    return jsonResponse({ ok: false, error: "invalid_json" }, 400, request);
  }
  if (new TextEncoder().encode(rawBody).byteLength > MAX_BODY_BYTES) {
    return jsonResponse({ ok: false, error: "payload_too_large" }, 413, request);
  }

  let body: unknown;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return jsonResponse({ ok: false, error: "invalid_json" }, 400, request);
  }

  if (!isRecord(body) || Object.keys(body).some((key) => !["event", "client_id", "session_id", "params"].includes(key))) {
    return jsonResponse({ ok: false, error: "invalid_payload" }, 400, request);
  }
  if (!isSafeString(body.event) || !ALLOWED_EVENTS.has(body.event)) {
    return jsonResponse({ ok: false, error: "invalid_event" }, 400, request);
  }
  if (!isSafeString(body.client_id)) return jsonResponse({ ok: false, error: "invalid_client_id" }, 400, request);
  if (!isSafeNumber(body.session_id)) return jsonResponse({ ok: false, error: "invalid_session_id" }, 400, request);
  if (!isRecord(body.params)) return jsonResponse({ ok: false, error: "invalid_params" }, 400, request);

  const params: Record<string, string | number> = {};
  for (const [key, value] of Object.entries(body.params)) {
    if (!ALLOWED_PARAMS.has(key)) return jsonResponse({ ok: false, error: "invalid_params" }, 400, request);
    if (typeof value === "string") {
      if (!isSafeString(value)) return jsonResponse({ ok: false, error: "invalid_params" }, 400, request);
      params[key] = value;
    } else if (isSafeNumber(value)) {
      params[key] = value;
    } else {
      return jsonResponse({ ok: false, error: "invalid_params" }, 400, request);
    }
  }

  const apiSecret = process.env.GA4_API_SECRET;
  if (!apiSecret) return jsonResponse({ ok: false, error: "analytics_unavailable" }, 500, request);

  const measurementId = process.env.GA4_MEASUREMENT_ID || DEFAULT_MEASUREMENT_ID;
  const endpoint = new URL("https://www.google-analytics.com/mp/collect");
  endpoint.searchParams.set("measurement_id", measurementId);
  endpoint.searchParams.set("api_secret", apiSecret);

  try {
    const gaResponse = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: body.client_id,
        events: [{
          name: body.event,
          params: { session_id: body.session_id, engagement_time_msec: 1, ...params },
        }],
      }),
      cache: "no-store",
    });
    if (!gaResponse.ok) return jsonResponse({ ok: false, error: "analytics_failed" }, 502, request);
  } catch {
    return jsonResponse({ ok: false, error: "analytics_failed" }, 502, request);
  }

  return jsonResponse({ ok: true }, 200, request);
}
