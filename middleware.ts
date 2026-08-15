import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

function getDashboardUrlByRole(role: string): string {
  switch (role) {
    case "ADMIN":
      return "/dashboard/admin/courses";
    case "ADMIN_ASSISTANT":
      return "/dashboard/admin-assistant/management";
    case "STUDENT":
    default:
      return "/dashboard";
  }
}

/**
 * Forward host for server-side tenant resolution.
 * Do not import Prisma / Neon here — they blow past the Edge 1 MB limit.
 */
function nextWithTenantHost(req: NextRequest) {
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-tenant-host", req.headers.get("host") ?? "");

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export async function middleware(req: NextRequest) {
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // Backwards-compatible route redirects (old URLs)
  if (req.nextUrl.pathname.startsWith("/dashboard/teacher")) {
    const nextPath = req.nextUrl.pathname.replace(
      "/dashboard/teacher",
      "/dashboard/admin"
    );
    const url = req.nextUrl.clone();
    url.pathname = nextPath;
    return NextResponse.redirect(url);
  }

  const isAdminRoute = req.nextUrl.pathname.startsWith("/dashboard/admin");
  const isAdmin = token?.role === "ADMIN";
  const isAdminAssistantRoute = req.nextUrl.pathname.startsWith(
    "/dashboard/admin-assistant"
  );
  const isAdminAssistant = token?.role === "ADMIN_ASSISTANT";

  // If an admin assistant hits old admin URLs, send to admin-assistant
  if (isAdminAssistant && isAdminRoute && !isAdminAssistantRoute) {
    const nextPath = req.nextUrl.pathname.replace(
      "/dashboard/admin",
      "/dashboard/admin-assistant"
    );
    const url = req.nextUrl.clone();
    url.pathname = nextPath;
    return NextResponse.redirect(url);
  }

  const isAuthPage =
    req.nextUrl.pathname.startsWith("/sign-in") ||
    req.nextUrl.pathname.startsWith("/sign-up") ||
    req.nextUrl.pathname.startsWith("/forgot-password") ||
    req.nextUrl.pathname.startsWith("/reset-password") ||
    req.nextUrl.pathname.startsWith("/device-conflict");

  const isPaymentStatusPage = req.nextUrl.pathname.includes("/payment-status");

  if (isAuthPage && token) {
    const userRole = (token.role as string) || "STUDENT";
    return NextResponse.redirect(
      new URL(getDashboardUrlByRole(userRole), req.url)
    );
  }

  if (!token && !isAuthPage && !isPaymentStatusPage) {
    return NextResponse.redirect(new URL("/sign-in", req.url), {
      status: 302,
    });
  }

  if (isAdminRoute && !(isAdmin || isAdminAssistant)) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  if (isAdminAssistantRoute && !isAdminAssistant) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  if (req.nextUrl.pathname === "/dashboard" && token) {
    const userRole = (token.role as string) || "STUDENT";
    if (userRole !== "STUDENT") {
      return NextResponse.redirect(
        new URL(getDashboardUrlByRole(userRole), req.url)
      );
    }
  }

  if (isPaymentStatusPage && req.method === "POST") {
    return NextResponse.redirect(req.url, { status: 303 });
  }

  return nextWithTenantHost(req);
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|teacher-image.png|logo.png|male.png|medal.png|graduation-hat.png|notebook.png|eng.png|australia.png|new-zealand.png|europe.png|asia.png|africa.png|south-america.png|north-america.png|oceania.png|antarctica.png|atom.png|sodium.png|music.png|tiktok.png|facebook.png|instagram.png|twitter.png|youtube.png|linkedin.png|).*)",
  ],
};
