import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
export { default } from "next-auth/middleware"

export async function middleware(request: NextRequest) {
  // Use the secret from environment variables for token verification.
  const secret = process.env.NEXTAUTH_SECRET;
  const token = await getToken({ req: request, secret: secret });
  const { pathname } = request.nextUrl;

  // If an authenticated user is trying to access sign-in or sign-up pages, redirect them to /chat.
  if (token && (pathname.startsWith('/auth/signin') || pathname.startsWith('/auth/signup'))) {
    return NextResponse.redirect(new URL('/chat', request.url));
  }

  // If an unauthenticated user is trying to access protected routes, redirect them to /auth/signin.
  if (!token && (pathname.startsWith('/chat') || pathname.startsWith('/settings') || pathname.startsWith('/user-data'))) {
    return NextResponse.redirect(new URL('/auth/signin', request.url));
  }

  // Otherwise, proceed with the request.
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/auth/signin',
    '/auth/signup',
    '/chat',
    '/settings',
    '/user-data',
  ],
};
