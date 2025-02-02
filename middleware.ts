import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { default as nextAuthMiddleware } from "next-auth/middleware";

export { nextAuthMiddleware }; // Export the default next-auth middleware

export async function middleware(request: NextRequest) {
    const token = await getToken({ req: request });
    const url = request.nextUrl;

    // Redirect authenticated users to /chat if they try to access sign-in or sign-up pages
    if (token && (url.pathname.startsWith('/auth/signin') || url.pathname.startsWith('/auth/signup'))) {
        return NextResponse.redirect(new URL('/chat', request.url));
    }

    // Redirect unauthenticated users to /auth/signin if they try to access restricted pages
    if (!token && (url.pathname.startsWith('/chat') || url.pathname.startsWith('/settings') || url.pathname.startsWith('/user-data'))) {
        return NextResponse.redirect(new URL('/auth/signin', request.url));
    }

    // Proceed with the request if no redirect is necessary
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
