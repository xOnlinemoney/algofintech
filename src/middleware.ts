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
const AGENCY_PATHS = ["/dashboard", "/agency-login", "/agency-signup"];

// All paths that belong exclusively to the client subdomain
const CLIENT_PATHS = ["/client-dashboard", "/client-login", "/client-signup"];

// All paths that belong exclusively to the admin subdomain
const ADMIN_PATHS = ["/admin-login", "/admin-dashboard"];

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

function isAdminPath(pathname: string): boolean {
  return ADMIN_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
}

// Known AlgoFinTech domains — anything else could be a custom domain
const KNOWN_HOSTS = ["algofintech.com", "vercel.app"];

function isKnownHost(hostname: string): boolean {
  return KNOWN_HOSTS.some(
    (h) => hostname === h || hostname.endsWith("." + h)
  );
}

export async function middleware(request: NextRequest) {
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

  const isAdminSubdomain =
    hostname.startsWith("admin.") ||
    hostname.startsWith("admin-"); // Vercel preview URLs use dashes

  if (isAdminSubdomain) {
    // Root on admin subdomain → redirect to /dashboard
    if (pathname === "/") {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }
    // /dashboard on admin subdomain → rewrite to /admin-dashboard
    if (pathname === "/dashboard" || pathname.startsWith("/dashboard/")) {
      const url = request.nextUrl.clone();
      url.pathname = pathname.replace("/dashboard", "/admin-dashboard");
      return NextResponse.rewrite(url);
    }
    // On admin subdomain — only allow admin paths
    if (isAdminPath(pathname)) {
      return NextResponse.next();
    }
    // Redirect non-admin paths to main domain
    const mainDomain = hostname.replace(/^admin[-.]/, "");
    const url = request.nextUrl.clone();
    url.host = mainDomain;
    return NextResponse.redirect(url);
  } else if (isAgencySubdomain) {
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
  } else if (!isKnownHost(hostname)) {
    // ── Custom domain resolution ──────────────────────────────
    // Hostname is not a known subdomain or our main domain.
    // Check if it's a custom agency domain via the domain-lookup API.
    try {
      const protocol = request.headers.get("x-forwarded-proto") || "https";
      const baseOrigin = `${protocol}://${hostname}`;
      const lookupUrl = `${baseOrigin}/api/agency/domain-lookup?domain=${encodeURIComponent(hostname)}`;

      const res = await fetch(lookupUrl, {
        headers: { "x-internal-lookup": "1" },
        signal: AbortSignal.timeout(3000),
      });

      if (res.ok) {
        const data = await res.json();

        // Treat this like a client subdomain
        if (pathname === "/") {
          const url = request.nextUrl.clone();
          url.pathname = "/client-dashboard";
          const response = NextResponse.redirect(url);
          response.headers.set("x-agency-id", data.agency_id || "");
          response.headers.set("x-agency-slug", data.agency_slug || "");
          return response;
        }

        // Allow client paths + login/signup
        if (isClientPath(pathname)) {
          const response = NextResponse.next();
          response.headers.set("x-agency-id", data.agency_id || "");
          response.headers.set("x-agency-slug", data.agency_slug || "");
          return response;
        }

        // Block non-client paths on custom domain
        const url = request.nextUrl.clone();
        url.pathname = "/client-dashboard";
        return NextResponse.redirect(url);
      }
    } catch (e) {
      // Lookup failed or timed out — fall through to main domain behavior
      console.error("Custom domain lookup failed:", e);
    }

    // If domain lookup failed or returned 404, treat as main domain
    if (isAgencyPath(pathname)) {
      return NextResponse.next();
    }
    if (isClientPath(pathname)) {
      return NextResponse.next();
    }
    return NextResponse.next();
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
    if (isAdminPath(pathname)) {
      const url = request.nextUrl.clone();
      url.host = `admin.${hostname}`;
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }
}

export const config = {
  // Run on all routes except static assets
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
