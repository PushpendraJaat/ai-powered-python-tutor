import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  // This function is run after the authorized callback.
  function middleware(req) {
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;
        console.log("[Middleware] Checking authorization for:", pathname);
        console.log("[Middleware] Token:", token);

        // Public routes that don't require authentication.
        const publicRoutes = ["/auth/signin", "/auth/signup"];
        if (pathname.startsWith("/api/auth") || publicRoutes.includes(pathname)) {
          return true;
        }

        // Allow homepage access.
        if (pathname === "/") {
          return true;
        }

        // For all other routes, require a valid token.
        return Boolean(token);
      },
    },
    // If not authorized, the user will be redirected to /auth/signin.
    pages: {
      signIn: '/auth/signin',
    },
  }
);

export const config = {
  matcher: [
    // Apply middleware to all paths except the ones below.
    "/((?!api/auth|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
