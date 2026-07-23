import { NextResponse, type NextRequest } from "next/server";
import { SITE } from "@/content/sections";

// The site serves from both sunnyavula.com and the *.workers.dev origin.
// Permanently redirect any workers.dev request to the same path + query on
// the production domain so search engines see exactly one origin.
export function middleware(request: NextRequest) {
  // Use the Host header, not nextUrl.hostname — Next normalizes the latter
  // to the server's own origin in some runtimes, hiding the requested host.
  const host = (request.headers.get("host") ?? "").split(":")[0];
  if (host.endsWith(".workers.dev")) {
    const { nextUrl } = request;
    const url = new URL(nextUrl.pathname + nextUrl.search, SITE.url);
    return NextResponse.redirect(url, 301);
  }
  return NextResponse.next();
}
