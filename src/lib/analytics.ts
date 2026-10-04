"use client";

export type AnalyticsEventParams = Record<string, string | number | boolean>;

const MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID;
const ALLOWED_EVENT_PARAMS = new Set([
  "app_id",
  "tool_id",
  "tool_name",
  "page_location",
  "page_title",
]);

declare global {
  interface Window {
    dataLayer?: unknown[][];
    gtag?: (...args: unknown[]) => void;
  }
}

function sanitizeParams(params: AnalyticsEventParams | undefined): AnalyticsEventParams {
  if (!params) return {};
  return Object.fromEntries(
    Object.entries(params).filter(([key, value]) => {
      if (!ALLOWED_EVENT_PARAMS.has(key)) return false;
      return (typeof value === "string" && value.length > 0 && value.length <= 100) ||
        (typeof value === "number" && Number.isFinite(value)) ||
        typeof value === "boolean";
    }),
  );
}

export function trackEvent(eventName: string, params?: AnalyticsEventParams): void {
  if (!MEASUREMENT_ID || typeof window === "undefined" || typeof window.gtag !== "function") return;
  window.gtag("event", eventName, sanitizeParams(params));
}

export function trackPageView(url: string, title?: string): void {
  if (!MEASUREMENT_ID || typeof window === "undefined" || typeof window.gtag !== "function") return;
  window.gtag("event", "page_view", sanitizeParams({
    page_location: url,
    ...(title ? { page_title: title } : {}),
  }));
}
