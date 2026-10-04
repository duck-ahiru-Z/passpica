export function GET() {
  return Response.json({
    has_measurement_id: Boolean(process.env.GA4_MEASUREMENT_ID),
    has_api_secret: Boolean(process.env.GA4_API_SECRET),
    has_public_measurement_id: Boolean(process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID),
  });
}
