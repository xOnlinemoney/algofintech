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
const AGENCY_PATHS = ["/dashboard", "/agency-login"];

// All paths that belong exclusively to the client subdomain
const CLIENT_PATHS = ["/client-dashboard", "/client-login"];

function isAgencyPath(pathname: string): boolean {
  return AGENCY_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
}

function isClientPath(pathname: string): boolean {
  return CLIENT_PATHS.some(
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

  // Determine subdomain
  const isAgencySubdomain =
    hostname.startsWith("agency.") ||
    hostname.startsWith("agency-"); // Vercel preview URLs use dashes

  const isClientSubdomain =
    hostname.startsWith("client.") ||
    hostname.startsWith("client-"); // Vercel preview URLs use dashes

  if (isAgencySubdomain) {
    // Root on agency subdomain → redirect to /dashboard
    if (pathname === "/") {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }
    // On agency subdomain — only allow agency paths
    if (isAgencyPath(pathname)) {
      return NextResponse.next();
    }
    // Redirect non-agency paths to main domain
    const mainDomain = hostname.replace(/^agency[-.]/, "");
    const url = request.nextUrl.clone();
    url.host = mainDomain;
    return NextResponse.redirect(url);
  } else if (isClientSubdomain) {
    // Root on client subdomain → redirect to /client-dashboard
    if (pathname === "/") {
      const url = request.nextUrl.clone();
      url.pathname = "/client-dashboard";
      return NextResponse.redirect(url);
    }
    // On client subdomain — only allow client paths
    if (isClientPath(pathname)) {
      return NextResponse.next();
    }
    // Redirect non-client paths to main domain
    const mainDomain = hostname.replace(/^client[-.]/, "");
    const url = request.nextUrl.clone();
    url.host = mainDomain;
    return NextResponse.redirect(url);
  } else {
    // On main domain — block agency and client paths
    if (isAgencyPath(pathname)) {
      const url = request.nextUrl.clone();
      url.host = `agency.${hostname}`;
      return NextResponse.redirect(url);
    }
    if (isClientPath(pathname)) {
      const url = request.nextUrl.clone();
      url.host = `client.${hostname}`;
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }
}

export const config = {
  // Run on all routes except static assets
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
