import { buildLlmsTxt } from "@/lib/llmsTxt";

// Static: the content is derived from build-time data and never varies per request.
export const dynamic = "force-static";

export function GET() {
  return new Response(buildLlmsTxt(), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, must-revalidate",
    },
  });
}
