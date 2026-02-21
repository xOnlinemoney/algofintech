import { NextRequest, NextResponse } from "next/server";

/**
 * Subdomain Routing Middleware
 *
 * Routes requests based on subdomain:
 *   - agency.* → /dashboard and all future agency routes
 *   - www.* / root → marketing pages (/, /individual, etc.)
 *
 * Agency-only paths are defined below. Any request to these paths
 * from a non-agency subdomain gets redirected to the main site.
 * Any request to the agency subdomain for non-agency paths gets
 * redirected to the main site too.
 */

// All paths that belong exclusively to the agency subdomain
const AGENCY_PATHS = ["/dashboard"];

function isAgencyPath(pathname: string): boolean {
  return AGENCY_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
}

export function middleware(request: NextRequest) {
  const hostname = request.headers.get("host") || "";
  const { pathname } = request.nextUrl;

  // Skip Next.js internals and static files
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".") // static files (.js, .css, .ico, etc.)
  ) {
    return NextResponse.next();
  }

  // Allow everything on localhost / dev — no subdomain enforcement
  if (
    hostname.includes("localhost") ||
    hostname.includes("127.0.0.1") ||
    hostname.startsWith("192.168.")
  ) {
    return NextResponse.next();
  }

  // Determine if this is the agency subdomain
  // Matches: agency.example.com, agency.example.co.uk
  const isAgencySubdomain =
    hostname.startsWith("agency.") ||
    hostname.startsWith("agency-"); // Vercel preview URLs use dashes

  if (isAgencySubdomain) {
    // On agency subdomain — only allow agency paths
    if (isAgencyPath(pathname)) {
      return NextResponse.next();
    }
    // Redirect non-agency paths to main domain
    const mainDomain = hostname.replace(/^agency[-.]/, "");
    const url = request.nextUrl.clone();
    url.host = mainDomain;
    return NextResponse.redirect(url);
  } else {
    // On main domain — block agency paths
    if (isAgencyPath(pathname)) {
      // Redirect to agency subdomain
      const url = request.nextUrl.clone();
      url.host = `agency.${hostname}`;
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }
}

export const config = {
  // Run on all routes except static assets
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
